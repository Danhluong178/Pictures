/**
 * IndexedDB Wrapper for Pictures App
 * Comprehensive media, album, tag, and trash management
 */

const DB_NAME = 'PicturesMediaDB';
const DB_VERSION = 2;

export class MediaDB {
    constructor() {
        this.db = null;
        this.ready = this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = event => {
                console.error("Database error: ", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = event => {
                const db = event.target.result;

                // Store for Media Files
                if (!db.objectStoreNames.contains('media')) {
                    const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
                    mediaStore.createIndex('date', 'date', { unique: false });
                    mediaStore.createIndex('type', 'type', { unique: false });
                    mediaStore.createIndex('albumId', 'albumId', { unique: false });
                    mediaStore.createIndex('tags', 'tags', { multiEntry: true });
                    mediaStore.createIndex('name', 'name', { unique: false });
                    mediaStore.createIndex('size', 'size', { unique: false });
                }

                // Store for Albums
                if (!db.objectStoreNames.contains('albums')) {
                    const albumStore = db.createObjectStore('albums', { keyPath: 'id', autoIncrement: true });
                    albumStore.createIndex('name', 'name', { unique: false });
                    albumStore.createIndex('isPrivate', 'isPrivate', { unique: false });
                }

                // Store for Tags
                if (!db.objectStoreNames.contains('tags')) {
                    const tagStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
                    tagStore.createIndex('name', 'name', { unique: true });
                }

                // Store for Trash (30-day retention)
                if (!db.objectStoreNames.contains('trash')) {
                    const trashStore = db.createObjectStore('trash', { keyPath: 'id' });
                    trashStore.createIndex('deletedAt', 'deletedAt', { unique: false });
                }

                // Store for Settings
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Store for People (face tagging - optional feature)
                if (!db.objectStoreNames.contains('people')) {
                    const peopleStore = db.createObjectStore('people', { keyPath: 'id', autoIncrement: true });
                    peopleStore.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    // ============ MEDIA OPERATIONS ============

    async addMedia(file, metadata = {}) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['media'], 'readwrite');
            const store = transaction.objectStore('media');

            const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const mediaItem = {
                id: id,
                file: file,
                name: file.name,
                type: file.type.startsWith('image') ? 'image' : 'video',
                mimeType: file.type,
                size: file.size,
                date: metadata.date || new Date(),
                albumId: metadata.albumId || null,
                tags: metadata.tags || [],
                location: metadata.location || null,
                width: metadata.width || null,
                height: metadata.height || null,
                duration: metadata.duration || null,
                exif: metadata.exif || {},
                isFavorite: false,
                isHidden: false,
                editedVersion: null,
                originalId: null // For edited copies
            };

            const request = store.add(mediaItem);

            request.onsuccess = () => resolve(mediaItem);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllMedia(filter = {}) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['media'], 'readonly');
            const store = transaction.objectStore('media');
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result;

                // Apply filters
                if (filter.albumId !== undefined) {
                    results = results.filter(item => item.albumId === filter.albumId);
                }
                if (filter.type) {
                    results = results.filter(item => item.type === filter.type);
                }
                if (filter.tags && filter.tags.length > 0) {
                    results = results.filter(item =>
                        filter.tags.some(tag => item.tags.includes(tag))
                    );
                }
                if (filter.isHidden !== undefined) {
                    results = results.filter(item => item.isHidden === filter.isHidden);
                }
                if (filter.isFavorite !== undefined) {
                    results = results.filter(item => item.isFavorite === filter.isFavorite);
                }

                // Sort by date (newest first) by default
                results.sort((a, b) => new Date(b.date) - new Date(a.date));

                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getMediaById(id) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['media'], 'readonly');
            const store = transaction.objectStore('media');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateMedia(id, updates) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['media'], 'readwrite');
            const store = transaction.objectStore('media');

            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) {
                    reject(new Error('Item not found'));
                    return;
                }

                Object.assign(item, updates);
                const updateRequest = store.put(item);

                updateRequest.onsuccess = () => resolve(item);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteMedia(id, permanent = false) {
        await this.ready;

        if (permanent) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['media'], 'readwrite');
                const store = transaction.objectStore('media');
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } else {
            // Move to trash
            const item = await this.getMediaById(id);
            if (item) {
                await this.moveToTrash(item);
                return this.deleteMedia(id, true);
            }
        }
    }

    // ============ ALBUM OPERATIONS ============

    async createAlbum(name, options = {}) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['albums'], 'readwrite');
            const store = transaction.objectStore('albums');

            const album = {
                name: name,
                createdAt: new Date(),
                coverId: options.coverId || null,
                isPrivate: options.isPrivate || false,
                password: options.password || null,
                itemCount: 0
            };

            const request = store.add(album);
            request.onsuccess = () => {
                album.id = request.result;
                resolve(album);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllAlbums() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['albums'], 'readonly');
            const store = transaction.objectStore('albums');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateAlbum(id, updates) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['albums'], 'readwrite');
            const store = transaction.objectStore('albums');

            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const album = getRequest.result;
                if (!album) {
                    reject(new Error('Album not found'));
                    return;
                }

                Object.assign(album, updates);
                const updateRequest = store.put(album);

                updateRequest.onsuccess = () => resolve(album);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
        });
    }

    async deleteAlbum(id) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['albums'], 'readwrite');
            const store = transaction.objectStore('albums');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ============ TAG OPERATIONS ============

    async createTag(name, color = '#999999') {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tags'], 'readwrite');
            const store = transaction.objectStore('tags');

            const tag = { name, color, createdAt: new Date() };
            const request = store.add(tag);

            request.onsuccess = () => {
                tag.id = request.result;
                resolve(tag);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTags() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tags'], 'readonly');
            const store = transaction.objectStore('tags');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============ TRASH OPERATIONS ============

    async moveToTrash(mediaItem) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trash'], 'readwrite');
            const store = transaction.objectStore('trash');

            const trashItem = {
                ...mediaItem,
                deletedAt: new Date()
            };

            const request = store.put(trashItem);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTrash() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trash'], 'readonly');
            const store = transaction.objectStore('trash');
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result;
                // Filter out items older than 30 days
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const validItems = results.filter(item =>
                    new Date(item.deletedAt) > thirtyDaysAgo
                );
                resolve(validItems);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async restoreFromTrash(id) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trash', 'media'], 'readwrite');
            const trashStore = transaction.objectStore('trash');
            const mediaStore = transaction.objectStore('media');

            const getRequest = trashStore.get(id);
            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) {
                    reject(new Error('Item not found in trash'));
                    return;
                }

                // Remove trash metadata
                delete item.deletedAt;

                // Add back to media
                const addRequest = mediaStore.add(item);
                addRequest.onsuccess = () => {
                    // Remove from trash
                    trashStore.delete(id);
                    resolve(item);
                };
                addRequest.onerror = () => reject(addRequest.error);
            };
        });
    }

    async emptyTrash() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trash'], 'readwrite');
            const store = transaction.objectStore('trash');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ============ SETTINGS OPERATIONS ============

    async getSetting(key, defaultValue = null) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async setSetting(key, value) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ============ SEARCH ============

    async search(query, options = {}) {
        await this.ready;
        const allMedia = await this.getAllMedia();

        const lowerQuery = query.toLowerCase();
        let results = allMedia.filter(item => {
            // Search in filename
            if (item.name.toLowerCase().includes(lowerQuery)) return true;

            // Search in tags
            if (item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

            // Search in EXIF data
            if (item.exif && JSON.stringify(item.exif).toLowerCase().includes(lowerQuery)) return true;

            return false;
        });

        // Apply additional filters
        if (options.type) {
            results = results.filter(item => item.type === options.type);
        }
        if (options.dateFrom) {
            results = results.filter(item => new Date(item.date) >= new Date(options.dateFrom));
        }
        if (options.dateTo) {
            results = results.filter(item => new Date(item.date) <= new Date(options.dateTo));
        }
        if (options.minSize) {
            results = results.filter(item => item.size >= options.minSize);
        }
        if (options.maxSize) {
            results = results.filter(item => item.size <= options.maxSize);
        }

        return results;
    }

    // ============ STATISTICS ============

    async getStorageStats() {
        await this.ready;
        const allMedia = await this.getAllMedia();

        const stats = {
            totalItems: allMedia.length,
            totalSize: allMedia.reduce((sum, item) => sum + item.size, 0),
            imageCount: allMedia.filter(item => item.type === 'image').length,
            videoCount: allMedia.filter(item => item.type === 'video').length,
            imageSize: allMedia.filter(item => item.type === 'image').reduce((sum, item) => sum + item.size, 0),
            videoSize: allMedia.filter(item => item.type === 'video').reduce((sum, item) => sum + item.size, 0)
        };

        return stats;
    }
}

export const dbIndex = new MediaDB();

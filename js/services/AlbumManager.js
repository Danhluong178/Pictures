/**
 * Album Manager Service
 * Handles album operations
 */

import { dbIndex } from '../store/db.js';
import { Toast } from '../components/Toast.js';

class AlbumManager {
    async createAlbum(name, options = {}) {
        try {
            const album = await dbIndex.createAlbum(name, options);
            Toast.success('Album created');
            return album;
        } catch (error) {
            console.error('Failed to create album:', error);
            Toast.error('Failed to create album');
            throw error;
        }
    }

    async renameAlbum(albumId, newName) {
        try {
            await dbIndex.updateAlbum(albumId, { name: newName });
            Toast.success('Album renamed');
        } catch (error) {
            console.error('Failed to rename album:', error);
            Toast.error('Failed to rename album');
            throw error;
        }
    }

    async deleteAlbum(albumId, deleteMedia = false) {
        try {
            if (deleteMedia) {
                // Get all media in album and delete them
                const media = await dbIndex.getAllMedia({ albumId });
                for (const item of media) {
                    await dbIndex.deleteMedia(item.id);
                }
            } else {
                // Just remove album association from media
                const media = await dbIndex.getAllMedia({ albumId });
                for (const item of media) {
                    await dbIndex.updateMedia(item.id, { albumId: null });
                }
            }

            await dbIndex.deleteAlbum(albumId);
            Toast.success('Album deleted');
        } catch (error) {
            console.error('Failed to delete album:', error);
            Toast.error('Failed to delete album');
            throw error;
        }
    }

    async moveToAlbum(mediaIds, albumId) {
        try {
            for (const id of mediaIds) {
                await dbIndex.updateMedia(id, { albumId });
            }
            Toast.success(`Moved ${mediaIds.length} item(s)`);
        } catch (error) {
            console.error('Failed to move to album:', error);
            Toast.error('Failed to move items');
            throw error;
        }
    }

    async mergeAlbums(sourceAlbumIds, targetAlbumId) {
        try {
            for (const sourceId of sourceAlbumIds) {
                const media = await dbIndex.getAllMedia({ albumId: sourceId });
                for (const item of media) {
                    await dbIndex.updateMedia(item.id, { albumId: targetAlbumId });
                }
                await dbIndex.deleteAlbum(sourceId);
            }
            Toast.success('Albums merged');
        } catch (error) {
            console.error('Failed to merge albums:', error);
            Toast.error('Failed to merge albums');
            throw error;
        }
    }

    async getAlbumWithStats(albumId) {
        const album = await dbIndex.getAllAlbums().then(albums =>
            albums.find(a => a.id === albumId)
        );

        if (!album) return null;

        const media = await dbIndex.getAllMedia({ albumId });

        return {
            ...album,
            itemCount: media.length,
            coverUrl: media[0] ? URL.createObjectURL(media[0].file) : null
        };
    }

    async getAllAlbumsWithStats() {
        const albums = await dbIndex.getAllAlbums();
        const albumsWithStats = [];

        for (const album of albums) {
            const stats = await this.getAlbumWithStats(album.id);
            albumsWithStats.push(stats);
        }

        return albumsWithStats;
    }

    async updateAlbumCover(albumId, mediaId) {
        try {
            await dbIndex.updateAlbum(albumId, { coverId: mediaId });
        } catch (error) {
            console.error('Failed to update album cover:', error);
            throw error;
        }
    }
}

export const albumManager = new AlbumManager();

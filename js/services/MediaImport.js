/**
 * Media Import Service
 * Handles file importing, metadata extraction, and thumbnail generation
 */

import { dbIndex } from '../store/db.js';
import { Toast } from '../components/Toast.js';

class MediaImporter {
    constructor() {
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        this.supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
    }

    async importFiles(files, options = {}) {
        const results = {
            success: [],
            failed: []
        };

        for (const file of files) {
            try {
                const mediaItem = await this.processFile(file, options);
                results.success.push(mediaItem);
            } catch (error) {
                console.error(`Failed to import ${file.name}:`, error);
                results.failed.push({ file, error });
            }
        }

        // Show notification
        if (results.success.length > 0) {
            Toast.success(`Imported ${results.success.length} file(s)`);
        }
        if (results.failed.length > 0) {
            Toast.error(`Failed to import ${results.failed.length} file(s)`);
        }

        return results;
    }

    async processFile(file, options = {}) {
        // Validate file type
        if (!this.isSupported(file.type)) {
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Extract metadata
        const metadata = await this.extractMetadata(file);

        // Add to database
        const mediaItem = await dbIndex.addMedia(file, {
            ...metadata,
            ...options
        });

        return mediaItem;
    }

    isSupported(mimeType) {
        return this.supportedImageTypes.includes(mimeType) ||
            this.supportedVideoTypes.includes(mimeType);
    }

    async extractMetadata(file) {
        const metadata = {
            date: new Date(file.lastModified || Date.now()),
            size: file.size,
            mimeType: file.type
        };

        if (file.type.startsWith('image/')) {
            const imageMetadata = await this.extractImageMetadata(file);
            Object.assign(metadata, imageMetadata);
        } else if (file.type.startsWith('video/')) {
            const videoMetadata = await this.extractVideoMetadata(file);
            Object.assign(metadata, videoMetadata);
        }

        return metadata;
    }

    async extractImageMetadata(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const metadata = {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight
                };

                URL.revokeObjectURL(url);
                resolve(metadata);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({});
            };

            img.src = url;
        });
    }

    async extractVideoMetadata(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
                const metadata = {
                    width: video.videoWidth,
                    height: video.videoHeight,
                    duration: video.duration,
                    aspectRatio: video.videoWidth / video.videoHeight
                };

                URL.revokeObjectURL(url);
                resolve(metadata);
            };

            video.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({});
            };

            video.src = url;
        });
    }

    // Camera capture
    async captureFromCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            return new Promise((resolve, reject) => {
                // Create camera UI (simplified version)
                const video = document.createElement('video');
                video.srcObject = stream;
                video.autoplay = true;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // In a real implementation, show this in a modal
                // For now, auto-capture after 1 second
                setTimeout(() => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);

                    canvas.toBlob((blob) => {
                        stream.getTracks().forEach(track => track.stop());

                        if (blob) {
                            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                            resolve(file);
                        } else {
                            reject(new Error('Failed to capture image'));
                        }
                    }, 'image/jpeg', 0.95);
                }, 1000);
            });
        } catch (error) {
            console.error('Camera access denied:', error);
            Toast.error('Camera access denied');
            throw error;
        }
    }
}

export const mediaImporter = new MediaImporter();

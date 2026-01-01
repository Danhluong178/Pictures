/**
 * Share Manager Service
 * Handles media sharing and export
 */

import { Toast } from '../components/Toast.js';

class ShareManager {
    constructor() {
        this.supportsWebShare = 'share' in navigator;
    }

    async shareMedia(mediaItem) {
        const blob = mediaItem.file;
        const file = new File([blob], mediaItem.name, { type: blob.type });

        if (this.supportsWebShare) {
            try {
                await navigator.share({
                    files: [file],
                    title: mediaItem.name,
                    text: 'Shared from Pictures'
                });
                Toast.success('Shared successfully');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                    this.fallbackShare(mediaItem);
                }
            }
        } else {
            this.fallbackShare(mediaItem);
        }
    }

    async shareMultiple(mediaItems) {
        if (this.supportsWebShare && mediaItems.length <= 10) {
            try {
                const files = mediaItems.map(item =>
                    new File([item.file], item.name, { type: item.file.type })
                );

                await navigator.share({
                    files: files,
                    title: `${files.length} items from Pictures`,
                    text: 'Shared from Pictures'
                });
                Toast.success('Shared successfully');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                    Toast.info('Sharing multiple files not supported');
                }
            }
        } else {
            Toast.info('Please share files individually');
        }
    }

    fallbackShare(mediaItem) {
        // Create download link as fallback
        const url = URL.createObjectURL(mediaItem.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = mediaItem.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Toast.success('Download started');
    }

    async downloadMedia(mediaItem, quality = 'original') {
        let blob = mediaItem.file;

        if (quality !== 'original' && mediaItem.type === 'image') {
            blob = await this.compressImage(mediaItem.file, quality);
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mediaItem.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Toast.success('Download started');
    }

    async compressImage(blob, quality) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let scale = 1;
                if (quality === 'medium') scale = 0.7;
                if (quality === 'low') scale = 0.5;

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((compressedBlob) => {
                    URL.revokeObjectURL(url);
                    resolve(compressedBlob);
                }, 'image/jpeg', quality === 'low' ? 0.6 : 0.8);
            };

            img.src = url;
        });
    }

    async generateQRCode(mediaItem) {
        // Create data URL from media
        const url = URL.createObjectURL(mediaItem.file);

        // In a real implementation, use a QR code library
        // For now, just show the URL
        Toast.info('QR code generation requires additional library');

        return url;
    }

    async copyToClipboard(mediaItem) {
        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({
                    [mediaItem.file.type]: mediaItem.file
                });
                await navigator.clipboard.write([item]);
                Toast.success('Copied to clipboard');
            } else {
                Toast.error('Clipboard not supported');
            }
        } catch (error) {
            console.error('Copy failed:', error);
            Toast.error('Failed to copy');
        }
    }

    getShareableLink(mediaItem) {
        // In a real implementation, upload to server and get shareable link
        // For now, create a data URL
        const url = URL.createObjectURL(mediaItem.file);
        return url;
    }
}

export const shareManager = new ShareManager();

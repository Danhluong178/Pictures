/**
 * Enhanced Viewer with Full Features
 */

import { getIcon } from '../utils/icons.js';
import { dbIndex } from '../store/db.js';
import { shareManager } from '../services/ShareManager.js';
import { actionSheet } from '../components/ActionSheet.js';
import { modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { t } from '../utils/i18n.js';

export const Viewer = {
    currentItem: null,
    currentUrl: null,
    allItems: [],
    currentIndex: 0,
    scale: 1,
    translateX: 0,
    translateY: 0,

    init: () => {
        const overlay = document.getElementById('viewer-overlay');
        overlay.innerHTML = `
            <div class="viewer-header">
                <button id="viewer-close" class="btn-icon">
                    ${getIcon('x')}
                </button>
                <div class="viewer-title"></div>
                <button id="viewer-more" class="btn-icon">
                    ${getIcon('more')}
                </button>
            </div>

            <div id="viewer-content" class="viewer-content">
                <!-- Media displayed here -->
            </div>

            <div class="viewer-controls">
                <button id="viewer-prev" class="btn-icon">
                    ${getIcon('chevronLeft')}
                </button>
                <div class="viewer-actions">
                    <button id="viewer-share" class="btn-icon">
                        ${getIcon('share')}
                    </button>
                    <button id="viewer-favorite" class="btn-icon">
                        ${getIcon('heart')}
                    </button>
                    <button id="viewer-delete" class="btn-icon">
                        ${getIcon('trash')}
                    </button>
                </div>
                <button id="viewer-next" class="btn-icon">
                    ${getIcon('chevronRight')}
                </button>
            </div>

            <div id="viewer-info" class="viewer-info hidden">
                <!-- Info panel -->
            </div>
        `;

        document.getElementById('viewer-close').onclick = Viewer.close;
        document.getElementById('viewer-more').onclick = Viewer.showMoreMenu;
        document.getElementById('viewer-share').onclick = Viewer.share;
        document.getElementById('viewer-favorite').onclick = Viewer.toggleFavorite;
        document.getElementById('viewer-delete').onclick = Viewer.deleteCurrent;
        document.getElementById('viewer-prev').onclick = () => Viewer.navigate(-1);
        document.getElementById('viewer-next').onclick = () => Viewer.navigate(1);

        // Touch gestures
        Viewer.initGestures();
    },

    open: async (item, url, allItems = []) => {
        const overlay = document.getElementById('viewer-overlay');
        const content = document.getElementById('viewer-content');
        const title = overlay.querySelector('.viewer-title');

        Viewer.currentItem = item;
        Viewer.currentUrl = url;
        Viewer.allItems = allItems.length > 0 ? allItems : [item];
        Viewer.currentIndex = allItems.findIndex(i => i.id === item.id);
        if (Viewer.currentIndex === -1) Viewer.currentIndex = 0;

        Viewer.scale = 1;
        Viewer.translateX = 0;
        Viewer.translateY = 0;

        title.textContent = item.name;

        content.innerHTML = '';
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.id = 'viewer-media';
            content.appendChild(img);
        } else {
            const vid = document.createElement('video');
            vid.src = url;
            vid.controls = true;
            vid.autoplay = true;
            vid.id = 'viewer-media';
            content.appendChild(vid);
        }

        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.classList.add('active'));

        // Update navigation buttons
        Viewer.updateNavButtons();
    },

    close: () => {
        const overlay = document.getElementById('viewer-overlay');
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.classList.add('hidden');
            document.getElementById('viewer-content').innerHTML = '';
            Viewer.currentItem = null;
            Viewer.currentUrl = null;
        }, 300);
    },

    navigate: (direction) => {
        const newIndex = Viewer.currentIndex + direction;
        if (newIndex < 0 || newIndex >= Viewer.allItems.length) return;

        Viewer.currentIndex = newIndex;
        const newItem = Viewer.allItems[newIndex];
        const newUrl = URL.createObjectURL(newItem.file);

        Viewer.open(newItem, newUrl, Viewer.allItems);
    },

    updateNavButtons: () => {
        const prevBtn = document.getElementById('viewer-prev');
        const nextBtn = document.getElementById('viewer-next');

        if (prevBtn) prevBtn.style.opacity = Viewer.currentIndex === 0 ? '0.3' : '1';
        if (nextBtn) nextBtn.style.opacity = Viewer.currentIndex === Viewer.allItems.length - 1 ? '0.3' : '1';
    },

    showMoreMenu: () => {
        actionSheet.show({
            title: t('mediaInfo'),
            actions: [
                { id: 'info', label: 'Show Info', icon: 'info', handler: Viewer.toggleInfo },
                { id: 'edit', label: t('edit'), icon: 'edit', handler: Viewer.edit },
                { id: 'download', label: t('download'), icon: 'download', handler: Viewer.download }
            ]
        });
    },

    toggleInfo: () => {
        const infoPanel = document.getElementById('viewer-info');
        const item = Viewer.currentItem;

        if (infoPanel.classList.contains('hidden')) {
            infoPanel.classList.remove('hidden');
            infoPanel.innerHTML = `
                <div class="info-section">
                    <div class="info-label">${t('fileName')}</div>
                    <div class="info-value">${item.name}</div>
                </div>
                <div class="info-section">
                    <div class="info-label">${t('fileSize')}</div>
                    <div class="info-value">${Viewer.formatBytes(item.size)}</div>
                </div>
                ${item.width ? `
                <div class="info-section">
                    <div class="info-label">${t('resolution')}</div>
                    <div class="info-value">${item.width} × ${item.height}</div>
                </div>
                ` : ''}
                ${item.duration ? `
                <div class="info-section">
                    <div class="info-label">${t('duration')}</div>
                    <div class="info-value">${Viewer.formatDuration(item.duration)}</div>
                </div>
                ` : ''}
                <div class="info-section">
                    <div class="info-label">${t('dateTaken')}</div>
                    <div class="info-value">${new Date(item.date).toLocaleString()}</div>
                </div>
            `;
        } else {
            infoPanel.classList.add('hidden');
        }
    },

    share: async () => {
        await shareManager.shareMedia(Viewer.currentItem);
    },

    toggleFavorite: async () => {
        const item = Viewer.currentItem;
        const newValue = !item.isFavorite;
        await dbIndex.updateMedia(item.id, { isFavorite: newValue });
        Viewer.currentItem.isFavorite = newValue;
        Toast.success(newValue ? 'Added to favorites' : 'Removed from favorites');
    },

    deleteCurrent: async () => {
        if (!Viewer.currentItem) return;
        const confirmed = await modal.confirm(t('deleteConfirm'));
        if (confirmed) {
            await dbIndex.deleteMedia(Viewer.currentItem.id);
            Toast.success(t('itemDeleted'));
            Viewer.close();

            // Trigger refresh
            window.dispatchEvent(new Event('mediachange'));
        }
    },

    edit: () => {
        if (Viewer.currentItem.type === 'image') {
            window.location.hash = `/edit/${Viewer.currentItem.id}`;
            Viewer.close();
        } else {
            Toast.info('Video editing coming soon');
        }
    },

    download: async () => {
        await shareManager.downloadMedia(Viewer.currentItem);
    },

    initGestures: () => {
        const content = document.getElementById('viewer-content');
        let startX = 0;
        let startY = 0;
        let startDist = 0;
        let isPinching = false;

        content.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                startDist = Viewer.getDistance(e.touches[0], e.touches[1]);
            } else if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        });

        content.addEventListener('touchmove', (e) => {
            if (isPinching && e.touches.length === 2) {
                e.preventDefault();
                const currentDist = Viewer.getDistance(e.touches[0], e.touches[1]);
                const scaleFactor = currentDist / startDist;
                Viewer.zoom(scaleFactor);
            }
        });

        content.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                isPinching = false;
            }
        });

        // Double tap to zoom
        let lastTap = 0;
        content.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                Viewer.scale = Viewer.scale === 1 ? 2 : 1;
                Viewer.applyTransform();
            }
            lastTap = currentTime;
        });
    },

    getDistance: (touch1, touch2) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    zoom: (factor) => {
        Viewer.scale = Math.max(0.5, Math.min(5, Viewer.scale * factor));
        Viewer.applyTransform();
    },

    applyTransform: () => {
        const media = document.getElementById('viewer-media');
        if (media) {
            media.style.transform = `scale(${Viewer.scale}) translate(${Viewer.translateX}px, ${Viewer.translateY}px)`;
        }
    },

    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatDuration: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

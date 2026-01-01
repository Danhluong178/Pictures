/**
 * Updated Home View with Full Features
 */

import { dbIndex } from '../store/db.js';
import { appState } from '../store/state.js';
import { getIcon } from '../utils/icons.js';
import { t } from '../utils/i18n.js';
import { Viewer } from './viewer.js';
import { mediaImporter } from '../services/MediaImport.js';
import { actionSheet } from '../components/ActionSheet.js';
import { modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export const HomeView = {
    mediaCache: [],

    render: async () => {
        const container = document.getElementById('main-content');
        const headerActions = document.getElementById('header-actions');

        // Header actions
        headerActions.innerHTML = `
            <button class="btn-icon" id="btn-sort">
                ${getIcon('sort')}
            </button>
            <button class="btn-icon" id="btn-select">
                ${getIcon('check')}
            </button>
            <label for="file-upload" class="btn-icon">
                ${getIcon('plus')}
            </label>
            <input type="file" id="file-upload" multiple accept="image/*,video/*">
        `;

        // Main content
        container.innerHTML = `
            <div class="view-container">
                <div class="filter-bar" id="filter-bar">
                    <button class="filter-chip active" data-filter="all">${t('allMedia')}</button>
                    <button class="filter-chip" data-filter="image">${getIcon('image')} ${t('photo')}</button>
                    <button class="filter-chip" data-filter="video">${getIcon('video')} ${t('video')}</button>
                </div>
                
                <div class="selection-bar hidden" id="selection-bar">
                    <button class="btn-text" id="btn-select-all">${t('selectAll')}</button>
                    <div class="selection-count"></div>
                    <button class="btn-text" id="btn-cancel-selection">${t('cancel')}</button>
                </div>

                <div class="media-grid" id="media-grid">
                    <!-- Items injected here -->
                </div>
                
                <div id="empty-state" class="empty-state hidden">
                    <div class="empty-icon">${getIcon('image')}</div>
                    <p>${t('noPhotos')}</p>
                    <small>${t('noPhotosDesc')}</small>
                </div>

                <div class="selection-actions hidden" id="selection-actions">
                    <button class="action-btn" id="btn-delete-selected">
                        ${getIcon('trash')}
                    </button>
                    <button class="action-btn" id="btn-share-selected">
                        ${getIcon('share')}
                    </button>
                    <button class="action-btn" id="btn-album-selected">
                        ${getIcon('folder')}
                    </button>
                </div>
            </div>
        `;

        await HomeView.loadMedia();
        HomeView.bindEvents();
    },

    bindEvents: () => {
        // File upload
        const fileInput = document.getElementById('file-upload');
        fileInput?.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            await mediaImporter.importFiles(files);
            await HomeView.loadMedia();
            e.target.value = ''; // Reset input
        });

        // Sort button
        document.getElementById('btn-sort')?.addEventListener('click', () => {
            actionSheet.show({
                title: t('sortBy'),
                actions: [
                    { id: 'date', label: t('sortByDate'), icon: 'calendar', handler: () => HomeView.sortBy('date') },
                    { id: 'name', label: t('sortByName'), icon: 'sort', handler: () => HomeView.sortBy('name') },
                    { id: 'size', label: t('sortBySize'), icon: 'sort', handler: () => HomeView.sortBy('size') }
                ]
            });
        });

        // Selection mode
        document.getElementById('btn-select')?.addEventListener('click', () => {
            appState.set('isSelectionMode', true);
            HomeView.updateSelectionUI();
        });

        document.getElementById('btn-cancel-selection')?.addEventListener('click', () => {
            appState.clearSelection();
            HomeView.updateSelectionUI();
        });

        document.getElementById('btn-select-all')?.addEventListener('click', () => {
            const allIds = HomeView.mediaCache.map(item => item.id);
            appState.selectAll(allIds);
            HomeView.updateSelectionUI();
        });

        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                appState.set('filterType', filter);
                HomeView.loadMedia();
            });
        });

        // Selection actions
        document.getElementById('btn-delete-selected')?.addEventListener('click', async () => {
            const confirmed = await modal.confirm(t('deleteConfirm'));
            if (confirmed) {
                const ids = appState.getSelectedIds();
                for (const id of ids) {
                    await dbIndex.deleteMedia(id);
                }
                Toast.success(t('itemDeleted'));
                appState.clearSelection();
                await HomeView.loadMedia();
            }
        });

        document.getElementById('btn-share-selected')?.addEventListener('click', () => {
            Toast.info('Share multiple - coming soon');
        });

        document.getElementById('btn-album-selected')?.addEventListener('click', () => {
            Toast.info('Move to album - coming soon');
        });

        // Listen to state changes
        appState.subscribe('isSelectionMode', () => HomeView.updateSelectionUI());
        appState.subscribe('selectedItems', () => HomeView.updateSelectionUI());
    },

    updateSelectionUI: () => {
        const isSelectionMode = appState.get('isSelectionMode');
        const selectedCount = appState.get('selectedItems').size;

        const selectionBar = document.getElementById('selection-bar');
        const selectionActions = document.getElementById('selection-actions');
        const grid = document.getElementById('media-grid');

        if (isSelectionMode) {
            selectionBar?.classList.remove('hidden');
            selectionActions?.classList.remove('hidden');
            grid?.classList.add('selection-mode');

            const countEl = selectionBar?.querySelector('.selection-count');
            if (countEl) countEl.textContent = `${selectedCount} selected`;
        } else {
            selectionBar?.classList.add('hidden');
            selectionActions?.classList.add('hidden');
            grid?.classList.remove('selection-mode');
        }

        // Update checkboxes
        document.querySelectorAll('.media-item').forEach(el => {
            const id = el.dataset.id;
            const checkbox = el.querySelector('.media-checkbox');
            if (checkbox) {
                checkbox.classList.toggle('checked', appState.get('selectedItems').has(id));
            }
        });
    },

    sortBy: (field) => {
        appState.set('sortBy', field);
        HomeView.loadMedia();
    },

    loadMedia: async () => {
        const grid = document.getElementById('media-grid');
        const emptyState = document.getElementById('empty-state');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Loading...</div>';

        const filterType = appState.get('filterType');
        const filter = filterType === 'all' ? {} : { type: filterType };

        let items = await dbIndex.getAllMedia(filter);

        // Apply sorting
        const sortBy = appState.get('sortBy') || 'date';
        items = HomeView.applySorting(items, sortBy);

        HomeView.mediaCache = items;

        if (items.length === 0) {
            grid.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        } else {
            emptyState?.classList.add('hidden');
        }

        grid.innerHTML = '';
        items.forEach(item => {
            const el = HomeView.createMediaCard(item);
            grid.appendChild(el);
        });
    },

    applySorting: (items, field) => {
        const sorted = [...items];

        switch (field) {
            case 'date':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'size':
                sorted.sort((a, b) => b.size - a.size);
                break;
        }

        return sorted;
    },

    createMediaCard: (item) => {
        const el = document.createElement('div');
        el.className = 'media-item';
        el.dataset.id = item.id;

        const url = URL.createObjectURL(item.file);

        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.loading = 'lazy';
            el.appendChild(img);
        } else {
            const vid = document.createElement('video');
            vid.src = url;
            el.appendChild(vid);

            const duration = document.createElement('div');
            duration.className = 'video-duration';
            duration.textContent = HomeView.formatDuration(item.duration);
            el.appendChild(duration);
        }

        // Selection checkbox
        const checkbox = document.createElement('div');
        checkbox.className = 'media-checkbox';
        checkbox.innerHTML = getIcon('check');
        el.appendChild(checkbox);

        // Click handler
        el.onclick = (e) => {
            if (appState.get('isSelectionMode')) {
                e.stopPropagation();
                appState.toggleSelection(item.id);
            } else {
                Viewer.open(item, url);
            }
        };

        // Long press for selection
        let pressTimer;
        el.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                appState.set('isSelectionMode', true);
                appState.toggleSelection(item.id);
            }, 500);
        });

        el.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        return el;
    },

    formatDuration: (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

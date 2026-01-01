/**
 * Trash View
 */

import { dbIndex } from '../store/db.js';
import { getIcon } from '../utils/icons.js';
import { t } from '../utils/i18n.js';
import { modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export const TrashView = {
    trashItems: [],

    render: async () => {
        const container = document.getElementById('main-content');
        const headerActions = document.getElementById('header-actions');

        headerActions.innerHTML = `
            <button class="btn-icon" id="btn-empty-trash">
                ${getIcon('trash')}
            </button>
        `;

        container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <button class="btn-icon" id="btn-back">
                        ${getIcon('chevronLeft')}
                    </button>
                    <h2 class="view-title">${t('trash')}</h2>
                </div>

                <div class="info-banner">
                    <small>${t('trashRetention')}</small>
                </div>

                <div class="media-grid" id="trash-grid">
                    <!-- Items injected here -->
                </div>

                <div id="empty-trash" class="empty-state hidden">
                    <div class="empty-icon">${getIcon('trash')}</div>
                    <p>Trash is empty</p>
                </div>
            </div>
        `;

        await TrashView.loadTrash();
        TrashView.bindEvents();
    },

    bindEvents: () => {
        document.getElementById('btn-back')?.addEventListener('click', () => {
            window.location.hash = '/settings';
        });

        document.getElementById('btn-empty-trash')?.addEventListener('click', async () => {
            const confirmed = await modal.confirm(t('emptyTrashConfirm'));
            if (confirmed) {
                await dbIndex.emptyTrash();
                Toast.success('Trash emptied');
                await TrashView.loadTrash();
            }
        });
    },

    loadTrash: async () => {
        const grid = document.getElementById('trash-grid');
        const emptyState = document.getElementById('empty-trash');
        if (!grid) return;

        TrashView.trashItems = await dbIndex.getAllTrash();

        if (TrashView.trashItems.length === 0) {
            grid.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        } else {
            emptyState?.classList.add('hidden');
        }

        grid.innerHTML = '';
        TrashView.trashItems.forEach(item => {
            const card = TrashView.createTrashCard(item);
            grid.appendChild(card);
        });
    },

    createTrashCard: (item) => {
        const el = document.createElement('div');
        el.className = 'media-item trash-item';

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
        }

        const actions = document.createElement('div');
        actions.className = 'trash-actions';
        actions.innerHTML = `
            <button class="btn-restore" data-id="${item.id}">${getIcon('rotate')} Restore</button>
        `;
        el.appendChild(actions);

        const restoreBtn = actions.querySelector('.btn-restore');
        restoreBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            await dbIndex.restoreFromTrash(item.id);
            Toast.success(t('itemRestored'));
            await TrashView.loadTrash();
        });

        return el;
    }
};

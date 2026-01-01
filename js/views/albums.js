/**
 * Albums View
 */

import { dbIndex } from '../store/db.js';
import { albumManager } from '../services/AlbumManager.js';
import { getIcon } from '../utils/icons.js';
import { t } from '../utils/i18n.js';
import { modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export const AlbumsView = {
    albums: [],

    render: async () => {
        const container = document.getElementById('main-content');
        const headerActions = document.getElementById('header-actions');

        headerActions.innerHTML = `
            <button class="btn-icon" id="btn-new-album">
                ${getIcon('plus')}
            </button>
        `;

        container.innerHTML = `
            <div class="view-container">
                <h2 class="view-title">${t('albums')}</h2>
                
                <div class="albums-grid" id="albums-grid">
                    <!-- Albums injected here -->
                </div>

                <div id="empty-albums" class="empty-state hidden">
                    <div class="empty-icon">${getIcon('folder')}</div>
                    <p>No Albums</p>
                    <small>Create your first album</small>
                </div>
            </div>
        `;

        await AlbumsView.loadAlbums();
        AlbumsView.bindEvents();
    },

    bindEvents: () => {
        document.getElementById('btn-new-album')?.addEventListener('click', async () => {
            const name = await modal.prompt('Album name', t('createAlbum'));
            if (name) {
                await albumManager.createAlbum(name);
                await AlbumsView.loadAlbums();
            }
        });
    },

    loadAlbums: async () => {
        const grid = document.getElementById('albums-grid');
        const emptyState = document.getElementById('empty-albums');
        if (!grid) return;

        AlbumsView.albums = await albumManager.getAllAlbumsWithStats();

        if (AlbumsView.albums.length === 0) {
            grid.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        } else {
            emptyState?.classList.add('hidden');
        }

        grid.innerHTML = '';
        AlbumsView.albums.forEach(album => {
            const card = AlbumsView.createAlbumCard(album);
            grid.appendChild(card);
        });
    },

    createAlbumCard: (album) => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.dataset.id = album.id;

        const cover = album.coverUrl || '';

        card.innerHTML = `
            <div class="album-cover" style="background-image: url(${cover})">
                ${!cover ? `<div class="album-placeholder">${getIcon('folder')}</div>` : ''}
                ${album.isPrivate ? `<div class="album-badge">${getIcon('lock')}</div>` : ''}
            </div>
            <div class="album-info">
                <div class="album-name">${album.name}</div>
                <div class="album-count">${album.itemCount} items</div>
            </div>
            <button class="album-menu btn-icon">${getIcon('more')}</button>
        `;

        card.querySelector('.album-cover')?.addEventListener('click', () => {
            // Navigate to album detail
            window.location.hash = `/album/${album.id}`;
        });

        card.querySelector('.album-menu')?.addEventListener('click', (e) => {
            e.stopPropagation();
            AlbumsView.showAlbumMenu(album);
        });

        return card;
    },

    showAlbumMenu: (album) => {
        const { actionSheet } = require('../components/ActionSheet.js');

        actionSheet.show({
            title: album.name,
            actions: [
                {
                    id: 'rename',
                    label: t('renameAlbum'),
                    icon: 'edit',
                    handler: async () => {
                        const newName = await modal.prompt('New name', t('renameAlbum'), album.name);
                        if (newName) {
                            await albumManager.renameAlbum(album.id, newName);
                            await AlbumsView.loadAlbums();
                        }
                    }
                },
                {
                    id: 'delete',
                    label: t('deleteAlbum'),
                    icon: 'trash',
                    destructive: true,
                    handler: async () => {
                        const confirmed = await modal.confirm(t('deleteAlbumConfirm'));
                        if (confirmed) {
                            await albumManager.deleteAlbum(album.id, false);
                            await AlbumsView.loadAlbums();
                        }
                    }
                }
            ]
        });
    }
};

/**
 * Search View
 */

import { searchEngine } from '../services/SearchEngine.js';
import { getIcon } from '../utils/icons.js';
import { t } from '../utils/i18n.js';
import { Viewer } from './viewer.js';

export const SearchView = {
    results: [],

    render: async () => {
        const container = document.getElementById('main-content');
        const headerActions = document.getElementById('header-actions');

        headerActions.innerHTML = `
            <button class="btn-icon" id="btn-filters">
                ${getIcon('filter')}
            </button>
        `;

        container.innerHTML = `
            <div class="view-container">
                <div class="search-bar">
                    <div class="search-input-wrapper">
                        ${getIcon('search')}
                        <input type="search" 
                               id="search-input" 
                               placeholder="${t('searchPhotos')}"
                               autocomplete="off">
                    </div>
                </div>

                <div class="filter-chips hidden" id="filter-chips">
                    <button class="filter-chip" data-filter="type:image">${getIcon('image')} Images</button>
                    <button class="filter-chip" data-filter="type:video">${getIcon('video')} Videos</button>
                    <button class="filter-chip" data-filter="size:large">Large Files</button>
                </div>

                <div class="search-results" id="search-results">
                    <div class="search-placeholder">
                        <div class="search-placeholder-icon">${getIcon('search')}</div>
                        <p>${t('searchPhotos')}</p>
                    </div>
                </div>
            </div>
        `;

        SearchView.bindEvents();
    },

    bindEvents: () => {
        const searchInput = document.getElementById('search-input');
        let searchTimeout;

        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;

            if (query.length === 0) {
                SearchView.showPlaceholder();
                return;
            }

            searchTimeout = setTimeout(async () => {
                await SearchView.performSearch(query);
            }, 300);
        });

        document.getElementById('btn-filters')?.addEventListener('click', () => {
            const chips = document.getElementById('filter-chips');
            chips?.classList.toggle('hidden');
        });

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', async (e) => {
                const filter = e.target.dataset.filter;
                const [key, value] = filter.split(':');

                const searchInput = document.getElementById('search-input');
                const query = searchInput?.value || '';

                let filters = {};
                if (key === 'type') filters.type = value;
                if (key === 'size' && value === 'large') filters.minSize = 10 * 1024 * 1024;

                await SearchView.performSearch(query, filters);
            });
        });
    },

    performSearch: async (query, filters = {}) => {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

        SearchView.results = await searchEngine.search(query, filters);

        if (SearchView.results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="search-placeholder-icon">${getIcon('search')}</div>
                    <p>${t('noResults')}</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="results-count">${SearchView.results.length} results</div>
            <div class="media-grid" id="results-grid"></div>
        `;

        const grid = document.getElementById('results-grid');
        SearchView.results.forEach(item => {
            const card = SearchView.createResultCard(item);
            grid?.appendChild(card);
        });
    },

    createResultCard: (item) => {
        const el = document.createElement('div');
        el.className = 'media-item';

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

        el.onclick = () => Viewer.open(item, url);

        return el;
    },

    showPlaceholder: () => {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="search-placeholder-icon">${getIcon('search')}</div>
                    <p>${t('searchPhotos')}</p>
                </div>
            `;
        }
    }
};

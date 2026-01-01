/**
 * Pictures App - Main Entry Point
 */

import { Router } from './router.js';
import { injectIcons } from './utils/icons.js';
import { dbIndex } from './store/db.js';
import { appState } from './store/state.js';
import { themeManager } from './utils/theme.js';
import { i18n } from './utils/i18n.js';

// Views
import { HomeView } from './views/home.js';
import { AlbumsView } from './views/albums.js';
import { SearchView } from './views/search.js';
import { SettingsView } from './views/settings.js';
import { TrashView } from './views/trash.js';
import { Viewer } from './views/viewer.js';

// Define routes
const routes = {
    '/': HomeView,
    '/albums': AlbumsView,
    '/search': SearchView,
    '/settings': SettingsView,
    '/trash': TrashView
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🖼️ Pictures App Starting...');

    // 1. Inject Icons
    injectIcons();

    // 2. Initialize theme
    themeManager.loadTheme();

    // 3. Initialize i18n
    i18n.loadLanguage();

    // 4. Initialize global viewer
    Viewer.init();

    // 5. Initialize router
    const appRouter = new Router(routes);

    // 6. Check database status
    try {
        await dbIndex.ready;
        console.log('✅ Database initialized');
    } catch (error) {
        console.error('❌ Database error:', error);
    }

    // 7. Register service worker for PWA
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered');
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }

    // 8. Listen for media changes
    window.addEventListener('mediachange', () => {
        // Refresh current view
        const currentPath = window.location.hash.slice(1) || '/';
        const route = routes[currentPath];
        if (route && route.render) {
            route.render();
        }
    });

    // 9. Listen for language changes
    window.addEventListener('languagechange', () => {
        // Refresh current view to update translations
        const currentPath = window.location.hash.slice(1) || '/';
        const route = routes[currentPath];
        if (route && route.render) {
            route.render();
        }

        // Update navigation labels
        updateNavigation();
    });

    // 10. Update navigation labels
    updateNavigation();

    console.log('✅ Pictures App Ready!');
});

function updateNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const label = btn.querySelector('.label');
        const path = btn.dataset.path;

        if (label) {
            switch (path) {
                case '/':
                    label.textContent = i18n.t('photos');
                    break;
                case '/albums':
                    label.textContent = i18n.t('albums');
                    break;
                case '/search':
                    label.textContent = i18n.t('search');
                    break;
                case '/settings':
                    label.textContent = i18n.t('settings');
                    break;
            }
        }
    });
}

// Handle app install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💾 App can be installed');
});

// Export for debugging
window.PicturesApp = {
    dbIndex,
    appState,
    themeManager,
    i18n
};

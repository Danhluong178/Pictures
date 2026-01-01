/**
 * Settings View
 */

import { dbIndex } from '../store/db.js';
import { getIcon } from '../utils/icons.js';
import { t, i18n } from '../utils/i18n.js';
import { themeManager } from '../utils/theme.js';
import { Toast } from '../components/Toast.js';

export const SettingsView = {
    render: async () => {
        const container = document.getElementById('main-content');
        const headerActions = document.getElementById('header-actions');

        headerActions.innerHTML = '';

        const stats = await dbIndex.getStorageStats();
        const currentLang = i18n.getCurrentLanguage();
        const currentTheme = themeManager.getTheme();

        container.innerHTML = `
            <div class="view-container settings-view">
                <h2 class="view-title">${t('settings')}</h2>

                <div class="settings-section">
                    <div class="section-title">Display</div>
                    
                    <div class="setting-item" id="theme-toggle">
                        <div class="setting-info">
                            <div class="setting-icon">${getIcon(currentTheme === 'dark' ? 'moon' : 'sun')}</div>
                            <div class="setting-label">${t('theme')}</div>
                        </div>
                        <div class="setting-value">${currentTheme === 'dark' ? t('darkMode') : t('lightMode')}</div>
                    </div>

                    <div class="setting-item" id="language-toggle">
                        <div class="setting-info">
                            <div class="setting-icon">${getIcon('globe')}</div>
                            <div class="setting-label">${t('language')}</div>
                        </div>
                        <div class="setting-value">${currentLang === 'vi' ? 'Tiếng Việt' : 'English'}</div>
                    </div>
                </div>

                <div class="settings-section">
                    <div class="section-title">${t('storage')}</div>
                    
                    <div class="storage-info">
                        <div class="storage-stat">
                            <div class="stat-label">Total Items</div>
                            <div class="stat-value">${stats.totalItems}</div>
                        </div>
                        <div class="storage-stat">
                            <div class="stat-label">Photos</div>
                            <div class="stat-value">${stats.imageCount} (${SettingsView.formatBytes(stats.imageSize)})</div>
                        </div>
                        <div class="storage-stat">
                            <div class="stat-label">Videos</div>
                            <div class="stat-value">${stats.videoCount} (${SettingsView.formatBytes(stats.videoSize)})</div>
                        </div>
                        <div class="storage-stat">
                            <div class="stat-label">Total Size</div>
                            <div class="stat-value">${SettingsView.formatBytes(stats.totalSize)}</div>
                        </div>
                    </div>

                    <button class="btn-primary" id="btn-cleanup" style="margin-top: 16px;">
                        ${getIcon('trash')} ${t('cleanUp')}
                    </button>
                </div>

                <div class="settings-section">
                    <div class="section-title">Data</div>
                    
                    <div class="setting-item" id="view-trash">
                        <div class="setting-info">
                            <div class="setting-icon">${getIcon('trash')}</div>
                            <div class="setting-label">${t('trash')}</div>
                        </div>
                        <div class="setting-arrow">${getIcon('chevronRight')}</div>
                    </div>
                </div>

                <div class="settings-section">
                    <div class="section-title">${t('about')}</div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">Version</div>
                        </div>
                        <div class="setting-value">1.0.0</div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">App Name</div>
                        </div>
                        <div class="setting-value">Pictures</div>
                    </div>
                </div>
            </div>
        `;

        SettingsView.bindEvents();
    },

    bindEvents: () => {
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            themeManager.toggle();
            Toast.success('Theme changed');
            setTimeout(() => SettingsView.render(), 300);
        });

        document.getElementById('language-toggle')?.addEventListener('click', () => {
            const current = i18n.getCurrentLanguage();
            const newLang = current === 'vi' ? 'en' : 'vi';
            i18n.setLanguage(newLang);
            Toast.success('Language changed');
            setTimeout(() => SettingsView.render(), 300);
        });

        document.getElementById('btn-cleanup')?.addEventListener('click', () => {
            window.location.hash = '/cleanup';
        });

        document.getElementById('view-trash')?.addEventListener('click', () => {
            window.location.hash = '/trash';
        });
    },

    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

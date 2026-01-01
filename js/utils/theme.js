/**
 * Theme Manager
 * Handles dark/light mode switching
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.loadTheme();
    }

    loadTheme() {
        const saved = localStorage.getItem('pictures-theme');
        if (saved) {
            this.currentTheme = saved;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                this.currentTheme = 'light';
            }
        }
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('pictures-theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('pictures-theme', theme);
        this.applyTheme(theme);

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
    }

    applyTheme(theme) {
        const root = document.documentElement;

        if (theme === 'light') {
            root.style.setProperty('--bg-app', '#ffffff');
            root.style.setProperty('--bg-panel', '#f5f5f5');
            root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.7)');

            root.style.setProperty('--text-primary', '#0a0a0a');
            root.style.setProperty('--text-secondary', '#555555');
            root.style.setProperty('--text-muted', '#999999');

            root.style.setProperty('--accent', '#0a0a0a');
            root.style.setProperty('--accent-dim', '#e0e0e0');
        } else {
            // Dark mode (default)
            root.style.setProperty('--bg-app', '#050505');
            root.style.setProperty('--bg-panel', '#121212');
            root.style.setProperty('--bg-glass', 'rgba(18, 18, 18, 0.7)');

            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a0a0a0');
            root.style.setProperty('--text-muted', '#555555');

            root.style.setProperty('--accent', '#f5f5f5');
            root.style.setProperty('--accent-dim', '#333333');
        }
    }

    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getTheme() {
        return this.currentTheme;
    }
}

export const themeManager = new ThemeManager();

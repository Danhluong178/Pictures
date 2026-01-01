/**
 * Simple Router (Hash-based)
 */

export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPath = null;

        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Init

        // Handle nav clicks
        document.querySelectorAll('[data-path]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const path = btn.dataset.path;
                this.navigate(path);
            });
        });
    }

    navigate(path) {
        window.location.hash = path;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.routes[hash] || this.routes['/'];

        this.currentPath = hash;
        this.updateNav(hash);

        if (route) {
            route.render();
            if (route.onLoad) route.onLoad();
        }
    }

    updateNav(path) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.path === path);
        });
    }
}

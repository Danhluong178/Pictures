/**
 * Global State Management
 * Reactive state for UI components
 */

class StateManager {
    constructor() {
        this.state = {
            currentView: 'photos',
            selectedItems: new Set(),
            isSelectionMode: false,
            currentAlbum: null,
            sortBy: 'date', // date, name, size
            sortOrder: 'desc', // asc, desc
            viewMode: 'grid', // grid, list
            filterType: 'all', // all, image, video
            searchQuery: '',
            isLoading: false,
            theme: 'dark',
            language: 'vi'
        };

        this.listeners = new Map();
    }

    // Get current state
    get(key) {
        return this.state[key];
    }

    // Set state and notify listeners
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        // Notify listeners
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }

        // Also notify wildcard listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                callback(key, value, oldValue);
            });
        }
    }

    // Update multiple state values
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    // Selection mode helpers
    toggleSelection(itemId) {
        if (this.state.selectedItems.has(itemId)) {
            this.state.selectedItems.delete(itemId);
        } else {
            this.state.selectedItems.add(itemId);
        }

        // Trigger update
        this.set('selectedItems', new Set(this.state.selectedItems));

        // Auto-exit selection mode if no items selected
        if (this.state.selectedItems.size === 0) {
            this.set('isSelectionMode', false);
        }
    }

    clearSelection() {
        this.state.selectedItems.clear();
        this.set('selectedItems', new Set());
        this.set('isSelectionMode', false);
    }

    selectAll(itemIds) {
        this.state.selectedItems = new Set(itemIds);
        this.set('selectedItems', new Set(this.state.selectedItems));
        this.set('isSelectionMode', true);
    }

    getSelectedIds() {
        return Array.from(this.state.selectedItems);
    }
}

export const appState = new StateManager();

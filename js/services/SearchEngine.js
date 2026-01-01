/**
 * Search Engine Service
 * Handles media search and filtering
 */

import { dbIndex } from '../store/db.js';

class SearchEngine {
    constructor() {
        this.filters = {
            type: null, // 'image', 'video', or null for all
            dateFrom: null,
            dateTo: null,
            minSize: null,
            maxSize: null,
            tags: [],
            albumId: null,
            isFavorite: null,
            isHidden: false
        };
    }

    async search(query, filters = {}) {
        // Merge with default filters
        const searchFilters = { ...this.filters, ...filters };

        // Get all media or search by query
        let results;
        if (query && query.trim()) {
            results = await dbIndex.search(query, searchFilters);
        } else {
            // Just apply filters
            results = await dbIndex.getAllMedia(searchFilters);
        }

        // Apply additional client-side filters
        results = this.applyClientFilters(results, searchFilters);

        return results;
    }

    applyClientFilters(results, filters) {
        let filtered = [...results];

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(item => new Date(item.date) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            filtered = filtered.filter(item => new Date(item.date) <= toDate);
        }

        // Size filter
        if (filters.minSize !== null) {
            filtered = filtered.filter(item => item.size >= filters.minSize);
        }

        if (filters.maxSize !== null) {
            filtered = filtered.filter(item => item.size <= filters.maxSize);
        }

        return filtered;
    }

    // Predefined filters
    async getScreenshots() {
        const allMedia = await dbIndex.getAllMedia({ type: 'image' });
        return allMedia.filter(item =>
            item.name.toLowerCase().includes('screenshot') ||
            item.name.toLowerCase().includes('screen') ||
            item.name.toLowerCase().startsWith('scr_')
        );
    }

    async getLargeFiles(threshold = 10 * 1024 * 1024) { // 10MB default
        const allMedia = await dbIndex.getAllMedia();
        return allMedia.filter(item => item.size >= threshold)
            .sort((a, b) => b.size - a.size);
    }

    async getLongVideos(threshold = 60) { // 60 seconds default
        const allMedia = await dbIndex.getAllMedia({ type: 'video' });
        return allMedia.filter(item => item.duration && item.duration >= threshold)
            .sort((a, b) => b.duration - a.duration);
    }

    async getRecentPhotos(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const allMedia = await dbIndex.getAllMedia();
        return allMedia.filter(item => new Date(item.date) >= since)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Group media by date
    groupByDate(media) {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            thisMonth: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        media.forEach(item => {
            const itemDate = new Date(item.date);
            const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

            if (itemDay.getTime() === today.getTime()) {
                groups.today.push(item);
            } else if (itemDay.getTime() === yesterday.getTime()) {
                groups.yesterday.push(item);
            } else if (itemDate >= weekAgo) {
                groups.thisWeek.push(item);
            } else if (itemDate >= monthStart) {
                groups.thisMonth.push(item);
            } else {
                groups.older.push(item);
            }
        });

        return groups;
    }

    // Find potential duplicates (basic implementation)
    async findDuplicates() {
        const allMedia = await dbIndex.getAllMedia();
        const duplicateGroups = [];
        const sizeMap = new Map();

        // Group by file size (simple duplicate detection)
        allMedia.forEach(item => {
            const key = `${item.size}-${item.name}`;
            if (!sizeMap.has(key)) {
                sizeMap.set(key, []);
            }
            sizeMap.get(key).push(item);
        });

        // Find groups with more than one item
        sizeMap.forEach(group => {
            if (group.length > 1) {
                duplicateGroups.push(group);
            }
        });

        return duplicateGroups;
    }
}

export const searchEngine = new SearchEngine();

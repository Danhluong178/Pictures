/**
 * Internationalization (i18n) System
 * Support for Vietnamese and English
 */

const translations = {
    vi: {
        // App General
        appName: 'Pictures',
        photos: 'Ảnh',
        albums: 'Album',
        search: 'Tìm kiếm',
        settings: 'Cài đặt',

        // Actions
        add: 'Thêm',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        save: 'Lưu',
        share: 'Chia sẻ',
        select: 'Chọn',
        selectAll: 'Chọn tất cả',
        done: 'Hoàn tất',
        undo: 'Hoàn tác',
        redo: 'Làm lại',
        restore: 'Khôi phục',
        download: 'Tải xuống',
        upload: 'Tải lên',

        // Media
        photo: 'Ảnh',
        video: 'Video',
        noPhotos: 'Chưa có ảnh',
        noPhotosDesc: 'Nhấn + để thêm ảnh',
        importPhotos: 'Nhập ảnh',
        takePhoto: 'Chụp ảnh',
        mediaInfo: 'Thông tin',

        // Albums
        createAlbum: 'Tạo album',
        albumName: 'Tên album',
        renameAlbum: 'Đổi tên album',
        deleteAlbum: 'Xóa album',
        moveToAlbum: 'Di chuyển vào album',
        privateAlbum: 'Album riêng tư',
        pinAlbum: 'Ghim album',

        // Tags
        tags: 'Nhãn',
        addTag: 'Thêm nhãn',
        noTags: 'Chưa có nhãn',

        // Search
        searchPhotos: 'Tìm ảnh và video',
        searchResults: 'Kết quả tìm kiếm',
        noResults: 'Không tìm thấy kết quả',
        filters: 'Bộ lọc',
        filterByType: 'Lọc theo loại',
        filterByDate: 'Lọc theo ngày',
        filterBySize: 'Lọc theo dung lượng',
        allMedia: 'Tất cả',
        imagesOnly: 'Chỉ ảnh',
        videosOnly: 'Chỉ video',

        // Editor
        crop: 'Cắt',
        rotate: 'Xoay',
        flip: 'Lật',
        brightness: 'Độ sáng',
        contrast: 'Độ tương phản',
        saturation: 'Độ bão hòa',
        filters: 'Bộ lọc',
        adjust: 'Điều chỉnh',
        original: 'Gốc',

        // Trash
        trash: 'Thùng rác',
        emptyTrash: 'Dọn sạch thùng rác',
        deletePermananently: 'Xóa vĩnh viễn',
        restoreItem: 'Khôi phục',
        trashRetention: 'Lưu giữ 30 ngày',

        // Storage
        storage: 'Bộ nhớ',
        storageUsed: 'Đã dùng',
        storageAvailable: 'Còn trống',
        freeUpSpace: 'Giải phóng dung lượng',
        largeFiles: 'File lớn',
        duplicates: 'Trùng lặp',
        blurryPhotos: 'Ảnh mờ',
        cleanUp: 'Dọn dẹp',

        // Settings
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
        darkMode: 'Tối',
        lightMode: 'Sáng',
        sortBy: 'Sắp xếp theo',
        sortByDate: 'Ngày',
        sortByName: 'Tên',
        sortBySize: 'Dung lượng',
        privacy: 'Riêng tư',
        backup: 'Sao lưu',
        about: 'Giới thiệu',
        version: 'Phiên bản',

        // Privacy
        privateVault: 'Két riêng tư',
        setPassword: 'Đặt mật khẩu',
        enterPassword: 'Nhập mật khẩu',
        lockAlbum: 'Khóa album',
        unlockAlbum: 'Mở khóa',

        // Share
        shareLink: 'Chia sẻ link',
        shareQR: 'Chia sẻ QR',
        exportAs: 'Xuất dưới dạng',
        quality: 'Chất lượng',
        highQuality: 'Cao',
        mediumQuality: 'Trung bình',
        lowQuality: 'Thấp',

        // Confirmations
        deleteConfirm: 'Bạn có chắc muốn xóa?',
        deleteAlbumConfirm: 'Xóa album này? Ảnh sẽ vẫn được giữ lại.',
        emptyTrashConfirm: 'Xóa vĩnh viễn tất cả? Không thể hoàn tác.',

        // Messages
        itemDeleted: 'Đã xóa',
        itemRestored: 'Đã khôi phục',
        albumCreated: 'Đã tạo album',
        saved: 'Đã lưu',
        copied: 'Đã sao chép',
        uploadSuccess: 'Tải lên thành công',
        uploadFailed: 'Tải lên thất bại',

        // Info
        fileName: 'Tên file',
        fileSize: 'Dung lượng',
        resolution: 'Độ phân giải',
        duration: 'Thời lượng',
        dateTaken: 'Ngày chụp',
        location: 'Vị trí',
        camera: 'Máy ảnh',

        // Dates
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        thisWeek: 'Tuần này',
        thisMonth: 'Tháng này',
        older: 'Cũ hơn'
    },

    en: {
        // App General
        appName: 'Pictures',
        photos: 'Photos',
        albums: 'Albums',
        search: 'Search',
        settings: 'Settings',

        // Actions
        add: 'Add',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        save: 'Save',
        share: 'Share',
        select: 'Select',
        selectAll: 'Select All',
        done: 'Done',
        undo: 'Undo',
        redo: 'Redo',
        restore: 'Restore',
        download: 'Download',
        upload: 'Upload',

        // Media
        photo: 'Photo',
        video: 'Video',
        noPhotos: 'No Photos',
        noPhotosDesc: 'Tap + to add some',
        importPhotos: 'Import Photos',
        takePhoto: 'Take Photo',
        mediaInfo: 'Info',

        // Albums
        createAlbum: 'Create Album',
        albumName: 'Album Name',
        renameAlbum: 'Rename Album',
        deleteAlbum: 'Delete Album',
        moveToAlbum: 'Move to Album',
        privateAlbum: 'Private Album',
        pinAlbum: 'Pin Album',

        // Tags
        tags: 'Tags',
        addTag: 'Add Tag',
        noTags: 'No Tags',

        // Search
        searchPhotos: 'Search photos and videos',
        searchResults: 'Search Results',
        noResults: 'No Results Found',
        filters: 'Filters',
        filterByType: 'Filter by Type',
        filterByDate: 'Filter by Date',
        filterBySize: 'Filter by Size',
        allMedia: 'All',
        imagesOnly: 'Images Only',
        videosOnly: 'Videos Only',

        // Editor
        crop: 'Crop',
        rotate: 'Rotate',
        flip: 'Flip',
        brightness: 'Brightness',
        contrast: 'Contrast',
        saturation: 'Saturation',
        filters: 'Filters',
        adjust: 'Adjust',
        original: 'Original',

        // Trash
        trash: 'Trash',
        emptyTrash: 'Empty Trash',
        deletePermananently: 'Delete Permanently',
        restoreItem: 'Restore',
        trashRetention: '30-day retention',

        // Storage
        storage: 'Storage',
        storageUsed: 'Used',
        storageAvailable: 'Available',
        freeUpSpace: 'Free Up Space',
        largeFiles: 'Large Files',
        duplicates: 'Duplicates',
        blurryPhotos: 'Blurry Photos',
        cleanUp: 'Clean Up',

        // Settings
        language: 'Language',
        theme: 'Theme',
        darkMode: 'Dark',
        lightMode: 'Light',
        sortBy: 'Sort By',
        sortByDate: 'Date',
        sortByName: 'Name',
        sortBySize: 'Size',
        privacy: 'Privacy',
        backup: 'Backup',
        about: 'About',
        version: 'Version',

        // Privacy
        privateVault: 'Private Vault',
        setPassword: 'Set Password',
        enterPassword: 'Enter Password',
        lockAlbum: 'Lock Album',
        unlockAlbum: 'Unlock',

        // Share
        shareLink: 'Share Link',
        shareQR: 'Share QR',
        exportAs: 'Export As',
        quality: 'Quality',
        highQuality: 'High',
        mediumQuality: 'Medium',
        lowQuality: 'Low',

        // Confirmations
        deleteConfirm: 'Are you sure you want to delete?',
        deleteAlbumConfirm: 'Delete this album? Photos will remain.',
        emptyTrashConfirm: 'Permanently delete all items? Cannot undo.',

        // Messages
        itemDeleted: 'Deleted',
        itemRestored: 'Restored',
        albumCreated: 'Album Created',
        saved: 'Saved',
        copied: 'Copied',
        uploadSuccess: 'Upload Successful',
        uploadFailed: 'Upload Failed',

        // Info
        fileName: 'File Name',
        fileSize: 'File Size',
        resolution: 'Resolution',
        duration: 'Duration',
        dateTaken: 'Date Taken',
        location: 'Location',
        camera: 'Camera',

        // Dates
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        older: 'Older'
    }
};

class I18n {
    constructor() {
        this.currentLang = 'vi'; // Default Vietnamese
        this.loadLanguage();
    }

    loadLanguage() {
        // Try to load from localStorage
        const saved = localStorage.getItem('pictures-language');
        if (saved && translations[saved]) {
            this.currentLang = saved;
        }
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('pictures-language', lang);

            // Trigger custom event for language change
            window.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));
        }
    }

    t(key) {
        return translations[this.currentLang][key] || key;
    }

    // Get all translations for current language
    getAll() {
        return translations[this.currentLang];
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getAvailableLanguages() {
        return Object.keys(translations);
    }
}

export const i18n = new I18n();

// Convenience function
export function t(key) {
    return i18n.t(key);
}

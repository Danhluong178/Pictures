# Pictures - Photo & Video Manager 📸

A premium Progressive Web App for managing photos and videos on mobile devices. Optimized for Android 15 and gaming phones like Nubia Redmagic 8 Pro.

![PWA](https://img.shields.io/badge/PWA-Enabled-blue)
![Android](https://img.shields.io/badge/Android-15-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

### 📥 Import & Sync
- Import photos/videos from device
- Camera capture support
- Metadata extraction (EXIF, dimensions, duration)
- Batch import with progress tracking

### 📁 Organization
- Create and manage albums
- Tag and categorize media
- Move media between albums
- Merge albums
- Duplicate detection

### 🔍 Smart Search
- Search by filename, date, type
- Advanced filters (size, type, duration)
- Predefined filters (screenshots, large files, long videos)
- Real-time search results

### 👁️ View & Playback
- Full-screen media viewer
- Pinch-to-zoom gestures
- Swipe navigation
- Double-tap zoom
- Video playback with controls
- EXIF data display

### 🎨 Basic Editing
- Crop and rotate
- Brightness/contrast adjustments
- Filters (grayscale, sepia, vintage)
- Flip horizontal/vertical
- Undo/redo support
- Non-destructive editing

### 🔗 Sharing & Export
- Web Share API integration
- Download with compression
- Copy to clipboard
- Export with quality options

### 🗑️ Delete & Restore
- 30-day trash bin
- Restore deleted items
- Permanent deletion with confirmation

### 🌐 Multi-language
- Vietnamese 🇻🇳
- English 🇬🇧

### 🎨 Themes
- Dark mode (default)
- Light mode
- Automatic system detection

## 📱 Optimized For

- ✅ Nubia Redmagic 8 Pro (6.8" display)
- ✅ Android 15
- ✅ Large gaming phones
- ✅ Notch/camera cutout support
- ✅ Safe-area insets

## 🚀 Installation

### Option 1: Add to Home Screen (Recommended)

1. Open the app URL in Chrome on your Android device
2. Tap the menu (⋮) → "Add to Home screen"
3. Name it "Pictures" and tap "Add"
4. App icon appears on home screen!

### Option 2: Install from Release

1. Download the latest APK from [Releases](https://github.com/YOUR_USERNAME/pictures-app/releases)
2. Install on your Android device
3. Open and enjoy!

## 🛠️ Development

### Prerequisites

- Modern web browser (Chrome recommended)
- Web server for local development

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pictures-app.git
cd pictures-app

# Serve locally (choose one):

# Python
python -m http.server 3000

# Node.js
npx serve .

# PHP
php -S localhost:3000
```

Open `http://localhost:3000` in your browser.

### Project Structure

```
pictures-app/
├── index.html          # Main HTML
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/
│   └── main.css       # Styles
├── js/
│   ├── app.js         # Main app logic
│   ├── router.js      # Routing
│   ├── store/
│   │   ├── db.js      # IndexedDB wrapper
│   │   └── state.js   # State management
│   ├── utils/
│   │   ├── icons.js   # SVG icons
│   │   ├── i18n.js    # Translations
│   │   └── theme.js   # Theme management
│   ├── components/
│   │   ├── Toast.js   # Notifications
│   │   ├── Modal.js   # Dialogs
│   │   └── ActionSheet.js
│   ├── services/
│   │   ├── MediaImport.js
│   │   ├── SearchEngine.js
│   │   ├── AlbumManager.js
│   │   ├── ShareManager.js
│   │   └── ImageEditor.js
│   └── views/
│       ├── home.js
│       ├── albums.js
│       ├── search.js
│       ├── settings.js
│       ├── trash.js
│       └── viewer.js
└── assets/            # Icons and images
```

## 🎯 Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: IndexedDB
- **Styling**: Custom CSS with CSS Variables
- **PWA**: Service Worker + Web App Manifest
- **APIs**: File System Access, Web Share, Camera API

## 🔧 Browser Support

- ✅ Chrome 90+ (Android)
- ✅ Samsung Internet 14+
- ✅ Edge 90+
- ⚠️ Safari (limited features)

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- Icons from custom SVG library
- Fonts from Google Fonts (Outfit)
- Inspired by modern photo management apps

---

Made with ❤️ for Nubia Redmagic 8 Pro users

/**
 * Image Editor Service
 * Basic image editing operations
 */

class ImageEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImage = null;
        this.currentImage = null;
        this.history = [];
        this.historyIndex = -1;
    }

    async loadImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);

                this.saveState();
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    saveState() {
        // Save current canvas state
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.canvas.toDataURL());
        this.historyIndex++;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadStateFromHistory();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadStateFromHistory();
        }
    }

    loadStateFromHistory() {
        const img = new Image();
        img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyIndex];
    }

    // Crop image
    crop(x, y, width, height) {
        const imageData = this.ctx.getImageData(x, y, width, height);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
    }

    // Rotate image
    rotate(degrees) {
        const radians = degrees * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const newWidth = Math.abs(this.canvas.width * cos) + Math.abs(this.canvas.height * sin);
        const newHeight = Math.abs(this.canvas.width * sin) + Math.abs(this.canvas.height * cos);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.translate(newWidth / 2, newHeight / 2);
        tempCtx.rotate(radians);
        tempCtx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.saveState();
    }

    // Flip horizontal
    flipHorizontal() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.scale(-1, 1);
        tempCtx.drawImage(this.canvas, -this.canvas.width, 0);

        this.ctx.drawImage(tempCanvas, 0, 0);
        this.saveState();
    }

    // Flip vertical
    flipVertical() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.scale(1, -1);
        tempCtx.drawImage(this.canvas, 0, -this.canvas.height);

        this.ctx.drawImage(tempCanvas, 0, 0);
        this.saveState();
    }

    // Adjust brightness (-100 to 100)
    adjustBrightness(value) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] += value;     // R
            data[i + 1] += value; // G
            data[i + 2] += value; // B
        }

        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
    }

    // Adjust contrast (-100 to 100)
    adjustContrast(value) {
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }

        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
    }

    // Apply filter
    applyFilter(filterName) {
        const filters = {
            grayscale: 'grayscale(100%)',
            sepia: 'sepia(100%)',
            blur: 'blur(5px)',
            brightness: 'brightness(120%)',
            contrast: 'contrast(120%)',
            saturate: 'saturate(150%)',
            invert: 'invert(100%)',
            vintage: 'sepia(50%) contrast(120%) brightness(90%)'
        };

        if (filters[filterName]) {
            this.ctx.filter = filters[filterName];
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.filter = 'none';
            this.saveState();
        }
    }

    // Reset to original
    reset() {
        this.canvas.width = this.originalImage.width;
        this.canvas.height = this.originalImage.height;
        this.ctx.drawImage(this.originalImage, 0, 0);
        this.history = [];
        this.historyIndex = -1;
        this.saveState();
    }

    // Export as blob
    async export(format = 'image/jpeg', quality = 0.95) {
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, format, quality);
        });
    }

    // Get preview URL
    getPreviewURL() {
        return this.canvas.toDataURL();
    }
}

export const imageEditor = new ImageEditor();

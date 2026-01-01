/**
 * Toast Notification System
 */

class Toast {
    static show(message, options = {}) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        if (options.type) {
            toast.classList.add(`toast-${options.type}`);
        }

        const content = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                ${options.action ? `<button class="toast-action">${options.action}</button>` : ''}
            </div>
        `;

        toast.innerHTML = content;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Handle action button
        if (options.action && options.onAction) {
            toast.querySelector('.toast-action').addEventListener('click', () => {
                options.onAction();
                Toast.hide(toast);
            });
        }

        // Auto-hide
        const duration = options.duration || 3000;
        setTimeout(() => {
            Toast.hide(toast);
        }, duration);
    }

    static hide(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    static success(message) {
        Toast.show(message, { type: 'success' });
    }

    static error(message) {
        Toast.show(message, { type: 'error' });
    }

    static info(message) {
        Toast.show(message, { type: 'info' });
    }
}

export { Toast };

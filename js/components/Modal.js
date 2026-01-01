/**
 * Modal Dialog Component
 */

import { getIcon } from '../utils/icons.js';

class Modal {
    constructor() {
        this.activeModal = null;
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            container.className = 'modal-container';
            document.body.appendChild(container);
        }
    }

    show(options) {
        const container = document.getElementById('modal-container');

        const modal = document.createElement('div');
        modal.className = 'modal';

        const content = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || ''}</h3>
                    ${options.closable !== false ? `<button class="modal-close btn-icon">${getIcon('x')}</button>` : ''}
                </div>
                <div class="modal-body">
                    ${options.body || ''}
                </div>
                ${options.footer ? `
                    <div class="modal-footer">
                        ${options.footer}
                    </div>
                ` : ''}
            </div>
        `;

        modal.innerHTML = content;
        container.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Close handlers
        if (options.closable !== false) {
            const closeBtn = modal.querySelector('.modal-close');
            const backdrop = modal.querySelector('.modal-backdrop');

            closeBtn?.addEventListener('click', () => this.hide(modal));
            backdrop?.addEventListener('click', () => this.hide(modal));
        }

        this.activeModal = modal;
        return modal;
    }

    hide(modal = null) {
        const targetModal = modal || this.activeModal;
        if (!targetModal) return;

        targetModal.classList.remove('show');
        setTimeout(() => {
            targetModal.remove();
            if (targetModal === this.activeModal) {
                this.activeModal = null;
            }
        }, 300);
    }

    confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const footer = `
                <button class="btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn-primary" data-action="confirm">Confirm</button>
            `;

            const modal = this.show({
                title,
                body: `<p>${message}</p>`,
                footer,
                closable: true
            });

            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.hide(modal);
                resolve(false);
            });

            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                this.hide(modal);
                resolve(true);
            });
        });
    }

    prompt(message, title = 'Input', defaultValue = '') {
        return new Promise((resolve) => {
            const body = `
                <p>${message}</p>
                <input type="text" class="modal-input" value="${defaultValue}" autofocus>
            `;

            const footer = `
                <button class="btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn-primary" data-action="ok">OK</button>
            `;

            const modal = this.show({
                title,
                body,
                footer,
                closable: true
            });

            const input = modal.querySelector('.modal-input');

            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.hide(modal);
                resolve(null);
            });

            modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
                this.hide(modal);
                resolve(input.value);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.hide(modal);
                    resolve(input.value);
                }
            });
        });
    }
}

export const modal = new Modal();

/**
 * Action Sheet Component (Bottom Sheet)
 */

import { getIcon } from '../utils/icons.js';

class ActionSheet {
    constructor() {
        this.activeSheet = null;
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('actionsheet-container')) {
            const container = document.createElement('div');
            container.id = 'actionsheet-container';
            container.className = 'actionsheet-container';
            document.body.appendChild(container);
        }
    }

    show(options) {
        const container = document.getElementById('actionsheet-container');

        const sheet = document.createElement('div');
        sheet.className = 'actionsheet';

        const actionsHTML = options.actions.map(action => {
            const icon = action.icon ? getIcon(action.icon) : '';
            const className = `actionsheet-item ${action.destructive ? 'destructive' : ''}`;

            return `
                <button class="${className}" data-action="${action.id}">
                    ${icon ? `<span class="actionsheet-icon">${icon}</span>` : ''}
                    <span class="actionsheet-label">${action.label}</span>
                </button>
            `;
        }).join('');

        const content = `
            <div class="actionsheet-backdrop"></div>
            <div class="actionsheet-content">
                ${options.title ? `<div class="actionsheet-title">${options.title}</div>` : ''}
                <div class="actionsheet-actions">
                    ${actionsHTML}
                </div>
                <button class="actionsheet-cancel">${options.cancelLabel || 'Cancel'}</button>
            </div>
        `;

        sheet.innerHTML = content;
        container.appendChild(sheet);

        // Animate in
        requestAnimationFrame(() => {
            sheet.classList.add('show');
        });

        // Handle action clicks
        sheet.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.action;
                const action = options.actions.find(a => a.id === actionId);

                if (action?.handler) {
                    action.handler();
                }

                this.hide(sheet);
            });
        });

        // Handle cancel
        sheet.querySelector('.actionsheet-cancel').addEventListener('click', () => {
            this.hide(sheet);
            if (options.onCancel) options.onCancel();
        });

        sheet.querySelector('.actionsheet-backdrop').addEventListener('click', () => {
            this.hide(sheet);
            if (options.onCancel) options.onCancel();
        });

        this.activeSheet = sheet;
        return sheet;
    }

    hide(sheet = null) {
        const targetSheet = sheet || this.activeSheet;
        if (!targetSheet) return;

        targetSheet.classList.remove('show');
        setTimeout(() => {
            targetSheet.remove();
            if (targetSheet === this.activeSheet) {
                this.activeSheet = null;
            }
        }, 300);
    }
}

export const actionSheet = new ActionSheet();

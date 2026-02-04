/**
 * Team Ressourcen Planer - Application Logic
 * Version: 0.7.1
 *
 * @description A web-based tool for visualizing and managing team member
 *              availability and task assignments across weeks.
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    version: '0.7.1',
    teams: ['Development', 'Sales', 'Consulting', 'Marketing'],
    employeesPerTeam: [8, 6, 10, 6],
    weeksToShow: 12,
    storageKeys: {
        employees: 'planer_employees',
        tasks: 'planer_tasks'
    },
    toastDuration: 3000
};

// ============================================
// State Management
// ============================================
const State = {
    employees: [],
    tasks: [],
    weekKeys: [],

    /**
     * Reset state to initial values
     */
    reset() {
        this.employees = [];
        this.tasks = [];
        this.weekKeys = [];
    }
};

// ============================================
// Storage Module
// ============================================
const Storage = {
    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get item from localStorage with error handling
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        if (!this.isAvailable()) {
            Toast.show('LocalStorage nicht verfügbar. Daten werden nicht gespeichert.', 'warning');
            return null;
        }

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error(`Error reading from localStorage: ${key}`, e);
            Toast.show('Fehler beim Laden der Daten.', 'error');
            return null;
        }
    },

    /**
     * Set item in localStorage with error handling
     * @param {string} key
     * @param {any} value
     * @returns {boolean}
     */
    set(key, value) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error writing to localStorage: ${key}`, e);
            Toast.show('Fehler beim Speichern der Daten.', 'error');
            return false;
        }
    },

    /**
     * Clear all app data from localStorage
     */
    clear() {
        if (!this.isAvailable()) return;

        try {
            localStorage.removeItem(CONFIG.storageKeys.employees);
            localStorage.removeItem(CONFIG.storageKeys.tasks);
        } catch (e) {
            console.error('Error clearing localStorage', e);
        }
    }
};

// ============================================
// Toast Notification Module
// ============================================
const Toast = {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            this.container.setAttribute('role', 'alert');
            this.container.setAttribute('aria-live', 'polite');
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show a toast notification
     * @param {string} message
     * @param {'success'|'error'|'info'|'warning'} type
     */
    show(message, type = 'info') {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, CONFIG.toastDuration);
    }
};

// ============================================
// Date Utilities
// ============================================
const DateUtils = {
    /**
     * Get ISO week number for a date
     * @param {Date} date
     * @returns {{year: number, week: number}}
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return { year: d.getUTCFullYear(), week: weekNo };
    },

    /**
     * Generate week keys for the configured number of weeks
     * @returns {Array<{key: string, label: string, full: {year: number, week: number}}>}
     */
    generateWeekKeys() {
        const weeks = [];
        const today = new Date();

        for (let i = 0; i < CONFIG.weeksToShow; i++) {
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (i * 7));
            const kw = this.getWeekNumber(d);
            const weekString = `${kw.year}-W${kw.week.toString().padStart(2, '0')}`;
            weeks.push({ key: weekString, label: `KW ${kw.week}`, full: kw });
        }

        return weeks;
    }
};

// ============================================
// Data Management
// ============================================
const DataManager = {
    /**
     * Load data from storage
     */
    load() {
        const storedEmps = Storage.get(CONFIG.storageKeys.employees);
        const storedTasks = Storage.get(CONFIG.storageKeys.tasks);

        if (storedEmps && Array.isArray(storedEmps)) {
            State.employees = storedEmps;
        } else {
            this.generateDummyEmployees();
        }

        if (storedTasks && Array.isArray(storedTasks)) {
            State.tasks = storedTasks;
        }

        State.weekKeys = DateUtils.generateWeekKeys();
    },

    /**
     * Generate dummy employee data
     */
    generateDummyEmployees() {
        let idCounter = 1;
        State.employees = [];

        CONFIG.teams.forEach((team, index) => {
            for (let i = 0; i < CONFIG.employeesPerTeam[index]; i++) {
                State.employees.push({
                    id: idCounter,
                    name: `Mitarbeiter ${idCounter}`,
                    team: team
                });
                idCounter++;
            }
        });

        this.save();
    },

    /**
     * Save current state to storage
     */
    save() {
        Storage.set(CONFIG.storageKeys.employees, State.employees);
        Storage.set(CONFIG.storageKeys.tasks, State.tasks);
    },

    /**
     * Reset all data
     */
    reset() {
        if (confirm('Wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            Storage.clear();
            Toast.show('Alle Daten wurden gelöscht.', 'success');
            setTimeout(() => location.reload(), 500);
        }
    },

    /**
     * Create a task lookup map for efficient rendering
     * @returns {Map<string, object>}
     */
    createTaskLookup() {
        const lookup = new Map();
        State.tasks.forEach(task => {
            const key = `${task.empId}-${task.week}`;
            lookup.set(key, task);
        });
        return lookup;
    },

    /**
     * Add a new task
     * @param {number} empId
     * @param {string} week
     * @param {string} type
     * @param {string} desc
     * @returns {boolean}
     */
    addTask(empId, week, type, desc) {
        // Validate employee exists
        const employee = State.employees.find(e => e.id === empId);
        if (!employee) {
            Toast.show('Mitarbeiter nicht gefunden.', 'error');
            return false;
        }

        // Check for duplicate
        const existing = State.tasks.find(t => t.empId === empId && t.week === week);
        if (existing) {
            Toast.show('Für diese Woche existiert bereits ein Eintrag.', 'warning');
            return false;
        }

        // Sanitize description
        const sanitizedDesc = this.sanitizeInput(desc);

        State.tasks.push({
            id: Date.now() + Math.random(),
            empId,
            week,
            type,
            desc: sanitizedDesc
        });

        this.save();
        Toast.show('Eintrag gespeichert.', 'success');
        return true;
    },

    /**
     * Delete a task
     * @param {number} taskId
     */
    deleteTask(taskId) {
        if (confirm('Eintrag löschen?')) {
            State.tasks = State.tasks.filter(t => t.id !== taskId);
            this.save();
            Toast.show('Eintrag gelöscht.', 'success');
            Renderer.renderBody();
        }
    },

    /**
     * Sanitize user input to prevent XSS
     * @param {string} input
     * @returns {string}
     */
    sanitizeInput(input) {
        if (!input) return '';
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};

// ============================================
// UI Renderer
// ============================================
const Renderer = {
    /**
     * Render table header with week columns
     */
    renderHeader() {
        const tr = document.getElementById('headerRow');
        if (!tr) return;

        // Clear existing week headers (keep first column)
        while (tr.children.length > 1) {
            tr.removeChild(tr.lastChild);
        }

        State.weekKeys.forEach((wk, index) => {
            const th = document.createElement('th');
            th.textContent = wk.label;
            th.setAttribute('scope', 'col');
            if (index === 0) {
                th.classList.add('current-week');
                th.setAttribute('aria-label', `${wk.label} (Aktuelle Woche)`);
            }
            tr.appendChild(th);
        });
    },

    /**
     * Render table body with employees and tasks
     */
    renderBody() {
        const tbody = document.getElementById('plannerBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Create task lookup for O(1) access
        const taskLookup = DataManager.createTaskLookup();

        let currentTeam = '';

        State.employees.forEach(emp => {
            // Team Header
            if (emp.team !== currentTeam) {
                currentTeam = emp.team;
                const trHead = document.createElement('tr');
                trHead.className = 'team-header';
                trHead.setAttribute('role', 'row');

                const tdHead = document.createElement('td');
                tdHead.colSpan = State.weekKeys.length + 1;
                tdHead.textContent = currentTeam;
                tdHead.setAttribute('role', 'rowheader');

                trHead.appendChild(tdHead);
                tbody.appendChild(trHead);
            }

            const tr = document.createElement('tr');
            tr.setAttribute('role', 'row');

            // Employee name column
            const thName = document.createElement('th');
            thName.textContent = emp.name;
            thName.setAttribute('scope', 'row');
            tr.appendChild(thName);

            // Week columns
            State.weekKeys.forEach((wk, index) => {
                const td = document.createElement('td');
                td.setAttribute('role', 'gridcell');

                if (index === 0) {
                    td.classList.add('current-week');
                }

                // Check for task using lookup
                const taskKey = `${emp.id}-${wk.key}`;
                const task = taskLookup.get(taskKey);

                if (task) {
                    const div = document.createElement('div');
                    div.className = `task type-${task.type}`;
                    div.textContent = task.desc || this.getTaskTypeLabel(task.type);
                    div.setAttribute('role', 'button');
                    div.setAttribute('tabindex', '0');
                    div.setAttribute('aria-label', `${task.desc || task.type} - Klicken zum Löschen`);

                    // Click handler
                    div.addEventListener('click', (e) => {
                        e.stopPropagation();
                        DataManager.deleteTask(task.id);
                    });

                    // Keyboard handler
                    div.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            DataManager.deleteTask(task.id);
                        }
                    });

                    td.appendChild(div);
                } else {
                    // Empty cell - clickable
                    td.classList.add('clickable');
                    td.setAttribute('tabindex', '0');
                    td.setAttribute('aria-label', `${emp.name}, ${wk.label} - Klicken zum Planen`);
                    td.title = 'Klicken zum Planen';

                    td.addEventListener('click', () => Modal.open(emp.id, wk.key));
                    td.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            Modal.open(emp.id, wk.key);
                        }
                    });
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    },

    /**
     * Get human-readable label for task type
     * @param {string} type
     * @returns {string}
     */
    getTaskTypeLabel(type) {
        const labels = {
            'projekt': 'Projekt',
            'support': 'Support',
            'reise': 'Reise',
            'training': 'Training'
        };
        return labels[type] || type;
    }
};

// ============================================
// Modal Controller
// ============================================
const Modal = {
    element: null,

    /**
     * Initialize modal
     */
    init() {
        this.element = document.getElementById('modal');
        if (!this.element) return;

        // Close on backdrop click
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.element.classList.contains('active')) {
                this.close();
            }
        });

        // Form submit handler
        const form = document.getElementById('taskForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.save();
            });
        }
    },

    /**
     * Open modal for task creation
     * @param {number} empId
     * @param {string} weekKey
     */
    open(empId, weekKey) {
        if (!this.element) return;

        document.getElementById('selectedEmpId').value = empId;
        document.getElementById('selectedWeek').value = weekKey;
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskType').selectedIndex = 0;

        this.element.classList.add('active');

        // Focus first input
        setTimeout(() => {
            document.getElementById('taskType').focus();
        }, 100);
    },

    /**
     * Close modal
     */
    close() {
        if (!this.element) return;
        this.element.classList.remove('active');
    },

    /**
     * Save task from modal form
     */
    save() {
        const empId = parseInt(document.getElementById('selectedEmpId').value, 10);
        const week = document.getElementById('selectedWeek').value;
        const type = document.getElementById('taskType').value;
        const desc = document.getElementById('taskDesc').value.trim();

        if (isNaN(empId) || !week) {
            Toast.show('Ungültige Daten.', 'error');
            return;
        }

        if (DataManager.addTask(empId, week, type, desc)) {
            this.close();
            Renderer.renderBody();
        }
    }
};

// ============================================
// Application Initialization
// ============================================
const App = {
    /**
     * Initialize the application
     */
    init() {
        // Initialize modules
        Toast.init();
        Modal.init();

        // Load data
        DataManager.load();

        // Render UI
        Renderer.renderHeader();
        Renderer.renderBody();

        // Set up global handlers
        this.setupGlobalHandlers();

        // Display version
        const versionEl = document.getElementById('version');
        if (versionEl) {
            versionEl.textContent = `v${CONFIG.version}`;
        }

        console.log(`Team Ressourcen Planer v${CONFIG.version} initialized`);
    },

    /**
     * Setup global event handlers
     */
    setupGlobalHandlers() {
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => DataManager.reset());
        }
    }
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, State, Storage, Toast, DateUtils, DataManager, Renderer, Modal, App };
}

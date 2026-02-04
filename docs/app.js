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
    version: '0.8.0',
    teams: ['IC Team', 'CMS Team', 'AS Team', 'HM Team'],
    weeksToShow: 12,
    storageKeys: {
        employees: 'planer_employees',
        tasks: 'planer_tasks'
    },
    toastDuration: 3000,

    // Project Categories
    categories: {
        T89: { name: 'T89', color: '#3b82f6' },
        DPQ: { name: 'DPQ', color: '#10b981' },
        F4500: { name: 'F4500', color: '#8b5cf6' },
        AFS: { name: 'AFS', color: '#f59e0b' }
    },

    // Demo Data
    demoEmployees: {
        'IC Team': [
            'IC-MA 1', 'IC-MA 2', 'IC-MA 3', 'IC-MA 4', 'IC-MA 5', 'IC-MA 6'
        ],
        'CMS Team': [
            'CMS-MA 1', 'CMS-MA 2', 'CMS-MA 3', 'CMS-MA 4', 'CMS-MA 5'
        ],
        'AS Team': [
            'AS-MA 1', 'AS-MA 2', 'AS-MA 3', 'AS-MA 4', 'AS-MA 5', 'AS-MA 6'
        ],
        'HM Team': [
            'HM-MA 1', 'HM-MA 2', 'HM-MA 3', 'HM-MA 4'
        ]
    },

    // Demo Projects with 9-digit fake numbers
    demoProjects: {
        T89: [
            { name: 'CloudSync/89', number: '777-421-893' },
            { name: 'DataHub/89', number: '834-556-127' },
            { name: 'Portal/89', number: '912-678-345' }
        ],
        DPQ: [
            { name: 'DPQ Analytics', number: '456-789-123' },
            { name: 'DPQ Migration', number: '321-654-987' },
            { name: 'DPQ Core', number: '159-753-486' }
        ],
        F4500: [
            { name: 'EmelyEstate', number: '888-333-777' }
        ],
        AFS: [
            { name: 'AFS Support', number: '246-813-579' },
            { name: 'AFS Maintenance', number: '135-792-468' }
        ]
    },

    // Trainings by Team (trainers = number of trainers needed)
    demoTrainings: {
        'AS Team': [
            { name: 'R9500 I&C', trainers: 2 },
            { name: 'R9500 S&T', trainers: 2 },
            { name: 'F4500 I&C', trainers: 2 },
            { name: 'F4500 S&T', trainers: 2 },
            { name: 'DPQ', trainers: 2 }
        ],
        'CMS Team': [
            { name: 'T8900', trainers: 2 },
            { name: 'T8600', trainers: 2 },
            { name: 'DPX', trainers: 2 },
            { name: 'CowScout', trainers: 2 }
        ],
        'HM Team': [
            { name: 'DairyNet', trainers: 2 },
            { name: 'DairyPlan', trainers: 2 },
            { name: 'Good Cow Feeding', trainers: 2 },
            { name: 'Good Cow Milking', trainers: 2 }
        ]
    }
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
     * Load data from storage (starts empty if no data)
     */
    load() {
        const storedEmps = Storage.get(CONFIG.storageKeys.employees);
        const storedTasks = Storage.get(CONFIG.storageKeys.tasks);

        if (storedEmps && Array.isArray(storedEmps)) {
            State.employees = storedEmps;
        } else {
            State.employees = [];
        }

        if (storedTasks && Array.isArray(storedTasks)) {
            State.tasks = storedTasks;
        } else {
            State.tasks = [];
        }

        State.weekKeys = DateUtils.generateWeekKeys();
    },

    /**
     * Check if demo data is currently loaded
     * @returns {boolean}
     */
    hasDemoData() {
        return State.employees.length > 0;
    },

    /**
     * Load demo data
     */
    loadDemoData() {
        this.generateDummyEmployees();
        Toast.show('Demo-Daten wurden geladen.', 'success');
        Renderer.renderBody();
        App.updateDemoButton();
    },

    /**
     * Clear all demo data
     */
    clearDemoData() {
        State.employees = [];
        State.tasks = [];
        this.save();
        Toast.show('Demo-Daten wurden gelöscht.', 'success');
        Renderer.renderBody();
        App.updateDemoButton();
    },

    /**
     * Generate demo employee data
     */
    generateDummyEmployees() {
        let idCounter = 1;
        State.employees = [];

        CONFIG.teams.forEach(team => {
            const teamEmployees = CONFIG.demoEmployees[team] || [];
            teamEmployees.forEach(name => {
                State.employees.push({
                    id: idCounter++,
                    name: name,
                    team: team
                });
            });
        });

        // Generate demo tasks after employees
        this.generateDemoTasks();
        this.save();
    },

    /**
     * Generate demo tasks with proper assignments
     * - IC Team: T89 and DPQ projects
     * - CMS Team: T89 projects
     * - AS Team: DPQ and AFS projects
     * - Trainings: Each team does their specific trainings (2 trainers each)
     * - Hotline rotation for AS team members
     */
    generateDemoTasks() {
        State.tasks = [];
        const weeks = DateUtils.generateWeekKeys();

        // Track which employee-week combinations are used
        const usedSlots = new Set();

        const isSlotFree = (empId, weekKey) => !usedSlots.has(`${empId}-${weekKey}`);
        const markSlotUsed = (empId, weekKey) => usedSlots.add(`${empId}-${weekKey}`);

        const addTask = (empId, weekKey, type, desc, category = null) => {
            if (!isSlotFree(empId, weekKey)) return false;

            State.tasks.push({
                id: Date.now() + Math.random(),
                empId,
                week: weekKey,
                type,
                desc,
                category
            });
            markSlotUsed(empId, weekKey);
            return true;
        };

        // Get employees by team
        const getTeamEmployees = (teamName) =>
            State.employees.filter(e => e.team === teamName);

        const icTeam = getTeamEmployees('IC Team');
        const cmsTeam = getTeamEmployees('CMS Team');
        const asTeam = getTeamEmployees('AS Team');
        const hmTeam = getTeamEmployees('HM Team');

        // === IC Team: T89 and DPQ projects ===
        const icT89Projects = CONFIG.demoProjects.T89;
        const icDPQProjects = CONFIG.demoProjects.DPQ;

        icTeam.forEach((emp, idx) => {
            // Distribute T89 projects (first half of team)
            if (idx < 3) {
                const project = icT89Projects[idx % icT89Projects.length];
                for (let w = 0; w < Math.min(6, weeks.length); w++) {
                    addTask(emp.id, weeks[w].key, 'projekt',
                        `${project.name} (${project.number})`, 'T89');
                }
            }
            // Distribute DPQ projects (second half of team)
            else {
                const project = icDPQProjects[(idx - 3) % icDPQProjects.length];
                for (let w = 0; w < Math.min(6, weeks.length); w++) {
                    addTask(emp.id, weeks[w].key, 'projekt',
                        `${project.name} (${project.number})`, 'DPQ');
                }
            }
        });

        // === CMS Team: T89 projects ===
        cmsTeam.forEach((emp, idx) => {
            const project = icT89Projects[idx % icT89Projects.length];
            for (let w = 0; w < Math.min(5, weeks.length); w++) {
                addTask(emp.id, weeks[w].key, 'projekt',
                    `${project.name} (${project.number})`, 'T89');
            }
        });

        // === AS Team: DPQ and AFS projects ===
        const afsProjects = CONFIG.demoProjects.AFS;

        asTeam.forEach((emp, idx) => {
            // First half: DPQ
            if (idx < 3) {
                const project = icDPQProjects[idx % icDPQProjects.length];
                for (let w = 0; w < Math.min(4, weeks.length); w++) {
                    addTask(emp.id, weeks[w].key, 'projekt',
                        `${project.name} (${project.number})`, 'DPQ');
                }
            }
            // Second half: AFS
            else {
                const project = afsProjects[(idx - 3) % afsProjects.length];
                for (let w = 0; w < Math.min(4, weeks.length); w++) {
                    addTask(emp.id, weeks[w].key, 'support',
                        `${project.name} (${project.number})`, 'AFS');
                }
            }
        });

        // === F4500 / EmelyEstate - add to some free slots ===
        const emelyProject = CONFIG.demoProjects.F4500[0];
        // Assign to 2 IC team members in later weeks
        if (icTeam.length >= 2 && weeks.length > 6) {
            addTask(icTeam[0].id, weeks[7].key, 'projekt',
                `${emelyProject.name} (${emelyProject.number})`, 'F4500');
            addTask(icTeam[1].id, weeks[7].key, 'projekt',
                `${emelyProject.name} (${emelyProject.number})`, 'F4500');
        }

        // === Trainings: Team-specific trainings distributed over 12 weeks ===
        // Each team does their own trainings, 2 trainers per training
        const teamsWithTrainings = [
            { team: asTeam, trainings: CONFIG.demoTrainings['AS Team'] || [] },
            { team: cmsTeam, trainings: CONFIG.demoTrainings['CMS Team'] || [] },
            { team: hmTeam, trainings: CONFIG.demoTrainings['HM Team'] || [] }
        ];

        teamsWithTrainings.forEach(({ team, trainings }) => {
            if (!trainings.length || !team.length) return;

            // Distribute trainings across 12 weeks
            trainings.forEach((training, tIdx) => {
                // Spread trainings across weeks (every 2-3 weeks per team)
                const weekIdx = (tIdx * 3) % weeks.length;
                if (weekIdx >= weeks.length) return;

                const weekKey = weeks[weekIdx].key;

                // Find 2 trainers from this team
                let trainersAssigned = 0;
                for (const emp of team) {
                    if (trainersAssigned >= training.trainers) break;
                    if (isSlotFree(emp.id, weekKey)) {
                        addTask(emp.id, weekKey, 'training', training.name);
                        trainersAssigned++;
                    }
                }
            });
        });

        // === Hotline Rotation for AS Team ===
        // One AS team member per week, rotating through free slots
        asTeam.forEach((emp, idx) => {
            // Each AS member gets hotline duty in rotation
            for (let w = idx; w < weeks.length; w += asTeam.length) {
                if (isSlotFree(emp.id, weeks[w].key)) {
                    addTask(emp.id, weeks[w].key, 'support', 'Hotline-Rotation AS');
                }
            }
        });

        // === HM Team: Support & Beratung tasks ===
        hmTeam.forEach((emp) => {
            for (let w = 0; w < weeks.length; w++) {
                if (isSlotFree(emp.id, weeks[w].key)) {
                    addTask(emp.id, weeks[w].key, 'support', 'Support & Beratung');
                }
            }
        });

        console.log(`Generated ${State.tasks.length} demo tasks`);
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
     * @param {string|null} category
     * @returns {boolean}
     */
    addTask(empId, week, type, desc, category = null) {
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

        const task = {
            id: Date.now() + Math.random(),
            empId,
            week,
            type,
            desc: sanitizedDesc
        };

        if (category) {
            task.category = category;
        }

        State.tasks.push(task);

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
                    if (task.category) {
                        div.classList.add(`category-${task.category}`);
                    }
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

        // Show/hide category based on task type
        const taskTypeSelect = document.getElementById('taskType');
        const categoryGroup = document.getElementById('categoryGroup');
        if (taskTypeSelect && categoryGroup) {
            taskTypeSelect.addEventListener('change', () => {
                categoryGroup.style.display =
                    (taskTypeSelect.value === 'projekt' || taskTypeSelect.value === 'support')
                        ? 'block' : 'none';
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

        // Reset and show category for default type (projekt)
        const categorySelect = document.getElementById('taskCategory');
        const categoryGroup = document.getElementById('categoryGroup');
        if (categorySelect) categorySelect.selectedIndex = 0;
        if (categoryGroup) categoryGroup.style.display = 'block';

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
        const categoryEl = document.getElementById('taskCategory');
        const category = categoryEl ? categoryEl.value : null;

        if (isNaN(empId) || !week) {
            Toast.show('Ungültige Daten.', 'error');
            return;
        }

        if (DataManager.addTask(empId, week, type, desc, category)) {
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

        // Update demo button state
        this.updateDemoButton();

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
        // Demo button - toggle between load/clear
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                if (DataManager.hasDemoData()) {
                    DataManager.clearDemoData();
                } else {
                    DataManager.loadDemoData();
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => DataManager.reset());
        }
    },

    /**
     * Update demo button text and style based on data state
     */
    updateDemoButton() {
        const demoBtn = document.getElementById('demoBtn');
        if (!demoBtn) return;

        if (DataManager.hasDemoData()) {
            demoBtn.textContent = 'DEMO DATEN LÖSCHEN';
            demoBtn.classList.add('loaded');
            demoBtn.setAttribute('aria-label', 'Demo Daten löschen');
        } else {
            demoBtn.textContent = 'DEMO DATEN LADEN';
            demoBtn.classList.remove('loaded');
            demoBtn.setAttribute('aria-label', 'Demo Daten laden');
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

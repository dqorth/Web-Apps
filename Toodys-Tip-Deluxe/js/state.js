// js/state.js
window.appState = (() => {
    // Default state structure
    let state = {
        employees: [], // Array of employee objects { id, name, defaultPosition, defaultPayRate, isActive }
        dailyShifts: {},    // Object of shift objects, keyed by date YYYY-MM-DD
        positions: ["Server", "Busser", "Shake Spinner", "Food Runner", "Host"], // Updated from pre-refactored
        payRates: {
            'Server': 2.13,
            'Busser': 5.00, // Example, adjust as needed for new roles
            'Shake Spinner': 7.50, // Example
            'Food Runner': 7.50, // Example
            'Host': 10.00,
            // Original roles kept for now, can be cleaned up later
            'Bartender': 8.00,
            'Cook': 15.00,
            'Dishwasher': 12.00,
            'Manager': 20.00
        },
        baseCycleStartDateString: '2025-06-02T00:00:00Z', // Added from pre-refactored
        currentReportWeekStartDate: null, // Added from pre-refactored
        activeSelectedDate: null, // Added from pre-refactored
        currentSelectedDayOfWeek: new Date().getUTCDay(), // Added from pre-refactored

        currentEditingShiftId: null,
        currentEditingEmployeeId: null,
        currentView: 'shifts', // e.g., 'shifts', 'employees', 'reports', 'settings'
        reportData: { // Structure for holding generated report data
            weekly: {},
            payPeriod: {},
            custom: {}
        },
        settings: {
            payPeriodStartDate: null, // YYYY-MM-DD
            payPeriodEndDate: null,   // YYYY-MM-DD
            darkMode: false,
            autoSave: true,
            defaultTipOutPercentage: 0 // Example setting
        },
        lastSaveTimestamp: null,
        unsavedChanges: false,
        tutorialCompleted: false
    };

    const observers = [];

    /**
     * Subscribes a callback function to state changes.
     * @param {Function} callback - The function to call when state changes.
     */
    function subscribe(callback) {
        observers.push(callback);
    }

    /**
     * Notifies all subscribed observers about a state change.
     * @param {Object} [changeDetails={}] - Optional details about what changed.
     */
    function notify(changeDetails = {}) {
        // console.log("[state.js] Notifying observers of state change:", changeDetails, "New state:", JSON.parse(JSON.stringify(state)));
        observers.forEach(callback => callback(state, changeDetails));
        state.unsavedChanges = true; // Mark changes as unsaved whenever state is updated
        // Potentially trigger auto-save if enabled
        if (state.settings.autoSave) {
            // Debounce save to avoid too frequent saves
            debouncedSaveState();
        }
    }

    /**
     * Updates a part of the state or the entire state object.
     * @param {Object|Function} newStateOrUpdater - An object with new state values or a function that takes current state and returns new state.
     * @param {Object} [changeDetails={}] - Optional details about the change for observers.
     */
    function setState(newStateOrUpdater, changeDetails = {}) {
        let oldState = JSON.parse(JSON.stringify(state)); // Deep clone for comparison or specific change tracking
        if (typeof newStateOrUpdater === 'function') {
            state = { ...state, ...newStateOrUpdater(state) };
        } else {
            // Ensure nested objects like settings are merged, not just overwritten, if the new state is partial
            const updatedState = { ...state };
            for (const key in newStateOrUpdater) {
                if (newStateOrUpdater.hasOwnProperty(key)) {
                    if (typeof newStateOrUpdater[key] === 'object' && newStateOrUpdater[key] !== null && !Array.isArray(newStateOrUpdater[key]) && state[key] && typeof state[key] === 'object') {
                        updatedState[key] = { ...state[key], ...newStateOrUpdater[key] };
                    } else {
                        updatedState[key] = newStateOrUpdater[key];
                    }
                }
            }
            state = updatedState;
        }
        // If changeDetails is not provided, try to infer it (basic example)
        if (Object.keys(changeDetails).length === 0) {
            const changedKeys = Object.keys(newStateOrUpdater);
            if (changedKeys.length > 0) {
                changeDetails = { updated: changedKeys };
            }
        }
        notify(changeDetails);
    }

    /**
     * Gets the current state.
     * @returns {Object} The current state object.
     */
    function getState() {
        return state; // Consider returning a deep clone if direct mutation is a concern: JSON.parse(JSON.stringify(state))
    }

    /**
     * Saves the current application state to localStorage.
     */
    function saveState() {
        try {
            // console.log("[state.js] Attempting to save state:", state);
            const stateToSave = { ...state };
            // Avoid saving transient data like currentEditingShiftId or reportData if they are always regenerated
            delete stateToSave.currentEditingShiftId;
            delete stateToSave.currentEditingEmployeeId;
            // delete stateToSave.reportData; // Or decide to save it if it's useful

            localStorage.setItem('tipTrackerAppState', JSON.stringify(stateToSave));
            state.lastSaveTimestamp = new Date().toISOString();
            state.unsavedChanges = false;
            notify({ event: 'stateSaved', timestamp: state.lastSaveTimestamp });
            // console.log("[state.js] State saved successfully.");
            if (window.ui && window.ui.showToast) {
                window.ui.showToast('Data saved!', 'success');
            }
        } catch (error) {
            console.error("[state.js] Error saving state to localStorage:", error);
            if (window.ui && window.ui.showToast) {
                window.ui.showToast('Error saving data!', 'error');
            }
        }
    }

    const debouncedSaveState = window.utils ? window.utils.debounce(saveState, 1500) : saveState; // Debounce saveState

    /**
     * Loads application state from localStorage.
     */
    function loadState() {
        try {
            const savedState = localStorage.getItem('tipTrackerAppState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Merge with default state to ensure all keys are present if the saved state is older
                state = { ...state, ...parsedState }; 
                // Ensure nested objects like settings are also merged, not overwritten if partially saved
                if (parsedState.settings) {
                    state.settings = { ...state.settings, ...parsedState.settings };
                }
                 // Ensure dailyShifts is an object if loaded from an older state that might have it as an array
                if (Array.isArray(state.dailyShifts)) {
                    state.dailyShifts = {}; // Reset to object if it was an array
                }

                // Re-initialize certain transient properties if needed
                state.currentEditingShiftId = null;
                state.currentEditingEmployeeId = null;
                state.unsavedChanges = false; // Loaded state is considered saved
                
                // console.log("[state.js] State loaded successfully from 'tipTrackerAppState':", state);
                notify({ event: 'stateLoaded' }); // Notify components that state has been loaded
            } else {
                // console.log("[state.js] No 'tipTrackerAppState' found. Attempting to load from legacy keys...");
                // Attempt to load from legacy localStorage keys
                const legacyEmployeeRoster = localStorage.getItem('dinerTipSplit_employeeRosterV2');
                const legacyDailyShifts = localStorage.getItem('dinerTipSplit_dailyShiftsV2');

                let migrated = false;
                if (legacyEmployeeRoster) {
                    try {
                        state.employees = JSON.parse(legacyEmployeeRoster);
                        migrated = true;
                        // console.log("[state.js] Migrated employees from 'dinerTipSplit_employeeRosterV2'");
                    } catch (e) {
                        console.error("[state.js] Error parsing legacy employee roster:", e);
                    }
                }
                if (legacyDailyShifts) {
                    try {
                        const parsedLegacyShifts = JSON.parse(legacyDailyShifts);
                        // Ensure legacy dailyShifts (which should be an object) is correctly assigned
                        if (typeof parsedLegacyShifts === 'object' && parsedLegacyShifts !== null) {
                           state.dailyShifts = parsedLegacyShifts;
                        } else {
                           state.dailyShifts = {}; // Default to empty object if parsing is not as expected
                        }
                        migrated = true;
                        // console.log("[state.js] Migrated daily shifts from 'dinerTipSplit_dailyShiftsV2'");
                    } catch (e) {
                        console.error("[state.js] Error parsing legacy daily shifts:", e);
                    }
                }

                if (migrated) {
                    // console.log("[state.js] Legacy data migrated. Saving to new 'tipTrackerAppState'.");
                    saveState(); // Save the migrated state to the new key
                    // Optionally remove legacy keys after successful migration and save
                    // localStorage.removeItem('dinerTipSplit_employeeRosterV2');
                    // localStorage.removeItem('dinerTipSplit_dailyShiftsV2');
                } else {
                    // console.log("[state.js] No legacy data found. Using default state.");
                }
                notify({ event: 'initialStateProcessed' });
            }
        } catch (error) {
            console.error("[state.js] Error loading state from localStorage:", error);
            notify({ event: 'stateLoadFailed' });
        }
    }

    /**
     * Clears all application data from localStorage and resets the state.
     */
    function clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.removeItem('tipTrackerAppState');
            // Also remove legacy keys if they were part of a potential migration
            localStorage.removeItem('dinerTipSplit_employeeRosterV2');
            localStorage.removeItem('dinerTipSplit_dailyShiftsV2');
            
            // Reset to initial default state
            state = {
                employees: [],
                dailyShifts: {}, // Changed from shifts: []
                positions: ["Server", "Busser", "Shake Spinner", "Food Runner", "Host"], // Updated
                payRates: { // Adjusted to match new positions primarily
                    'Server': 2.13,
                    'Busser': 5.00,
                    'Shake Spinner': 7.50,
                    'Food Runner': 7.50,
                    'Host': 10.00,
                    'Bartender': 8.00, // Kept for now
                    'Cook': 15.00,     // Kept for now
                    'Dishwasher': 12.00,// Kept for now
                    'Manager': 20.00   // Kept for now
                },
                baseCycleStartDateString: '2025-06-02T00:00:00Z', // Added
                currentReportWeekStartDate: null, // Added
                activeSelectedDate: null, // Added
                currentSelectedDayOfWeek: new Date().getUTCDay(), // Added

                currentEditingShiftId: null,
                currentEditingEmployeeId: null,
                currentView: 'shifts',
                reportData: { weekly: {}, payPeriod: {}, custom: {} },
                settings: {
                    payPeriodStartDate: null, 
                    payPeriodEndDate: null,   
                    darkMode: false,
                    autoSave: true,
                    defaultTipOutPercentage: 0
                },
                lastSaveTimestamp: null,
                unsavedChanges: false,
                tutorialCompleted: false
            };
            notify({ event: 'dataCleared' });
            // console.log("[state.js] All data cleared.");
            if (window.ui && window.ui.showToast) {
                window.ui.showToast('All data cleared!', 'success');
            }
            // Potentially reload UI elements or the page
            // window.location.reload(); // Or trigger specific UI refresh functions
        }
    }

    // Initialize by trying to load existing state
    // loadState(); // This will be called from main.js or after DOM is ready

    // Public API
    return {
        subscribe,
        setState,
        getState,
        saveState,
        loadState,
        clearAllData,
        // Expose specific setters for convenience if needed, e.g.:
        // addEmployee: (employee) => setState(prevState => ({ employees: [...prevState.employees, employee] }), { event: 'employeeAdded', employeeId: employee.id }),
        // updateShift: (updatedShift) => setState(prevState => ({
        //     shifts: prevState.shifts.map(s => s.id === updatedShift.id ? updatedShift : s)
        // }), { event: 'shiftUpdated', shiftId: updatedShift.id }),
        // etc.
    };
})();

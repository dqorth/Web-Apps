// filepath: c:\\Users\\orthd\\OneDrive\\Documents\\CodeMonkeez\\Projects\\Toodys-Tip-Deluxe\\js\\main.js
// main.js - Main Application Entry Point and Orchestration

window.main = window.main || {}; // Define main object on window if not already defined

// Helper function to re-initialize app after state load (from file or otherwise)
main.initializeApplicationAfterStateLoad = () => {
    const appState = window.state.getAppState(); // Standardized to window.state
    // Initialize tutorial system AFTER state is loaded
    if (window.tutorial && typeof window.tutorial.initialize === 'function') {
        // window.tutorial.initialize(); // Initialize is called once in DOMContentLoaded
        // Check if tutorial should be shown on load (after settings are loaded)
        if (appState.settings && appState.settings.showTutorialOnLoad) {
            console.log("APP_LOG: [main.js] showTutorialOnLoad is true, starting tutorial.");
            if (typeof window.tutorial.start === 'function') {
                window.tutorial.start();
            } else {
                console.warn("APP_LOG: [main.js] window.tutorial.start function not found.");
            }
        } else {
            console.log("APP_LOG: [main.js] showTutorialOnLoad is false or not set, not starting tutorial automatically.");
        }
    } else {
        console.warn("APP_LOG: [main.js] window.tutorial or window.tutorial.initialize function not found for post-load setup.");
    }
    
    console.log("APP_LOG: [main.js] Application components (like tutorial) re-checked after state load.");
};


document.addEventListener('DOMContentLoaded', () => {
    console.log("APP_LOG: [main.js] DOMContentLoaded event fired.");

    // 1. Ensure critical modules are available (utils, state)
    if (!window.utils) {
        console.error("[main.js] Utils module (utils.js) not loaded! Critical error.");
        alert("Critical error: Utils module not found. App may not function correctly.");
        return;
    }
    if (!window.state) {
        console.error("[main.js] State module (state.js) not loaded! Critical error.");
        alert("Critical error: State module not found. App may not function correctly.");
        return;
    }

    // 2. Load application state
    console.log("APP_LOG: [main.js] Loading application state...");
    window.state.loadState(); // Use the unified loadState from state.js
    const appState = window.state.getAppState(); // Get state for further use

    // 3. Initialize UI components and event listeners
    if (window.ui) {
        console.log("APP_LOG: [main.js] Initializing UI module...");
        if (typeof window.ui.init === 'function') window.ui.init(); // General init
        if (typeof window.ui.populateCycleStartDateSelect === 'function') window.ui.populateCycleStartDateSelect();
        if (typeof window.ui.initializeUI === 'function') window.ui.initializeUI(); // More specific UI setup
    } else {
        console.error("[main.js] UI module (ui.js) not loaded!");
    }

    // 4. Initialize other functional modules
    if (window.employees && typeof window.employees.init === 'function') {
        console.log("APP_LOG: [main.js] Initializing Employees module...");
        window.employees.init();
    } else {
        console.warn("[main.js] Employees module (employees.js) not loaded or init function missing.");
    }

    if (window.shifts && typeof window.shifts.init === 'function') {
        console.log("APP_LOG: [main.js] Initializing Shifts module...");
        window.shifts.init();
    } else {
        console.warn("[main.js] Shifts module (shifts.js) not loaded or init function missing.");
    }

    if (window.reports && typeof window.reports.init === 'function') {
        console.log("APP_LOG: [main.js] Initializing Reports module...");
        window.reports.init();
    } else {
        console.warn("[main.js] Reports module (reports.js) not loaded or init function missing.");
    }

    // 5. Initialize Tutorial System
    if (window.tutorial && typeof window.tutorial.init === 'function') {
        console.log("APP_LOG: [main.js] Initializing Tutorial module systems...");
        window.tutorial.init(); // Initialize tutorial event listeners, find buttons etc.
    } else {
        console.warn("[main.js] Tutorial module (tutorial.js) not loaded or init function missing!");
    }
    
    // Explicitly call after state load handler to check for tutorial auto-start etc.
    if (typeof main.initializeApplicationAfterStateLoad === 'function') {
        console.log("APP_LOG: [main.js] Running main.initializeApplicationAfterStateLoad() for initial setup.");
        main.initializeApplicationAfterStateLoad();
    }

    // 6. Set up initial date context
    console.log("APP_LOG: [main.js] Setting up initial date context...");
    // Re-fetch appState as it might have been modified by loadState or other init functions
    const currentAppStateForDate = window.state.getAppState();
    if (!currentAppStateForDate.activeSelectedDate) {
        const today = new Date();
        const formattedToday = (window.utils && typeof window.utils.formatDateForStorage === 'function') 
            ? window.utils.formatDateForStorage(today) 
            : new Date().toISOString().split('T')[0]; // Fallback if util function not found
        window.state.updateAppState({ activeSelectedDate: formattedToday });
        console.log(`APP_LOG: [main.js] Initial activeSelectedDate set to today: ${formattedToday}`);
    }

    if (typeof main.updateDateControlsFromState === 'function') {
        main.updateDateControlsFromState();
    } else {
        console.warn("APP_LOG: [main.js] main.updateDateControlsFromState function not found.");
    }

    if (typeof main.calculateAndUpdateCurrentDate === 'function') {
        main.calculateAndUpdateCurrentDate();
    } else {
        console.warn("APP_LOG: [main.js] main.calculateAndUpdateCurrentDate function not found. Date-dependent UI might not update.");
    }

    // 7. Handle day rollover logic
    console.log("APP_LOG: [main.js] Checking for day rollover...");
    const finalAppState = window.state.getAppState(); // Get the most current state
    const lastOpenedDate = finalAppState.settings ? finalAppState.settings.lastOpenedDate : null;
    const todayString = new Date().toISOString().split('T')[0];

    if (lastOpenedDate !== todayString) {
        if (finalAppState.settings && finalAppState.settings.autoRollover) {
            console.log("APP_LOG: [main.js] New day detected, autoRollover is enabled.");
            // Actual rollover logic (e.g., calling a function in shifts.js or main.js) would be triggered here.
            // For now, this is a placeholder log.
        }
        const newSettings = { ...(finalAppState.settings || {}), lastOpenedDate: todayString };
        window.state.updateAppState({ settings: newSettings });
        console.log(`APP_LOG: [main.js] Updated lastOpenedDate to ${todayString}`);
    } else {
        console.log(`APP_LOG: [main.js] Application opened on the same day or lastOpenedDate is current: ${lastOpenedDate}`);
    }

    // 8. Show default view
    if (window.ui && typeof window.ui.showView === 'function') {
        console.log("APP_LOG: [main.js] Setting default view...");
        window.ui.showView('employeeLineupSection'); 
    } else {
        console.warn("APP_LOG: [main.js] window.ui.showView function not found. Cannot set default view.");
    }

    // 9. Update unsaved changes indicator
    if (window.ui && typeof window.ui.updateUnsavedChangesIndicator === 'function') {
        const freshestAppState = window.state.getAppState();
        window.ui.updateUnsavedChangesIndicator(freshestAppState.unsavedChanges || false);
    } else {
        console.warn("APP_LOG: [main.js] window.ui.updateUnsavedChangesIndicator function not found.");
    }

    // 10. Add beforeunload listener for unsaved changes
    window.addEventListener('beforeunload', (e) => {
        const currentAppState = window.state.getAppState();
        if (currentAppState.unsavedChanges) {
            e.preventDefault(); 
            e.returnValue = ''; 
            return ''; 
        }
    });
    console.log("APP_LOG: [main.js] 'beforeunload' event listener for unsaved changes added.");

    console.log("APP_LOG: [main.js] Main application initialization complete.");
});

// --- Date Control Update Function ---
main.updateDateControlsFromState = () => {
    const appState = (window.state && typeof window.state.getAppState === 'function') 
                     ? window.state.getAppState() 
                     : (window.appState || { settings: {}, activeSelectedDate: null });

    if (!appState.activeSelectedDate) {
        console.warn("APP_LOG: [updateDateControlsFromState] activeSelectedDate not found in appState. Cannot update controls.");
        return;
    }

    const cycleStartDateSelect = document.getElementById('cycleStartDateSelect');
    const weekInCycleSelect = document.getElementById('weekInCycleSelect');

    if (!cycleStartDateSelect || !weekInCycleSelect) {
        console.warn("APP_LOG: [updateDateControlsFromState] Date select elements not all found.");
        return;
    }

    // Ensure weekInCycleSelect has the correct number of options
    const expectedWeeks = (appState.settings && appState.settings.weeksInCycle) ? parseInt(appState.settings.weeksInCycle, 10) : 4;
    if (weekInCycleSelect.options.length !== expectedWeeks) {
        weekInCycleSelect.innerHTML = ''; // Clear existing options
        for (let i = 1; i <= expectedWeeks; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            weekInCycleSelect.appendChild(option);
        }
    }
    
    const activeDate = new Date(appState.activeSelectedDate + 'T00:00:00');
    const baseCycleStartDate = appState.settings.baseCycleStartDate || (window.state && window.state.BASE_CYCLE_START_DATE);
    const weeksInCycle = appState.settings.weeksInCycle;

    if (!baseCycleStartDate || !weeksInCycle) {
        console.warn("APP_LOG: [updateDateControlsFromState] baseCycleStartDate or weeksInCycle missing from settings.");
        return;
    }

    const { cycleStartDate, weekNumberInCycle } = window.utils.getCycleAndWeekForDate(activeDate, baseCycleStartDate, weeksInCycle);

    if (cycleStartDateSelect.value !== cycleStartDate) {
        cycleStartDateSelect.value = cycleStartDate;
        console.log(`APP_LOG: [updateDateControlsFromState] Set cycleStartDateSelect to: ${cycleStartDate}`);
    }
    if (parseInt(weekInCycleSelect.value, 10) !== weekNumberInCycle) {
        weekInCycleSelect.value = weekNumberInCycle.toString();
        console.log(`APP_LOG: [updateDateControlsFromState] Set weekInCycleSelect to: ${weekNumberInCycle}`);
    }
};


// --- Date Calculation and Update ---
main.calculateAndUpdateCurrentDate = () => {
    const appState = (window.state && typeof window.state.getAppState === 'function') 
                     ? window.state.getAppState() 
                     : (window.appState || { settings: {}, activeSelectedDate: null }); // Fallback for appState

    const cycleStartDateSelect = document.getElementById('cycleStartDateSelect');
    const weekInCycleSelect = document.getElementById('weekInCycleSelect');
    
    if (!cycleStartDateSelect || !weekInCycleSelect) {
        console.warn("Date select elements not all found. Skipping date update.");
        // const lineupDisp = document.getElementById('lineupDateDisplay');
        // if (lineupDisp) lineupDisp.textContent = 'Setup Required';
        // const scoopDisp = document.getElementById('scoopDateDisplay');
        // if (scoopDisp) scoopDisp.textContent = 'Setup Required';
        return;
    }
    
    const expectedWeeks = (appState.settings && appState.settings.weeksInCycle) ? parseInt(appState.settings.weeksInCycle, 10) : 4; // Default to 4 if not set
    if (weekInCycleSelect.options.length !== expectedWeeks) {
        weekInCycleSelect.innerHTML = ''; // Clear existing options
        for (let i = 1; i <= expectedWeeks; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            weekInCycleSelect.appendChild(option);
        }
        // If it was empty, try to set a default or re-evaluate current selection
        // This part might be redundant if updateDateControlsFromState runs first on init
        const currentSelectedWeekFromState = appState.settings && appState.settings.currentSelectedWeek;
        if (currentSelectedWeekFromState && currentSelectedWeekFromState <= expectedWeeks) {
            weekInCycleSelect.value = currentSelectedWeekFromState;
        } else if (appState.currentSelectedWeek && appState.currentSelectedWeek <= expectedWeeks) { // Legacy fallback
             weekInCycleSelect.value = appState.currentSelectedWeek;
        } else {
            weekInCycleSelect.value = "1"; // Default to week 1
        }
    }
    
    // If appState.activeSelectedDate is set (e.g., on initial load to today), 
    // try to set the dropdowns to match it.
    // REMOVED THIS BLOCK - Handled by main.updateDateControlsFromState()
    /*
    if (appState.activeSelectedDate) {
        const activeDate = new Date(appState.activeSelectedDate + 'T00:00:00');
        const { cycleStartDate, weekNumberInCycle } = window.utils.getCycleAndWeekForDate(activeDate, appState.settings.baseCycleStartDate || window.state.BASE_CYCLE_START_DATE, appState.settings.weeksInCycle);

        if (cycleStartDateSelect.value !== cycleStartDate) {
            cycleStartDateSelect.value = cycleStartDate;
        }
        if (parseInt(weekInCycleSelect.value, 10) !== weekNumberInCycle) {
            weekInCycleSelect.value = weekNumberInCycle.toString();
        }
    }
    */
    
    let cycleStartDateValue = cycleStartDateSelect.value;
    if (!cycleStartDateValue && appState.settings && appState.settings.payCycleStartDate) {
        cycleStartDateValue = appState.settings.payCycleStartDate;
        cycleStartDateSelect.value = cycleStartDateValue; 
    } else if (!cycleStartDateValue && cycleStartDateSelect.options.length > 0) {
        // If still no value, default to the first option in the dropdown if available
        cycleStartDateValue = cycleStartDateSelect.options[0].value;
        cycleStartDateSelect.value = cycleStartDateValue;
    }

    let cycleStartDate = cycleStartDateValue ? new Date(cycleStartDateValue + 'T00:00:00') : null;
    let weekInCycle = parseInt(weekInCycleSelect.value, 10);

    if (!cycleStartDate || isNaN(cycleStartDate.getTime())) {
        const lineupDisp = document.getElementById('lineupDateDisplay');
        if (lineupDisp) lineupDisp.textContent = 'Set Cycle Start Date';
        const scoopDisp = document.getElementById('scoopDateDisplay');
        if (scoopDisp) scoopDisp.textContent = 'Set Cycle Start Date';
        return;
    }

    if (isNaN(weekInCycle) || weekInCycle < 1) {
        weekInCycle = 1; 
        weekInCycleSelect.value = "1";
    }
    
    const weekOffset = (weekInCycle - 1) * 7; 
    const currentWeekStartDate = new Date(cycleStartDate);
    currentWeekStartDate.setDate(cycleStartDate.getDate() + weekOffset);

    // Ensure activeSelectedDate is set. If not, default to the start of the current week.
    if (!appState.activeSelectedDate) {
        appState.activeSelectedDate = window.utils.formatDate(currentWeekStartDate);
    }
    // If activeSelectedDate is outside the newly calculated week, reset it to the start of that week.
    const activeDateObj = new Date(appState.activeSelectedDate + 'T00:00:00');
    const weekEndForActiveCheck = new Date(currentWeekStartDate);
    weekEndForActiveCheck.setDate(currentWeekStartDate.getDate() + 6);

    if (activeDateObj < currentWeekStartDate || activeDateObj > weekEndForActiveCheck) {
        appState.activeSelectedDate = window.utils.formatDate(currentWeekStartDate);
    }

    const newDateState = {
        activeSelectedDate: appState.activeSelectedDate,
        settings: {
            ...appState.settings,
            currentSelectedWeekStart: window.utils.formatDate(currentWeekStartDate),
            currentSelectedWeek: weekInCycle,
            payCycleStartDate: cycleStartDateValue 
        }
    };

    if (window.state && typeof window.state.updateAppState === 'function') {
        window.state.updateAppState(newDateState, false); // Pass false to avoid immediate save if batching changes
        console.log("APP_LOG: [main.js/calcDate] Updated appState with new date context (no immediate save):", newDateState);
    } else {
        console.error("APP_LOG: [main.js/calcDate] window.state.updateAppState is not available to persist date context.");
        // Fallback to updating the global window.appState directly if updateAppState is missing
        // This is not ideal as it bypasses any logic within updateAppState (like saving to localStorage)
        window.appState = {
            ...window.appState,
            ...newDateState,
            settings: {
                ...window.appState.settings,
                ...newDateState.settings
            }
        };
    }


    // Determine the date to display (active selected day)
    const dateToDisplay = appState.activeSelectedDate ? new Date(appState.activeSelectedDate + 'T00:00:00') : currentWeekStartDate;
    const formattedDateToDisplay = window.utils.formatDisplayDate(window.utils.formatDate(dateToDisplay));

    const lineupDateDisp = document.getElementById('lineupDateDisplay');
    if (lineupDateDisp) {
        lineupDateDisp.textContent = formattedDateToDisplay;
    }
    const scoopDateDisp = document.getElementById('scoopDateDisplay');
    if (scoopDateDisp) {
        scoopDateDisp.textContent = formattedDateToDisplay; 
    }

    // Render day navigation for the lineup section
    if (window.ui && typeof window.ui.renderLineupDayNavigation === 'function') {
        // Pass the date object for the start of the week for which navigation should be built
        window.ui.renderLineupDayNavigation(currentWeekStartDate);
    }
    // Render day navigation for the scoop section
    if (window.ui && typeof window.ui.renderScoopDayNavigation === 'function') {
        window.ui.renderScoopDayNavigation(dateToDisplay); // Pass the actual date object
    }

    if (window.reports && typeof window.reports.displayWeeklyReport === 'function') {
        window.reports.displayWeeklyReport();
    }

    if (window.employees && typeof window.employees.renderEmployeeLineup === 'function' && appState.activeSelectedDate) {
        console.log(`APP_LOG: [main.js/calcDate] Rendering lineup for activeSelectedDate: ${appState.activeSelectedDate}`);
        window.employees.renderEmployeeLineup(appState.activeSelectedDate);
    } else {
        // If renderEmployeeLineup is not available or no active date, clear the lineup
        const rosterListContainer = document.getElementById('rosterListContainer');
        if (rosterListContainer) rosterListContainer.innerHTML = '<p>Lineup not available.</p>';
        console.warn("[main.js/calcDate] Could not render employee lineup. Missing function or activeSelectedDate.", { hasRenderFunc: !!(window.employees && window.employees.renderEmployeeLineup), activeDate: appState.activeSelectedDate });
    }

    if (window.reports && typeof window.reports.calculateAndDisplayDailyPayouts === 'function') {
        console.log(`APP_LOG: [main.js/calcDate] Calculating and displaying daily payouts for: ${appState.activeSelectedDate}`);
        window.reports.calculateAndDisplayDailyPayouts();
    } else {
        const payoutResults = document.getElementById('payoutResults');
        if (payoutResults) payoutResults.innerHTML = '<p>Daily scoop not available.</p>';
    }

    // Final save state after all updates from date calculation
    if (window.state && typeof window.state.saveState === 'function') {
        window.state.saveState();
        console.log("APP_LOG: [main.js/calcDate] Final state save after date context updates.");
    }
};

// --- Global Event Listener Setup ---
main.setupGlobalEventListeners = () => {
    const cycleStartDateSelect = document.getElementById('cycleStartDateSelect');
    const weekInCycleSelect = document.getElementById('weekInCycleSelect');
    const goBackToLineupBtn = document.getElementById('goBackToLineupBtn');
    const showAddEmployeeFormBtn = document.getElementById('showAddEmployeeFormBtn'); // Listener for button in Lineup section
    const toggleAddNewEmployeeFormBtn = document.getElementById('toggleAddNewEmployeeFormBtn'); // Listener for button in Manage Roster section
    const exportWeeklyCSVBtn = document.getElementById('exportWeeklyCSVBtn');
    const downloadStateBtn = document.getElementById('downloadStateBtn');
    const loadStateFile = document.getElementById('loadStateFile');
    
    if (cycleStartDateSelect) {
        cycleStartDateSelect.addEventListener('change', main.calculateAndUpdateCurrentDate);
    }
    if (weekInCycleSelect) {
        weekInCycleSelect.addEventListener('change', main.calculateAndUpdateCurrentDate);
    }

    if (goBackToLineupBtn && window.ui && typeof window.ui.showLineupView === 'function') {
        goBackToLineupBtn.addEventListener('click', window.ui.showLineupView);
    }

    // Listener for the "Manage Roster / Add New Hero" button in The Lineup section
    if (showAddEmployeeFormBtn && window.ui && typeof window.ui.showView === 'function') {
        showAddEmployeeFormBtn.addEventListener('click', () => window.ui.showView('employeeFormSection'));
    } else if (showAddEmployeeFormBtn) {
        console.warn("showAddEmployeeFormBtn (from Lineup section) found, but ui.showView is not a function.");
    }
    
    // Event delegation for employee form buttons
    const addEmployeeFormWrapper = document.getElementById('addEmployeeFormWrapper');
    if (addEmployeeFormWrapper && window.employees) {
        addEmployeeFormWrapper.addEventListener('click', (event) => {
            if (event.target.id === 'addEmployeeBtn' && typeof window.employees.handleAddEmployee === 'function') {
                window.employees.handleAddEmployee();
            } else if (event.target.id === 'updateEmployeeBtn' && typeof window.employees.handleUpdateEmployee === 'function') {
                window.employees.handleUpdateEmployee();
            } else if (event.target.id === 'cancelEditBtn' && typeof window.employees.handleCancelEditEmployee === 'function') {
                window.employees.handleCancelEditEmployee();
            }
        });
        const employeeImportFile = addEmployeeFormWrapper.querySelector('#employeeImportFile');
        if (employeeImportFile && typeof window.employees.handleFileImport === 'function') {
            employeeImportFile.addEventListener('change', window.employees.handleFileImport);
        }
    }

    if (toggleAddNewEmployeeFormBtn && window.ui && typeof window.ui.toggleAddEmployeeFormVisibility === 'function') {
        toggleAddNewEmployeeFormBtn.addEventListener('click', () => window.ui.toggleAddEmployeeFormVisibility());
    } else if (toggleAddNewEmployeeFormBtn) {
         console.warn("toggleAddNewEmployeeFormBtn found, but ui.toggleAddEmployeeFormVisibility is not a function.");
    }

    const weeklyReportContent = document.getElementById('weeklyReportContent');
    if (weeklyReportContent && typeof main.navigateWeek === 'function') {
        weeklyReportContent.addEventListener('click', (event) => {
            if (event.target.id === 'prevWeekBtn') main.navigateWeek(-1); 
            if (event.target.id === 'nextWeekBtn') main.navigateWeek(1); 
        });
    }

    if (exportWeeklyCSVBtn && window.reports && typeof window.reports.exportWeeklyReportToCSV === 'function') {
        exportWeeklyCSVBtn.addEventListener('click', window.reports.exportWeeklyReportToCSV);
    }

    if (downloadStateBtn && window.state && typeof window.state.downloadState === 'function') {
        downloadStateBtn.addEventListener('click', window.state.downloadState);
    }
    if (loadStateFile && window.state && typeof window.state.handleStateFileLoad === 'function') {
        loadStateFile.addEventListener('change', (event) => {
            window.state.handleStateFileLoad(event).then(() => {
                if (window.ui && typeof window.ui.populateCycleStartDateSelect === 'function') window.ui.populateCycleStartDateSelect();
                
                const loadedAppState = window.state.getAppState();
                if (!loadedAppState.activeSelectedDate) {
                    const today = new Date();
                    loadedAppState.activeSelectedDate = window.utils.formatDate(today);
                    window.state.updateAppState({ activeSelectedDate: loadedAppState.activeSelectedDate }, false); // No immediate save
                }

                if (typeof main.updateDateControlsFromState === 'function') {
                    main.updateDateControlsFromState(); 
                }
                if (typeof main.calculateAndUpdateCurrentDate === 'function') {
                    main.calculateAndUpdateCurrentDate(); // This will also save state at the end
                }
                
                if (window.employees) {
                    if (typeof window.employees.renderFullEmployeeListForManagement === 'function') window.employees.renderFullEmployeeListForManagement();
                }
                if (window.ui && typeof window.ui.showLineupView === 'function') window.ui.showLineupView();

                // Tutorial re-initialization might be needed if settings changed
                if (window.tutorial && typeof window.tutorial.initialize === 'function') {
                    window.tutorial.initialize();
                    if (loadedAppState.settings && loadedAppState.settings.showTutorialOnLoad) {
                        window.tutorial.start();
                    }
                }

                console.log("State loaded and UI refreshed.");
                if(window.ui && typeof window.ui.showToast === 'function') window.ui.showToast('Save data loaded successfully!', 'success');
                else alert('Save data loaded successfully!');
            }).catch(error => {
                console.error("Error reloading state:", error);
                if(window.ui && typeof window.ui.showToast === 'function') window.ui.showToast(`Error loading state: ${error.message}`, 'error');
                else alert(`Error loading state: ${error.message}`);
            });
        });
    }
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const addEmployeeFormWrapperEl = document.getElementById('addEmployeeFormWrapper');
            const tutorialOverlay = document.getElementById('tutorial-overlay');

            if (addEmployeeFormWrapperEl && getComputedStyle(addEmployeeFormWrapperEl).display !== 'none') {
                const updateBtn = addEmployeeFormWrapperEl.querySelector('#updateEmployeeBtn');
                if (updateBtn && getComputedStyle(updateBtn).display !== 'none') { // Edit mode
                    if (window.employees && typeof window.employees.handleCancelEditEmployee === 'function') {
                        window.employees.handleCancelEditEmployee(); 
                    }
                } else { // Add mode or form generally visible
                    if (window.ui && typeof window.ui.toggleAddEmployeeFormVisibility === 'function') {
                         window.ui.toggleAddEmployeeFormVisibility(false); // Explicitly hide
                    }
                }
            }
            if (tutorialOverlay && getComputedStyle(tutorialOverlay).display !== 'none' && typeof window.endTutorial === 'function') {
                window.endTutorial();
            }
        }
    });

    // Event Listeners for dynamically added elements (like shift buttons)
    function setupGlobalEventListeners() {
        // Event delegation for "Add Shift" / "Edit Shift" buttons in the lineup
        const rosterListContainer = document.getElementById('rosterListContainer');
        if (rosterListContainer) {
            rosterListContainer.addEventListener('click', (event) => {
                const targetButton = event.target.closest('.worked-today-toggle-btn');
                if (targetButton) {
                    const liElement = targetButton.closest('li[data-employee-id]');
                    if (!liElement) return;

                    const employeeId = liElement.dataset.employeeId;
                    const date = targetButton.dataset.date; // Date should be on the button
                    // const positionId = targetButton.dataset.positionId; // Position ID if needed for context

                    if (!employeeId || !date) {
                        console.error("Employee ID or date missing from shift button dataset.");
                        return;
                    }

                    // Check if a form is already open for this employee on this date
                    const existingForm = liElement.querySelector('.inline-shift-form-container');
                    if (existingForm && existingForm.style.display !== 'none') {
                        // Form is already open, perhaps do nothing or provide a way to close it explicitly
                        // For now, let's assume clicking again should close it if it's the same button
                        // or if the logic in renderShiftInlineForm handles toggling.
                        // The current shifts.js/renderShiftInlineForm handles closing other forms.
                        // If it's the *same* button for an already open form, cancelInlineShift might be called.
                        // Let's ensure renderShiftInlineForm is robust enough or call cancel here.
                    }

                    const appState = window.state.getAppState();
                    let shiftToEdit = null;
                    if (appState.dailyShifts && appState.dailyShifts[date]) {
                        shiftToEdit = appState.dailyShifts[date].find(s => s.employeeId === employeeId);
                        // This assumes one shift per employee per day for the main lineup button.
                        // If multiple shifts are possible, the UI might need a different approach
                        // or this button would edit the primary/first shift.
                    }

                    if (window.shifts && typeof window.shifts.renderShiftInlineForm === 'function') {
                        window.shifts.renderShiftInlineForm(employeeId, date, liElement, shiftToEdit);
                    } else {
                        console.error("shifts.renderShiftInlineForm function not found.");
                        alert("Cannot open shift form at this time.");
                    }
                }
            });
        }
    }

    setupGlobalEventListeners();
};

// --- Week Navigation for Reports ---
main.navigateWeek = (direction) => {
    const appState = window.state.getAppState();
    if (!appState || !appState.settings || !appState.settings.currentSelectedWeekStart) {
        console.error("APP_LOG: [navigateWeek] currentSelectedWeekStart not found in appState.settings.");
        return;
    }

    let currentWeekStartDate = new Date(appState.settings.currentSelectedWeekStart + 'T00:00:00');
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + (direction * 7));
    
    // Preserve the day of the week from the original activeSelectedDate
    const originalActiveDate = new Date(appState.activeSelectedDate + 'T00:00:00');
    const dayOfWeek = originalActiveDate.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.

    let newActiveDate = new Date(currentWeekStartDate);
    // Find the corresponding day in the new week.
    // If original was Monday (1), new week's Monday is currentWeekStartDate.
    // If original was Tuesday (2), new week's Tuesday is currentWeekStartDate + 1 day.
    // Our week starts on Monday (day 1 in getUTCDay if locale is US-like, but utils.getMondayOfWeek implies Monday is start)
    // Let's assume our week starts on Monday. utils.formatDate(new Date(YYYY,MM,DD))
    // If currentWeekStartDate is always a Monday:
    newActiveDate.setUTCDate(currentWeekStartDate.getUTCDate() + (dayOfWeek === 0 ? 6 : dayOfWeek -1) ); // Adjust if week starts Sunday

    const newActiveDateString = window.utils.formatDate(newActiveDate);

    if (typeof main.setActiveDateAndRefreshViews === 'function') {
        main.setActiveDateAndRefreshViews(newActiveDateString);
    } else {
        console.error("APP_LOG: [navigateWeek] main.setActiveDateAndRefreshViews is not defined.");
        // Fallback if setActiveDateAndRefreshViews is somehow not available
        window.state.updateAppState({ activeSelectedDate: newActiveDateString });
        if (typeof main.updateDateControlsFromState === 'function') {
            main.updateDateControlsFromState();
        }
        if (typeof main.calculateAndUpdateCurrentDate === 'function') {
            main.calculateAndUpdateCurrentDate();
        }
    }
};

// --- Get Selected Date (Helper, if needed elsewhere, or keep internal to main) ---
// This function was previously defined, ensure it's correctly placed or integrated if necessary.
// If it's only used by functions within main.js that have access to appState, it might not need to be exposed on window.main.
main.getSelectedDate = () => {
    const appState = window.state.getAppState();
    return appState.activeSelectedDate || window.utils.formatDate(new Date()); // Fallback to today
};


// --- Function to set active date and refresh all relevant views ---
main.setActiveDateAndRefreshViews = (newDateString) => {
    if (!newDateString || typeof newDateString !== 'string') {
        console.error("APP_LOG: [setActiveDateAndRefreshViews] Invalid newDateString provided:", newDateString);
        return;
    }
    console.log(`APP_LOG: [setActiveDateAndRefreshViews] Setting active date to: ${newDateString}`);
    
    const appState = window.state.getAppState();
    appState.activeSelectedDate = newDateString; 
    // Persist this change immediately to appState via state.js
    window.state.updateAppState({ activeSelectedDate: newDateString });

    // Now update the date controls (dropdowns) to reflect this new activeSelectedDate
    if (typeof main.updateDateControlsFromState === 'function') {
        main.updateDateControlsFromState();
    } else {
        console.warn("APP_LOG: [setActiveDateAndRefreshViews] main.updateDateControlsFromState is not defined. Controls may not sync.");
    }

    // Then, recalculate everything else based on the new date (which also reads from controls)
    if (typeof main.calculateAndUpdateCurrentDate === 'function') {
        main.calculateAndUpdateCurrentDate();
    } else {
        console.error("APP_LOG: [setActiveDateAndRefreshViews] main.calculateAndUpdateCurrentDate is not defined. UI may not refresh.");
    }
};


console.log("main.js loaded and main object initialized.");
import * as utils from './utils.js'; // Import utils
import * as domElements from './domElements.js'; // Import domElements

export let state = {
    employeeRoster: [],
    dailyShifts: {},
    currentReportWeekStartDate: null,
    activeSelectedDate: null, // Should store YYYY-MM-DD string representing an MDT date
    currentSelectedDayOfWeek: utils.getDayOfWeekMDT(new Date()),
    jobPositions: ["Server", "Busser", "Shake Spinner", "Food Runner", "Host"], // <-- Add this line
    defaultPayRates: { // New: Default pay rates for each position
        "Server": 15.00,
        "Busser": 12.00,
        "Shake Spinner": 13.00,
        "Food Runner": 12.50,
        "Host": 11.50
    },
    currentTutorialSteps: [],
    currentTutorialStepIndex: 0,
    tutorialAnimationId: null,
    currentTutorialTargetElement: null,
    tutorialScrollResizeHandler: null, // Added to store scroll/resize handler reference
    tutorialRevertActions: [] // Stores actions to revert UI changes made by tutorial
};

// Define BASE_CYCLE_START_DATE as an MDT midnight date.
// For '2025-06-02' MDT, this is '2025-06-02T06:00:00Z' (UTC).
// Or, more robustly, create it from parts assuming MDT.
const baseYear = 2025;
const baseMonth = 5; // June (0-indexed)
const baseDay = 2;
// Create a UTC date that corresponds to midnight MDT on June 2, 2025
// MDT is UTC-6. So, midnight MDT is 06:00 UTC on the same date.
export const BASE_CYCLE_START_DATE = new Date(Date.UTC(baseYear, baseMonth, baseDay, 6, 0, 0)); 

// Get current day of the week in MDT
const nowInMDT = new Date(); // Current moment
const dayOfWeekStringMDT = nowInMDT.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Denver' });
const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
// export let currentSelectedDayOfWeek = dayMap[dayOfWeekStringMDT]; // Old way before direct numeric attempt

// Corrected initialization using getDayOfWeekMDT
export let currentSelectedDayOfWeek = utils.getDayOfWeekMDT(new Date());

// --- TUTORIAL STATE (Potentially move to a tutorial module later) ---
export let currentTutorialSteps = [];
export let currentTutorialStepIndex = 0;
export let tutorialAnimationId = null;
export let currentTutorialTargetElement = null;

export const tutorials = {
    roster: [
        { element: '#toggleAddNewEmployeeFormBtn', title: 'Add a Hero', text: "Click here to open the form for adding a new employee to your crew." },
        { element: '#empName', title: 'Enter Name', text: "Enter the employee\'s full name here. This is how they\'ll appear in all reports." },
        { element: '#empPositionsContainer', title: 'Assign Roles', text: "Select one or more roles. An input for their hourly pay rate will appear for each role you select." },
        { element: '#addEmployeeBtn', title: 'Save New Hero', text: "Click here to save the new employee to the permanent roster." },
        { element: '#fullEmployeeRosterContainer', title: 'The Full Crew', text: "This list shows everyone currently on your roster. You can edit or remove them from here." },
        { element: '#fullEmployeeRosterContainer .edit-btn', fallbackElement: '#fullEmployeeRosterContainer', title: 'Edit a Hero', text: "Click 'Edit' to change an employee\'s name or update their roles and pay rates." },
        { element: '#fullEmployeeRosterContainer .remove-x-btn', fallbackElement: '#fullEmployeeRosterContainer', title: 'Remove a Hero', text: "Click the 'X' to permanently remove an employee and their shifts for the current day." },
        { element: '#importSectionWrapper', title: 'Import Roster', text: "You can also bulk-add employees by importing a specially formatted .txt file." },
        { element: '#goBackToLineupBtn', title: 'Back to Action', text: "When you\'re done managing the roster, click here to return to the daily shift logging view." },
    ],
    lineup: [
        { element: '.top-date-controls', title: 'Set the Date', text: "First, use these controls to select the correct payroll Cycle and Week you want to work on." },
        { element: '#lineupDayNavContainer', title: 'Select the Day', text: "Next, click a day of the week to view or log shifts for that specific date." },
        { 
            element: '#rosterListContainer .employee-info strong', 
            fallbackElement: '#rosterListContainer', 
            title: 'Log a Shift', 
            text: "Click an employee\\\'s name to open the form where you can log their shift details for the selected day.",
            actionsBefore: [{ 
                type: 'expandCollapsible', 
                triggerSelector: '#employeeLineupSection h2.collapsible-header[aria-controls="lineupContent"]', 
                contentSelector: '#lineupContent' 
            }]
        },
        { 
            element: '.inline-shift-form-container', 
            isDynamic: true, 
            dynamicTrigger: '#rosterListContainer .employee-info strong', 
            title: 'Enter Shift Details', 
            text: "Enter the clock-in and clock-out times. For servers, also fill in their sales and tips.",
            actionsBefore: [{ 
                type: 'expandCollapsible', 
                triggerSelector: '#employeeLineupSection h2.collapsible-header[aria-controls="lineupContent"]', 
                contentSelector: '#lineupContent' 
            }]
        },
        { 
            element: '.log-specific-shift-btn', 
            isDynamic: true, 
            dynamicTrigger: '#rosterListContainer .employee-info strong', 
            title: 'Save the Shift', 
            text: "Click here to save the shift. The employee\\\'s card will update with a summary, and the button will change to \'Edit Shift\'.",
            actionsBefore: [{ 
                type: 'expandCollapsible', 
                triggerSelector: '#employeeLineupSection h2.collapsible-header[aria-controls="lineupContent"]', 
                contentSelector: '#lineupContent' 
            }]
        },
        { element: '#showAddEmployeeFormBtn', title: 'Manage Roster', text: "Need to add a new employee or edit an existing one? Click this button to jump to the Roster Management page." }
    ],
    scoop: [
        { element: '#scoopDayNavContainer', title: 'Select a Day', text: "Use these buttons to choose which day\'s results you want to see." },
        { element: '#payoutResults', title: 'Daily Payouts', text: "This table shows the calculated breakdown of wages, tips, and take-home pay for everyone who worked on the selected day." },
        { element: '.support-tip-detail', fallbackElement: '#payoutResults', title: 'Tip-In Details', text: "For support staff (like Bussers), you can see a detailed breakdown of which servers tipped them out and how much." },
        { element: '.remove-shift-from-scoop-btn', fallbackElement: '#payoutResults', title: 'Delete a Shift', text: "If a shift was logged by mistake, you can permanently remove it by clicking the 'Del' button in its row." }
    ],    weekly: [         { 
             element: '.week-navigation', 
             title: 'Navigate Weeks', 
             text: "Use the 'Prev Week' and 'Next Week' buttons to browse through different weekly reports.",
             actionsBefore: [
                 { type: 'expandCollapsible', triggerSelector: '#weeklyReportSection h2.collapsible-header', contentSelector: '#weeklyReportContent' }
             ]
         },
         { element: '#reportOutput .data-table-container:first-of-type', fallbackElement: '#reportOutput', title: 'Weekly Totals', text: "This first table summarizes the total earnings (wages and tips) for each employee across the entire selected week." },
         { element: '#reportOutput .report-day-header', fallbackElement: '#reportOutput', title: 'Daily Breakdown', text: "Below the weekly summary, you\'ll find a detailed, day-by-day breakdown of all shifts that were logged." },
         { element: '.edit-shift-from-weekly-btn', fallbackElement: '#reportOutput', title: 'Quick Edit', text: "Made a mistake? Click 'Edit' on any shift in this report to instantly jump back to 'The Lineup' section with the correct form open, ready for you to make changes." },
         { element: '#exportWeeklyCSVBtn', title: 'Export to Excel', text: "Click here to download a beautifully formatted Excel file (.xlsx) of this week\'s report, complete with separate tabs for daily details and weekly totals." }    ],data: [
        { 
            element: '#defaultPayRatesContainer', 
            title: 'Default Pay Rates', 
            text: "Set up default pay rates for each position here. When you add a new employee, these rates will automatically pre-fill the pay rate fields, saving you time!",
            actionsBefore: [
                { type: 'expandCollapsible', triggerSelector: '#dataManagementSection h2.collapsible-header', contentSelector: '#dataManagementContent' }
            ]
        },
        { 
            element: '#saveDefaultPayRatesBtn', 
            title: 'Save Pay Rate Changes', 
            text: "After adjusting any default pay rates, don't forget to click this button to save your changes. These defaults will be used for all new employees you add." 
        },
        { 
            element: '#downloadStateBtn', 
            title: 'Backup Your Data', 
            text: "Click this to save ALL your data—roster and every logged shift—to a single JSON file on your computer. It\'s a great idea to do this regularly as a backup!"
        },
        { 
            element: 'label[for="loadStateFile"]', 
            title: 'Restore Your Data', 
            text: "If you need to restore your data from a backup, click here to select the `.json` file you previously saved. This will overwrite ALL current data in the app." 
        }
    ]
};

// Function to get tutorial data by key
export function getTutorialData(key) {
    if (tutorials[key]) {
        return { key: key, steps: tutorials[key] };
    }
    return null;
}

// --- State Update Functions ---
export function setEmployeeRoster(newRoster) {
    state.employeeRoster = newRoster;
    saveStateToLocalStorage();
}

export function setDailyShifts(newShifts) {
    state.dailyShifts = newShifts;
    saveStateToLocalStorage();
}

export function updateEmployeeInRoster(updatedEmployee) {
    const index = state.employeeRoster.findIndex(emp => emp.id === updatedEmployee.id);
    if (index !== -1) {
        state.employeeRoster[index] = updatedEmployee;
        saveStateToLocalStorage();
    }
}

export function addEmployeeToRoster(newEmployee) {
    state.employeeRoster.push(newEmployee);
    saveStateToLocalStorage();
}

export function removeEmployeeFromRoster(employeeId) {
    state.employeeRoster = state.employeeRoster.filter(emp => emp.id !== employeeId);
    // Also remove their shifts for the active day if any
    if (state.activeSelectedDate && state.dailyShifts[state.activeSelectedDate]) {
        state.dailyShifts[state.activeSelectedDate] = state.dailyShifts[state.activeSelectedDate].filter(s => s.employeeId !== employeeId);
        if (state.dailyShifts[state.activeSelectedDate].length === 0) {
            delete state.dailyShifts[state.activeSelectedDate];
        }
    }
    saveStateToLocalStorage();
}

export function getEmployeeById(employeeId) {
    return state.employeeRoster.find(emp => emp.id === employeeId);
}

export function addOrUpdateShift(shiftData) {
    const { date, employeeId, positionWorked } = shiftData; // Added employeeId and positionWorked for new shift ID
    let { id } = shiftData; // id can be null for new shifts

    if (!state.dailyShifts[date]) {
        state.dailyShifts[date] = [];
    }

    // Generate a unique ID for new shifts
    if (!id) {
        id = `shift_${employeeId}_${positionWorked.replace(/\\s+/g, '')}_${new Date().getTime()}`;
        shiftData.id = id; // Add the new ID to the shiftData object
    }
    
    // Retrieve employee details for the shift
    const employee = state.employeeRoster.find(emp => emp.id === employeeId);
    if (employee) {
        shiftData.employeeName = employee.name;
        // Correctly access payRate from employee.payRates object
        if (employee.payRates && employee.payRates[positionWorked] !== undefined) {
            shiftData.shiftPayRate = employee.payRates[positionWorked];
        } else {
            console.warn(`Pay rate not found for ${employee.name} as ${positionWorked}. Defaulting to 0.`);
            shiftData.shiftPayRate = 0;
        }
    } else {
        console.warn(`Employee not found for ID ${employeeId}. Shift will lack name and pay rate.`);
        shiftData.employeeName = "Unknown Employee";
        shiftData.shiftPayRate = 0;
    }


    const existingShiftIndex = state.dailyShifts[date].findIndex(s => s.id === id);
    if (existingShiftIndex !== -1) {
        state.dailyShifts[date][existingShiftIndex] = { ...state.dailyShifts[date][existingShiftIndex], ...shiftData };
    } else {
        state.dailyShifts[date].push(shiftData);
    }
    saveStateToLocalStorage();
    // Return the modified (potentially with new ID, name, payrate) or original shiftData object
    return state.dailyShifts[date].find(s => s.id === id); 
}

export function removeShift(date, shiftId) {
    if (state.dailyShifts[date]) {
        state.dailyShifts[date] = state.dailyShifts[date].filter(s => s.id !== shiftId);
        if (state.dailyShifts[date].length === 0) {
            delete state.dailyShifts[date];
        }
        saveStateToLocalStorage();
    }
}

export function setActiveSelectedDate(newDate) {
    state.activeSelectedDate = newDate;
}

export function setCurrentSelectedDayOfWeek(newDayOfWeek) {
    state.currentSelectedDayOfWeek = newDayOfWeek;
}

export function setCurrentReportWeekStartDate(newDate) {
    state.currentReportWeekStartDate = newDate;
}

export function loadStateFromLocalStorage() {
    const storedRoster = localStorage.getItem('dinerTipSplit_employeeRosterV2');
    if (storedRoster) {
        state.employeeRoster = JSON.parse(storedRoster);
    }
    const storedShifts = localStorage.getItem('dinerTipSplit_dailyShiftsV2');
    if (storedShifts) {
        state.dailyShifts = JSON.parse(storedShifts);
    }
    const storedDefaultPayRates = localStorage.getItem('dinerTipSplit_defaultPayRatesV2');
    if (storedDefaultPayRates) {
        state.defaultPayRates = JSON.parse(storedDefaultPayRates);
    }
    console.log("APP_LOG: State loaded from Local Storage.");
}

export function saveStateToLocalStorage() {
    localStorage.setItem('dinerTipSplit_employeeRosterV2', JSON.stringify(state.employeeRoster));
    localStorage.setItem('dinerTipSplit_dailyShiftsV2', JSON.stringify(state.dailyShifts));
    localStorage.setItem('dinerTipSplit_defaultPayRatesV2', JSON.stringify(state.defaultPayRates));
    console.log("APP_LOG: State saved to Local Storage.");
}

// Tutorial state setters
export function setCurrentTutorial(tutorialKey, stepIndex) {
    const data = getTutorialData(tutorialKey);
    if (data) {
        state.currentTutorialSteps = data.steps; // Store the array of steps
        state.currentTutorialStepIndex = stepIndex;
        // It might be better to store the whole tutorial object if needed elsewhere
        // For now, this matches the previous structure of currentTutorialSteps and currentTutorialStepIndex
    } else {
        state.currentTutorialSteps = [];
        state.currentTutorialStepIndex = 0;
    }
}

export function clearCurrentTutorial() {
    state.currentTutorialSteps = [];
    state.currentTutorialStepIndex = 0;
    state.tutorialRevertActions = []; // Clear revert actions
    // currentTutorialTargetElement = null; // Already handled by setCurrentTutorialTargetElement
    // if (tutorialAnimationId) cancelAnimationFrame(tutorialAnimationId); // Already handled by setTutorialAnimationId
    // tutorialAnimationId = null;
}


export function getCurrentTutorial() {
    if (state.currentTutorialSteps && state.currentTutorialSteps.length > 0) {
        // Reconstruct a similar object to what might have been expected
        // This assumes there was a key stored somewhere or it's not strictly needed by consumers of getCurrentTutorial
        // For now, let's find the key by comparing steps, which is inefficient but works for the current structure.
        let tutorialKey = null;
        for (const key in tutorials) {
            if (tutorials[key] === state.currentTutorialSteps) { // Check if it's the same array reference
                tutorialKey = key;
                break;
            }
        }
        return {
            key: tutorialKey, // This might be null if not found by simple reference check
            steps: state.currentTutorialSteps,
            currentStepIndex: state.currentTutorialStepIndex
        };
    }
    return null;
}

export function setCurrentTutorialSteps(steps) {
    state.currentTutorialSteps = steps;
}

export function setCurrentTutorialStepIndex(index) {
    state.currentTutorialStepIndex = index;
}

export function setTutorialAnimationId(id) {
    state.tutorialAnimationId = id;
}

export function setCurrentTutorialTargetElement(element) {
    state.currentTutorialTargetElement = element;
}

// --- Tutorial Revert Action Management ---
export function addTutorialRevertAction(action) {
    state.tutorialRevertActions.push(action);
    console.log("APP_LOG: Added tutorial revert action:", action, "Current stack:", state.tutorialRevertActions);
}

export function clearTutorialRevertActions() {
    state.tutorialRevertActions = [];
    console.log("APP_LOG: Cleared tutorial revert actions.");
}

export function executeAndClearTutorialRevertActions() {
    console.log("APP_LOG: Executing tutorial revert actions. Stack:", JSON.parse(JSON.stringify(state.tutorialRevertActions)));
    // Execute in reverse order (LIFO)
    while (state.tutorialRevertActions.length > 0) {
        const action = state.tutorialRevertActions.pop();
        try {
            console.log("APP_LOG: Reverting action:", action);
            if (action.type === 'click' && action.target) {
                // This assumes the target is a selector string if element isn't available
                // For now, handleDynamicStepActions stores the actual element.
                // If it could become detached, storing a selector would be more robust.
                const targetElement = (typeof action.target === 'string') ? document.querySelector(action.target) : action.target;
                if (targetElement && typeof targetElement.click === 'function') {
                    // Avoid re-clicking the addShiftButton if a close-shift-form action is also queued for it
                    // This check is a bit simplistic; a more robust way would be to ensure the form is actually open
                    // or that the click target isn't the one that opens the form we are trying to close.
                    let shouldClick = true;
                    if (targetElement.id === 'addShiftButton' || targetElement.classList.contains('edit-shift-btn')) {
                        if (state.tutorialRevertActions.some(a => a.type === 'close-shift-form')) {
                            // If a specific close action is pending, maybe this click is redundant or harmful.
                            // For now, we allow the click, but this is an area for refinement.
                        }
                    }
                    if (shouldClick) {
                        targetElement.click();
                        console.log("APP_LOG: Reverted by click:", targetElement);
                    }
                } else {
                    console.warn("APP_WARN: Revert action 'click' failed, target not clickable or not found:", action.target);
                }
            } else if (action.type === 'toggle-collapse' && action.target && action.hasOwnProperty('sectionExpandedByTutorial')) {
                const triggerElement = (typeof action.target === 'string') ? document.querySelector(action.target) : action.target;
                if (triggerElement && typeof triggerElement.click === 'function') {
                    const contentId = triggerElement.getAttribute('aria-controls');
                    const contentElement = contentId ? document.getElementById(contentId) : null;
                    const isCurrentlyExpanded = triggerElement.getAttribute('aria-expanded') === 'true' || 
                                              (contentElement && window.getComputedStyle(contentElement).display !== 'none');

                    if (action.sectionExpandedByTutorial && isCurrentlyExpanded) {
                        // Only click to collapse if the tutorial expanded it AND it's still expanded.
                        triggerElement.click();
                        console.log("APP_LOG: Reverted by toggle-collapse (click to collapse):", triggerElement);
                    } else if (!action.sectionExpandedByTutorial && !isCurrentlyExpanded && contentElement) {
                        // This case is less common for tutorials but handles if tutorial collapsed something
                        // triggerElement.click();
                        // console.log("APP_LOG: Reverted by toggle-collapse (click to expand):", triggerElement);
                        // For now, tutorials primarily expand, so this branch might not be hit.
                        // If a tutorial *collapses* something, this logic would need to be confirmed.
                    } else {
                        console.log("APP_LOG: Revert action \'toggle-collapse\' skipped. Conditions not met (expandedByTutorial, isCurrentlyExpanded):", 
                                    { expandedByTutorial: action.sectionExpandedByTutorial, isCurrentlyExpanded }, triggerElement);
                    }
                } else {
                     console.warn("APP_WARN: Revert action \'toggle-collapse\' failed, trigger not clickable or not found:", action.target);
                }
            } else if (action.type === 'toggle-class' && action.target && action.className) {
                const targetElement = (typeof action.target === 'string') ? document.querySelector(action.target) : action.target;
                if (targetElement) {
                    if (action.shouldHaveClass) { // If it should have the class after revert
                        targetElement.classList.add(action.className);
                        console.log(`APP_LOG: Reverted by adding class '${action.className}' to:`, targetElement);
                    } else { // If it should NOT have the class after revert
                        targetElement.classList.remove(action.className);
                        console.log(`APP_LOG: Reverted by removing class '${action.className}' from:`, targetElement);
                    }
                } else {
                    console.warn("APP_WARN: Revert action 'toggle-class' failed, target not found:", action.target);
                }
            } else if (action.type === 'close-shift-form') {
                console.log("APP_LOG: Attempting to revert by closing shift form.");
                const inlineFormContainer = document.querySelector('.inline-shift-form-container');
                
                if (inlineFormContainer && (inlineFormContainer.style.display !== 'none' && inlineFormContainer.offsetParent !== null)) {
                    // Try to find the specific cancel button for inline forms first
                    const inlineCancelBtn = inlineFormContainer.querySelector('.cancel-edit-inline-btn');
                    if (inlineCancelBtn) {
                        inlineCancelBtn.click();
                        console.log("APP_LOG: Reverted by clicking .cancel-edit-inline-btn in .inline-shift-form-container.");
                    } else if (domElements.cancelShiftButton) { 
                        // Fallback to generic cancel button if specific one isn't found but form container is visible
                        domElements.cancelShiftButton.click();
                        console.log("APP_LOG: Reverted by clicking generic cancelShiftButton (inline form container was visible).");
                    } else {
                        console.warn("APP_WARN: Revert action 'close-shift-form' failed. Inline form container visible, but no cancel button found (.cancel-edit-inline-btn or generic).");
                    }
                } else if (domElements.shiftForm && domElements.shiftForm.style.display !== 'none' && domElements.cancelShiftButton) {
                    // Fallback for older/other shift form structures if inline one isn't active
                    domElements.cancelShiftButton.click();
                    console.log("APP_LOG: Reverted by clicking cancel shift button (generic form).");
                } else if (domElements.shiftFormModal && domElements.shiftFormModal.style.display !== 'none' && domElements.cancelShiftButton) {
                    // Fallback if it's a modal structure
                    domElements.cancelShiftButton.click();
                    console.log("APP_LOG: Reverted by clicking cancel shift button in modal.");
                } else {
                    console.warn("APP_WARN: Revert action 'close-shift-form' failed. No known shift form seems to be open or cancel button not found.");
                }
            }
            // Add more revert action types as needed
        } catch (error) {
            console.error("APP_ERROR: Error during tutorial revert action:", action, error);
        }
    }
    console.log("APP_LOG: Finished executing and cleared tutorial revert actions.");
}


// Initial load
// loadStateFromLocalStorage(); // REMOVE this line, only call from main.js

// --- Default Pay Rates Management ---
export function getDefaultPayRates() {
    return { ...state.defaultPayRates }; // Return a copy to prevent external modification
}

export function setDefaultPayRate(position, rate) {
    if (typeof rate === 'number' && rate >= 0) {
        state.defaultPayRates[position] = rate;
        saveStateToLocalStorage();
        console.log(`APP_LOG: Default pay rate for ${position} set to $${rate}`);
    } else {
        console.error(`APP_ERROR: Invalid pay rate for ${position}: ${rate}`);
    }
}

export function updateDefaultPayRates(newRates) {
    // Validate all rates before updating
    for (const [position, rate] of Object.entries(newRates)) {
        if (typeof rate !== 'number' || rate < 0) {
            console.error(`APP_ERROR: Invalid pay rate for ${position}: ${rate}`);
            return false;
        }
    }
    
    // Update all rates
    state.defaultPayRates = { ...state.defaultPayRates, ...newRates };
    saveStateToLocalStorage();
    console.log('APP_LOG: Default pay rates updated:', state.defaultPayRates);
    return true;
}

export function getDefaultPayRateForPosition(position) {
    return state.defaultPayRates[position] || 0;
}
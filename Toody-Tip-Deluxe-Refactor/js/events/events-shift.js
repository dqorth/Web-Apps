import * as state from '../state.js';
import { domElements } from '../domElements.js';
import * as utils from '../utils.js';
import { renderInlineShiftForm, updateEmployeeLineupCard, applyMasonryLayoutToRoster } from '../ui/ui-roster.js';
import { triggerDailyScoopCalculation } from './events-app-logic.js';
import { calculateAndUpdateCurrentDate } from './events-date-time.js'; // Added for updating date context
import { switchView } from '../ui/ui-core.js'; // Corrected: Import switchView directly

// Note: Calls to ui.showInfoModal and ui.showConfirmationModal are present in the functions below.
// These are unresolved dependencies from the original events.js and will need to be addressed
// once a modals UI module is available and integrated. A placeholder ui object is added for now.

const ui = { // Placeholder for unresolved ui.showInfoModal and ui.showConfirmationModal
    showInfoModal: (message) => console.warn(`showInfoModal: ${message}`),
    showConfirmationModal: (message, callback) => {
        console.warn(`showConfirmationModal: ${message}`);
        if (confirm(message)) { // Using browser confirm as a temporary stand-in
            callback();
        }
    }
};

function handleRosterEmployeeClick(event) {
    const buttonElement = event.target.closest('.worked-today-toggle-btn') || event.target.closest('.employee-info strong');
    if (!buttonElement) return;

    const liElement = buttonElement.closest('li');
    // Ensure empId and positionContext are correctly retrieved whether the click is on the button or the strong tag.
    const empId = buttonElement.dataset.empid || (buttonElement.closest('[data-empid]')?.dataset.empid);
    const positionContext = buttonElement.dataset.positioncontext || (buttonElement.closest('[data-positioncontext]')?.dataset.positioncontext);
    
    const employeeData = state.state.employeeRoster.find(eRemp => eRemp.id === empId); // Corrected: Access employeeRoster from state.state
    const formContainer = liElement.querySelector('.inline-shift-form-container');

    if (!employeeData || !formContainer || !liElement || !empId || !positionContext) { // Added checks for empId and positionContext
        console.error("ROSTER_CLICK_ERR: Missing data.", { empId, positionContext, employeeData, formContainer, liElement });
        return;
    }
    
    const actualButton = liElement.querySelector('.worked-today-toggle-btn'); // Ensure we always target the button for state
    const currentAction = actualButton.dataset.action;

    if (currentAction === "edit") { // If button says "Edit Shift", open form prefilled
        handleEditLoggedShiftSetup({ target: actualButton });
    } else { // If button says "Log Shift" or "Close Shift Form"
        const isOpeningForm = formContainer.style.display === 'none';
        if (isOpeningForm) {
            renderInlineShiftForm(formContainer, employeeData, positionContext, state.state.activeSelectedDate, null, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift); // No originView for direct lineup interaction
            formContainer.style.display = 'block';
            actualButton.textContent = 'Close Shift Form';
            actualButton.classList.remove('is-not-working', 'is-editing-shift');
            actualButton.classList.add('is-working');
            actualButton.setAttribute('aria-pressed', 'true');
            const firstInput = formContainer.querySelector('input[type="time"], select');
            if (firstInput) firstInput.focus();
        } else { // Closing the form
            formContainer.innerHTML = '';
            formContainer.style.display = 'none';
            const existingShiftForCancel = state.state.dailyShifts[state.state.activeSelectedDate]?.find(s => s.employeeId === empId && s.positionWorked === positionContext);
            updateEmployeeLineupCard(liElement, actualButton, existingShiftForCancel, employeeData, positionContext);
        }
    }
    applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


async function handleLogOrUpdateInlineShift(event, originView = null) {
    event.preventDefault();
    const saveButton = event.target; // The button that was clicked
    const form = saveButton.closest('.inline-shift-form-container').querySelector('div[data-shift-form-for]'); // Find the main form div

    if (!form) {
        console.error('[events-shift.js] handleLogOrUpdateInlineShift - Could not find form element.');
        return;
    }

    const employeeId = saveButton.dataset.employeeId; // Assuming employeeId is on the save button
    const positionContext = saveButton.dataset.positionContext; // Assuming positionContext is on the save button
    const editingShiftId = saveButton.dataset.editingShiftId; // Correctly get editingShiftId

    const timeInElem = form.parentElement.querySelector('.inline-shift-timein');
    const timeOutElem = form.parentElement.querySelector('.inline-shift-timeout');
    const salesElem = form.parentElement.querySelector('.inline-shift-sales');
    const ccTipsElem = form.parentElement.querySelector('.inline-shift-cctips');
    const cashTipsElem = form.parentElement.querySelector('.inline-shift-cashtips');
    // Tip Out is not part of the inline form per REFACTORING_SPECIFICATION.md (it's calculated)

    const timeIn = timeInElem ? timeInElem.value : null;
    const timeOut = timeOutElem ? timeOutElem.value : null;

    if (!timeIn || !timeOut) {
        alert("Clock In and Clock Out times are required.");
        return;
    }

    const selectedDate = state.state.activeSelectedDate; // Use direct property access
    const shiftDataToSave = {
        id: editingShiftId || null, // Use editingShiftId if present
        employeeId,
        date: selectedDate,
        timeIn,
        timeOut,
        totalSales: salesElem && salesElem.value ? parseFloat(salesElem.value) : 0,
        ccTips: ccTipsElem && ccTipsElem.value ? parseFloat(ccTipsElem.value) : 0,
        cashTips: cashTipsElem && cashTipsElem.value ? parseFloat(cashTipsElem.value) : 0,
        tipOut: 0, // Tip Out is calculated later, not directly entered here.
        positionWorked: positionContext, // Make sure positionWorked is included
        // shiftPayRate will be retrieved/calculated by state.logOrUpdateShift or calculations
    };

    try {
        const savedShift = state.addOrUpdateShift(shiftDataToSave); 

        const liId = `roster-emp-${employeeId}-${positionContext.replace(/\s+/g, '')}`;
        const liElement = document.getElementById(liId);
        const buttonElement = liElement ? liElement.querySelector('.worked-today-toggle-btn') : null;
        const employee = state.getEmployeeById(employeeId); // Ensure this is not state.state.getEmployeeById

        if (liElement && buttonElement && employee) {
            updateEmployeeLineupCard(liElement, buttonElement, savedShift, employee, positionContext);
        } else {
            console.error('[events-shift.js] handleLogOrUpdateInlineShift - Could not find elements to update UI for employee:', employeeId, 'position:', positionContext, {liElement, buttonElement, employee});
        }

        const inlineFormContainer = form.parentElement; 
        if (inlineFormContainer) {
            inlineFormContainer.style.display = 'none';
            inlineFormContainer.innerHTML = '';
        }
        
        triggerDailyScoopCalculation(); // Replaced renderDailyPayouts(selectedDate)
        triggerWeeklyRewindCalculation(); // Added to update weekly rewind

        if (originView) {
            switchView(originView);
        }

    } catch (error) {
        console.error("Error saving shift:", error);
        // Optionally, display a user-friendly error message
    }
}

function handleDeleteInlineShift(shiftId, shiftDate, employeeId, positionContext, rosterLiElement, originView = null) { // Added rosterLiElement and originView
    ui.showConfirmationModal("Really delete this shift? This cannot be undone.", () => {
        state.removeShift(shiftDate, shiftId); // Corrected: use shiftDate from params
        
        // const rosterLiElement = document.getElementById(`roster-emp-${employeeId}-${positionContext.replace(/\s+/g, '')}`); // Already passed
        if (rosterLiElement) {
            const formContainer = rosterLiElement.querySelector('.inline-shift-form-container');
            if (formContainer) {
                formContainer.style.display = 'none';
                formContainer.innerHTML = '';
            }
            const buttonElement = rosterLiElement.querySelector('.worked-today-toggle-btn');
            if (buttonElement) {
                 const employeeData = state.state.employeeRoster.find(e => e.id === employeeId);
                 updateEmployeeLineupCard(rosterLiElement, buttonElement, null, employeeData, positionContext); 
            }
        } else {
            // Fallback: Re-render the entire roster if the specific element isn\'t found.
            // This might happen if the element ID construction logic has an issue or the element was unexpectedly removed.
            // Ensure all arguments are passed correctly, especially jobPositions
            renderEmployeeRoster(domElements.rosterListContainer, state.state, state.state.activeSelectedDate);
        }
        applyMasonryLayoutToRoster(domElements.rosterListContainer);
        triggerDailyScoopCalculation(); // Ensure daily scoop is updated after deleting a shift
        triggerWeeklyRewindCalculation(); // Added to update weekly rewind

        if (originView) {
            switchView(originView);
        }
    });
}

function handleCancelInlineShift(employeeId, positionContext, existingShiftData, originView = null) {
    const posKeyForId = positionContext.replace(/\\s+/g, ''); 
    const rosterLiElement = document.getElementById(`roster-emp-${employeeId}-${posKeyForId}`);
    
    if (rosterLiElement) {
        const formContainer = rosterLiElement.querySelector('.inline-shift-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
            formContainer.innerHTML = '';
        }
        const buttonElement = rosterLiElement.querySelector('.worked-today-toggle-btn');
        if (buttonElement) {
            const employeeData = state.state.employeeRoster.find(e => e.id === employeeId);
            updateEmployeeLineupCard(rosterLiElement, buttonElement, existingShiftData, employeeData, positionContext);
        }
    } else {
        console.warn(`Could not find roster LI for empId: ${employeeId}, posKey: ${posKeyForId} during cancel.`);
        renderEmployeeRoster(domElements.rosterListContainer, state.state, state.state.activeSelectedDate);
    }
    applyMasonryLayoutToRoster(domElements.rosterListContainer);
    if (originView) {
        switchView(originView);
    }
}


function handleEditLoggedShiftSetup(eventOrShiftId, shiftDateParam, employeeIdParam, positionContextParam) {
    let shiftId, shiftDate, employeeId, positionContext;
    let actingButtonElement;
    let targetRosterLi;
    let originView = null; // Variable to store the origin view

    if (typeof eventOrShiftId === 'string') {
        // Called with direct parameters (e.g., from Weekly Rewind)
        shiftId = eventOrShiftId;
        shiftDate = shiftDateParam;
        employeeId = employeeIdParam;
        positionContext = positionContextParam;
        originView = 'weeklyReportSection'; // Set origin for weekly rewind edits

        // 1. Parse shiftDate and determine its cycle and week
        const dateObjForCalc = utils.parseDateToMDT(shiftDate);
        if (!dateObjForCalc || isNaN(dateObjForCalc.getTime())) {
            console.error("[events-shift.js] handleEditLoggedShiftSetup: Invalid shiftDate provided from Weekly Rewind:", shiftDate);
            ui.showInfoModal("Error: Invalid date provided for editing shift.");
            return;
        }

        const { cycleStart: correctCycleStart, weekNum: correctWeekNumStr } = utils.findCycleAndWeekForDatePrecise(dateObjForCalc, state.BASE_CYCLE_START_DATE);
        const correctWeekNum = parseInt(correctWeekNumStr); // Ensure weekNum is a number for comparison/setting

        // 2. Update UI selectors for cycle and week to match shiftDate's context
        if (correctCycleStart && domElements.cycleStartDateSelect.querySelector(`option[value="${correctCycleStart}"]`)) {
            domElements.cycleStartDateSelect.value = correctCycleStart;
        } else {
            console.warn(`[events-shift.js] handleEditLoggedShiftSetup: Could not set cycleStartDateSelect to ${correctCycleStart} for shiftDate ${shiftDate}. Option might be missing.`);
        }
        
        if (correctWeekNum && domElements.weekInCycleSelect.querySelector(`option[value="${correctWeekNum}"]`)) {
            domElements.weekInCycleSelect.value = String(correctWeekNum);
        } else {
            console.warn(`[events-shift.js] handleEditLoggedShiftSetup: Could not set weekInCycleSelect to week ${correctWeekNum} for shiftDate ${shiftDate}. Option might be missing.`);
        }
        
        // 3. Set activeSelectedDate in state
        state.setActiveSelectedDate(shiftDate);
        
        // 4. Get day of week for shiftDate (0 for Sunday, 1 for Monday, 2 for Tuesday, etc., UTC-based)
        const dayOfWeekNum = dateObjForCalc.getUTCDay(); 
        
        // 5. Call calculateAndUpdateCurrentDate. This will use the updated UI selectors and dayOfWeekNum
        // to ensure its internal calculations align with shiftDate, set state.state.activeSelectedDate correctly,
        // and then render the roster for shiftDate.
        calculateAndUpdateCurrentDate(dayOfWeekNum);

        // --- Use the imported switchView function ---
        switchView('employeeLineupSection'); // Corrected: Pass the ID 'employeeLineupSection'
        // --- End View Switching ---

        // Ensure the lineup section's collapsible content is open and masonry applied
        // This needs to happen *after* the section is made visible and its content potentially expanded by switchView.
        // The switchView function itself now handles expanding lineupContent and applying masonry.
        // So, no explicit call to applyMasonryLayoutToRoster or header.click() is needed here for that purpose.

        // Now, attempt to find the target roster list item.
        const rosterLiElementId = `roster-emp-${employeeId}-${positionContext.replace(/\s+/g, '')}`;
        targetRosterLi = document.getElementById(rosterLiElementId);
        
        if (!targetRosterLi) {
            console.error(`[events-shift.js] handleEditLoggedShiftSetup: Could not find roster LI element with ID: ${rosterLiElementId} on lineup view for date ${shiftDate}. Employee: ${employeeId}, Position: ${positionContext}.`);
            ui.showInfoModal("Error: Could not find the specific shift card on The Lineup.");
            return;
        }
        actingButtonElement = targetRosterLi.querySelector('.worked-today-toggle-btn'); 
        if (!actingButtonElement) {
            console.error(`[events-shift.js] handleEditLoggedShiftSetup: Could not find toggle button in roster LI: ${rosterLiElementId}`);
            return;
        }

    } else {
        // Called as an event handler (e.g., from Lineup or Daily Scoop's own edit button if it has one)
        const event = eventOrShiftId;
        actingButtonElement = event.target.closest('.worked-today-toggle-btn, .edit-shift-from-daily-btn'); 
        if (!actingButtonElement) {
            console.warn("handleEditLoggedShiftSetup called from event, but no valid button found.", event.target);
            return;
        }

        shiftId = actingButtonElement.dataset.shiftId;
        // Use dataset.date if available (e.g., from Daily Scoop edit), otherwise use global activeSelectedDate
        shiftDate = actingButtonElement.dataset.date || state.state.activeSelectedDate; 
        employeeId = actingButtonElement.dataset.empid;
        positionContext = actingButtonElement.dataset.positioncontext;
        targetRosterLi = actingButtonElement.closest('li');

        // If shiftDate was from dataset.date and differs from state.state.activeSelectedDate,
        // we might need to ensure context is correct. For now, assume if it's from Daily Scoop,
        // activeSelectedDate is already correct or the shiftDate from dataset is the source of truth.
        // This path is typically for edits from The Lineup itself or Daily Scoop for the *current* active day.
        // If editing from Daily Scoop for a *different* day than activeSelectedDate, similar logic to above might be needed,
        // but that's not the current bug being addressed.
    }

    // Validations (common to both paths)
    if (!shiftId || typeof shiftId !== 'string' || shiftId.trim() === '') {
        console.warn("Edit shift called without valid shiftId. shiftId:", shiftId, "Button used (if any):", actingButtonElement);
        if (actingButtonElement && targetRosterLi) { 
            const empData = state.state.employeeRoster.find(e => e.id === employeeId);
            updateEmployeeLineupCard(targetRosterLi, actingButtonElement, null, empData, positionContext);
        }
        return;
    }

    if (!state.state.dailyShifts[shiftDate]) {
        console.warn("No shifts for date", shiftDate, "when trying to edit shiftId", shiftId);
        if (actingButtonElement && targetRosterLi) { 
            const empData = state.state.employeeRoster.find(e => e.id === employeeId);
            updateEmployeeLineupCard(targetRosterLi, actingButtonElement, null, empData, positionContext);
        }
        return;
    }

    const shiftToEdit = state.state.dailyShifts[shiftDate].find(s => s.id === shiftId);
    if (!shiftToEdit) {
        console.warn("Shift with ID", shiftId, "not found for date", shiftDate);
        if (actingButtonElement && targetRosterLi) { 
            const empData = state.state.employeeRoster.find(e => e.id === employeeId);
            updateEmployeeLineupCard(targetRosterLi, actingButtonElement, null, empData, positionContext);
        }
        return;
    }

    const employee = state.state.employeeRoster.find(e => e.id === shiftToEdit.employeeId);
    if (!employee) { 
        console.error("Error: Employee data not found for this shift."); 
        return; 
    }

    if (!targetRosterLi) { 
        console.error("Error displaying edit form (targetRosterLi not found). This should not happen if logic above is correct."); 
        return; 
    }

    let inlineFormContainer = targetRosterLi.querySelector('.inline-shift-form-container');
    if (!inlineFormContainer) { 
        console.error("Inline form container not found in targetRosterLi for edit.", targetRosterLi); 
        return; 
    }

    renderInlineShiftForm(inlineFormContainer, employee, shiftToEdit.positionWorked, shiftDate, shiftToEdit, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift, originView); // Pass originView
    inlineFormContainer.style.display = 'block';
    
    if (actingButtonElement) {
        actingButtonElement.textContent = 'Close Shift Form'; 
        actingButtonElement.classList.remove('is-not-working', 'is-editing-shift');
        actingButtonElement.classList.add('is-working'); 
        actingButtonElement.setAttribute('aria-pressed', 'true');
    } else {
        console.warn("actingButtonElement was not defined when trying to update button text/state for edit form.");
    }

    setTimeout(() => {
        const firstInput = inlineFormContainer.querySelector('input[type="time"], select');
        if (firstInput) firstInput.focus();
        targetRosterLi.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


function handleRemoveShiftFromDailyScoop(shiftId, shiftDate, empId, posCtx) { 
    if (!shiftId || !shiftDate) { 
        ui.showInfoModal("Error: Cannot identify shift to remove."); // ui.showInfoModal will error
        return; 
    }

    const employee = state.state.employeeRoster.find(e => e.id === empId);
    const empNameDisplay = employee ? employee.name : `Employee ID ${empId}`;

    const message = `Are you sure you want to remove the shift for ${empNameDisplay} (${posCtx}) on ${utils.formatDisplayDate(shiftDate)}?\nThis action cannot be undone.`;
    ui.showConfirmationModal(message, () => { // ui.showConfirmationModal will error
        state.removeShift(shiftDate, shiftId);
        triggerDailyScoopCalculation();
        if (shiftDate === state.state.activeSelectedDate) {
            // Pass all required arguments to renderEmployeeRoster, including callbacks
            renderEmployeeRoster(domElements.rosterListContainer, state.state, state.state.activeSelectedDate); // Corrected to state.state.activeSelectedDate
            applyMasonryLayoutToRoster(domElements.rosterListContainer);
        }
    });
}

function handleEditShiftFromWeeklyReport(shiftId, shiftDate, employeeId, positionContext) {
    // This function appears to be a duplicate or older version of the logic now integrated into handleEditLoggedShiftSetup
    // For now, let's ensure it also sets originView if it were to be used.
    // However, primary focus is on handleEditLoggedShiftSetup.
    // switchView(domElements.lineupView); // Pass the correct DOM element for lineupView
    // ...
    // renderInlineShiftForm(formContainer, employeeData, positionContext, shiftDate, shiftToEdit, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift, 'weeklyReportSection');


    // DEPRECATED in favor of the direct parameter handling in handleEditLoggedShiftSetup
    console.warn("handleEditShiftFromWeeklyReport is likely deprecated and should be removed or refactored.");
}


export {
    handleRosterEmployeeClick,
    handleLogOrUpdateInlineShift,
    handleDeleteInlineShift,
    handleCancelInlineShift,
    handleEditLoggedShiftSetup,
    handleRemoveShiftFromDailyScoop,
    handleEditShiftFromWeeklyReport
};

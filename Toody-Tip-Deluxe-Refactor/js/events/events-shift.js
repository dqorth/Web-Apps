import { domElements } from '../domElements.js';
import * as state from '../state.js';
import * as utils from '../utils.js';
import { renderInlineShiftForm, updateEmployeeLineupCard, applyMasonryLayoutToRoster, renderEmployeeRoster } from '../ui/ui-roster.js';
import { switchViewToLineup } from '../ui/ui-core.js'; // Added for handleEditShiftFromWeeklyReport
import { triggerDailyScoopCalculation, triggerWeeklyRewindCalculation } from './events-app-logic.js'; // Added triggerWeeklyRewindCalculation
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
    
    const employeeData = state.employeeRoster.find(eRemp => eRemp.id === empId);
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
            renderInlineShiftForm(formContainer, employeeData, positionContext, state.activeSelectedDate, null, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift);
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
            const existingShiftForCancel = state.dailyShifts[state.activeSelectedDate]?.find(s => s.employeeId === empId && s.positionWorked === positionContext);
            updateEmployeeLineupCard(liElement, actualButton, existingShiftForCancel, employeeData, positionContext);
        }
    }
    applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


async function handleLogOrUpdateInlineShift(event) {
    event.preventDefault();
    const saveButton = event.target; // The button that was clicked
    const form = saveButton.closest('.inline-shift-form-container').querySelector('div[data-shift-form-for]'); // Find the main form div

    if (!form) {
        console.error('[events-shift.js] handleLogOrUpdateInlineShift - Could not find form element.');
        return;
    }

    console.log('[events-shift.js] handleLogOrUpdateInlineShift - Event triggered, Save button:', saveButton, 'Form container:', form.parentElement); //诊断日志

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

    const selectedDate = state.activeSelectedDate; // Use direct property access
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

    console.log('[events-shift.js] handleLogOrUpdateInlineShift - Shift data to save:', JSON.parse(JSON.stringify(shiftDataToSave))); //诊断日志

    try {
        const savedShift = state.addOrUpdateShift(shiftDataToSave); 
        console.log('[events-shift.js] handleLogOrUpdateInlineShift - Shift saved/updated in state:', JSON.parse(JSON.stringify(savedShift))); //诊断日志

        const liId = `roster-emp-${employeeId}-${positionContext.replace(/\\s+/g, '')}`;
        const liElement = document.getElementById(liId);
        const buttonElement = liElement ? liElement.querySelector('.worked-today-toggle-btn') : null;
        const employee = state.getEmployeeById(employeeId);

        if (liElement && buttonElement && employee) {
            console.log('[events-shift.js] handleLogOrUpdateInlineShift - Calling updateEmployeeLineupCard with:', {liId, shiftId: savedShift.id, empName: employee.name, pos: positionContext});
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

    } catch (error) {
        console.error('Error saving shift:', error);
        alert(`Error saving shift: ${error.message}`);
    }
}

function handleDeleteInlineShift(employeeId, positionContext, shiftId) {
    ui.showConfirmationModal("Really delete this shift? This cannot be undone.", () => {
        state.removeShift(state.activeSelectedDate, shiftId);
        
        const rosterLiElement = document.getElementById(`roster-emp-${employeeId}-${positionContext.replace(/\\s+/g, '')}`);
        if (rosterLiElement) {
            const formContainer = rosterLiElement.querySelector('.inline-shift-form-container');
            if (formContainer) {
                formContainer.style.display = 'none';
                formContainer.innerHTML = '';
            }
            const buttonElement = rosterLiElement.querySelector('.worked-today-toggle-btn');
            if (buttonElement) {
                 const employeeData = state.employeeRoster.find(e => e.id === employeeId);
                 updateEmployeeLineupCard(rosterLiElement, buttonElement, null, employeeData, positionContext); 
            }
        } else {
            // Fallback: Re-render the entire roster if the specific element isn\'t found.
            // This might happen if the element ID construction logic has an issue or the element was unexpectedly removed.
            // Ensure all arguments are passed correctly, especially jobPositions
            renderEmployeeRoster(domElements.rosterListContainer, state, state.activeSelectedDate);
        }
        applyMasonryLayoutToRoster(domElements.rosterListContainer);
        triggerDailyScoopCalculation(); // Ensure daily scoop is updated after deleting a shift
    });
}

function handleCancelInlineShift(employeeId, positionContext, existingShiftData) {
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
            const employeeData = state.employeeRoster.find(e => e.id === employeeId);
            updateEmployeeLineupCard(rosterLiElement, buttonElement, existingShiftData, employeeData, positionContext);
        }
    } else {
        console.warn(`Could not find roster LI for empId: ${employeeId}, posKey: ${posKeyForId} during cancel.`);
        renderEmployeeRoster(domElements.rosterListContainer, state, state.activeSelectedDate);
    }
    applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


function handleEditLoggedShiftSetup(event) {
    const buttonClicked = event.target.closest('.worked-today-toggle-btn');
    if (!buttonClicked) return;

    const shiftId = buttonClicked.dataset.shiftId;
    const shiftDate = state.activeSelectedDate;

    if (!shiftId || typeof shiftId !== 'string' || shiftId.trim() === '') {
        console.warn("Edit shift called without valid shiftId on button:", buttonClicked);
        const problemLi = buttonClicked.closest('li');
        if (problemLi) {
            const empId = buttonClicked.dataset.empid;
            const posCtx = buttonClicked.dataset.positioncontext;
            const empData = state.employeeRoster.find(e => e.id === empId);
            updateEmployeeLineupCard(problemLi, buttonClicked, null, empData, posCtx);
        }
        return;
    }
    if (!state.dailyShifts[shiftDate]) {
        console.warn("No shifts for date", shiftDate, "when trying to edit shiftId", shiftId);
        const problemLi = buttonClicked.closest('li');
        if (problemLi) {
            const empId = buttonClicked.dataset.empid;
            const posCtx = buttonClicked.dataset.positioncontext;
            const empData = state.employeeRoster.find(e => e.id === empId);
            updateEmployeeLineupCard(problemLi, buttonClicked, null, empData, posCtx);
        }
        return;
    }

    const shiftToEdit = state.dailyShifts[shiftDate].find(s => s.id === shiftId);
    if (!shiftToEdit) {
        console.warn("Shift with ID", shiftId, "not found for date", shiftDate);
        const problemLi = buttonClicked.closest('li');
        if (problemLi) {
            const empId = buttonClicked.dataset.empid;
            const posCtx = buttonClicked.dataset.positioncontext;
            const empData = state.employeeRoster.find(e => e.id === empId);
            updateEmployeeLineupCard(problemLi, buttonClicked, null, empData, posCtx);
        }
        return;
    }

    const employee = state.employeeRoster.find(e => e.id === shiftToEdit.employeeId);
    if (!employee) { ui.showInfoModal("Error: Employee data not found for this shift."); return; } // ui.showInfoModal will error

    const rosterLi = buttonClicked.closest('li');
    if (!rosterLi) { ui.showInfoModal("Error displaying edit form (parent LI not found)."); return; } // ui.showInfoModal will error

    let inlineFormContainer = rosterLi.querySelector('.inline-shift-form-container');
    if (!inlineFormContainer) { console.error("Inline form container not found in LI for edit."); return; }

    renderInlineShiftForm(inlineFormContainer, employee, shiftToEdit.positionWorked, state.activeSelectedDate, shiftToEdit, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift);
    inlineFormContainer.style.display = 'block';
    
    buttonClicked.textContent = 'Close Shift Form'; 
    buttonClicked.classList.remove('is-not-working', 'is-editing-shift');
    buttonClicked.classList.add('is-working'); 
    buttonClicked.setAttribute('aria-pressed', 'true');

    setTimeout(() => {
        const firstInput = inlineFormContainer.querySelector('input[type="time"], select');
        if (firstInput) firstInput.focus();
        rosterLi.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


function handleRemoveShiftFromDailyScoop(shiftId, shiftDate, empId, posCtx) { 
    if (!shiftId || !shiftDate) { 
        ui.showInfoModal("Error: Cannot identify shift to remove."); // ui.showInfoModal will error
        return; 
    }

    const employee = state.employeeRoster.find(e => e.id === empId);
    const empNameDisplay = employee ? employee.name : `Employee ID ${empId}`;

    const message = `Are you sure you want to remove the shift for ${empNameDisplay} (${posCtx}) on ${utils.formatDisplayDate(shiftDate)}?\nThis action cannot be undone.`;
    ui.showConfirmationModal(message, () => { // ui.showConfirmationModal will error
        state.removeShift(shiftDate, shiftId);
        triggerDailyScoopCalculation();
        if (shiftDate === state.activeSelectedDate) {
            // Pass all required arguments to renderEmployeeRoster, including callbacks
            renderEmployeeRoster(domElements.rosterListContainer, state, state.activeSelectedDate);
            applyMasonryLayoutToRoster(domElements.rosterListContainer);
        }
    });
}

// function handleEditShiftFromWeeklyReport(shiftId, date, employeeId, positionContext) { // Added employeeId and positionContext
//     if (!shiftId || !date || !employeeId || !positionContext) { // Added checks for new params
//         ui.showInfoModal("Error: Could not get all necessary details to edit the shift."); return;
//     }

//     const targetDateObj = new Date(date + 'T00:00:00Z');
//     const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(targetDateObj, state.BASE_CYCLE_START_DATE);

//     if (!cycleStart || !weekNum || !domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
//         ui.showInfoModal("Error: Could not automatically set date controls. Please navigate manually."); return;
//     }

//     domElements.cycleStartDateSelect.value = cycleStart;
//     domElements.weekInCycleSelect.value = String(weekNum);
//     let dayOfWeekNum = targetDateObj.getUTCDay();
//     // state.setCurrentSelectedDayOfWeek(dayOfWeekNum); // This is handled by calculateAndUpdateCurrentDate
//     calculateAndUpdateCurrentDate(dayOfWeekNum); // This function needs to be imported or passed

//     // Ensure lineup section is visible and scroll to it
//     // Assuming ui.switchView is available and correctly imported/defined
//     // For now, directly manipulating style as ui.switchView might not be in this module\'s scope yet
//     if (domElements.employeeFormSection) domElements.employeeFormSection.style.display = 'none';
//     if (domElements.payoutSection) domElements.payoutSection.style.display = 'none';
//     if (domElements.weeklyReportSection) domElements.weeklyReportSection.style.display = 'none';
//     if (domElements.dataManagementSection) domElements.dataManagementSection.style.display = 'none';
//     if (domElements.employeeLineupSection) {
//         domElements.employeeLineupSection.style.display = 'block';
//         domElements.employeeLineupSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }


//     setTimeout(() => {
//         const rosterLiId = `roster-emp-${employeeId}-${positionContext.replace(/\\s+/g, '')}`;
//         const targetLi = document.getElementById(rosterLiId);
//         if (targetLi) {
//             const toggleButton = targetLi.querySelector('.worked-today-toggle-btn');
//             if (toggleButton) {
//                 // Ensure the button\'s state reflects the shift to be edited
//                 const currentShiftInLineup = state.dailyShifts[state.activeSelectedDate]?.find(s => s.id === shiftId);
//                 const employeeData = state.employeeRoster.find(e => e.id === employeeId);
//                 updateEmployeeLineupCard(targetLi, toggleButton, currentShiftInLineup, employeeData, positionContext);
                
//                 // Now, simulate the click to open the form or directly call edit setup
//                 // Check if the button is already set to "Edit Shift" for the correct shift
//                 if (toggleButton.dataset.action === "edit" && toggleButton.dataset.shiftId === shiftId) {
//                     handleEditLoggedShiftSetup({target: toggleButton}); // Already in correct state, just open/focus
//                 } else {
//                     // If not, it might be "Log Shift" or "Close Shift Form".
//                     // A click should ideally cycle it to the "Edit Shift" state or open the form.
//                     // For simplicity and directness, we can try to force the edit state if possible,
//                     // or just call handleEditLoggedShiftSetup directly if the button is correctly configured.
//                     // This part is tricky without knowing the exact state transitions of updateEmployeeLineupCard.
//                     // Let's assume updateEmployeeLineupCard sets it up correctly, then we call handleEditLoggedShiftSetup.
//                     handleEditLoggedShiftSetup({target: toggleButton});
//                 }
//                 setTimeout(() => targetLi.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
//             } else {
//                 ui.showInfoModal("Error: Could not find the toggle button in The Lineup.");
//             }
//         } else {
//             ui.showInfoModal("Error: Could not find the employee\'s entry in The Lineup to edit the shift.");
//         }
//     }, 350); // Increased timeout to allow for UI updates from calculateAndUpdateCurrentDate
// }


export {
    handleRosterEmployeeClick,
    handleLogOrUpdateInlineShift,
    handleDeleteInlineShift,
    handleCancelInlineShift,
    handleEditLoggedShiftSetup,
    handleRemoveShiftFromDailyScoop,
    // handleEditShiftFromWeeklyReport // Keep commented out as it is in original events.js
};

import { domElements } from './domElements.js';
import * as state from './state.js';
import * as utils from './utils.js';
import * as ui from './ui.js';
import * as calculations from './calculations.js';

// --- App Logic/Helper functions that involve state and UI updates ---

function triggerDailyScoopCalculation() {
    if (!state.activeSelectedDate) {
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = "<p>Please select a date first.</p>";
        return;
    }
    const shiftsForSelectedDay = state.dailyShifts[state.activeSelectedDate];
    if (!shiftsForSelectedDay || shiftsForSelectedDay.length === 0) {
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = `<p>No shifts have been logged for ${utils.formatDisplayDate(state.activeSelectedDate)}.</p>`;
        return;
    }
    try {
        const processedShifts = calculations.runTipAndWageCalculationsForDay(shiftsForSelectedDay); // Removed state.employeeRoster as it's not used by the function
        ui.renderDailyPayoutResults(domElements.payoutResultsDiv, processedShifts, state.activeSelectedDate, handleRemoveShiftFromDailyScoop); // Added domElements.payoutResultsDiv
    } catch (error) {
        console.error("Error during payout calculation:", error);
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = "<p style='color:red;'>An error occurred during calculations.</p>";
    }
}

function triggerWeeklyRewindCalculation() {
    if (!state.currentReportWeekStartDate) {
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Week context not set. Navigate using main date controls or weekly navigation.</p>";
        return;
    }
    generateWeeklyReportContent();
}


function calculateAndUpdateCurrentDate(newDayOfWeekNum = null) {
    const cycleStartStr = domElements.cycleStartDateSelect.value;
    const weekNum = parseInt(domElements.weekInCycleSelect.value);

    if (!cycleStartStr) {
        if (domElements.lineupDateDisplay) domElements.lineupDateDisplay.textContent = "Set Cycle Start";
        if (domElements.scoopDateDisplay) domElements.scoopDateDisplay.textContent = "Set Cycle Start";
        state.setActiveSelectedDate(null);
        ui.renderDayNavigation(domElements.lineupDayNavContainer, null, calculateAndUpdateCurrentDate);
        // Corrected call to renderEmployeeRoster: removed handleRosterEmployeeClick and handleEditLoggedShiftSetup
        ui.renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, state.JOB_POSITIONS_AVAILABLE); 
        ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
        return;
    }
    const cycleStartDateObj = new Date(cycleStartStr + 'T00:00:00Z');

    const targetWeekMonday = new Date(cycleStartDateObj);
    targetWeekMonday.setUTCDate(cycleStartDateObj.getUTCDate() + (weekNum - 1) * 7);

    let targetDayOffset;
    if (newDayOfWeekNum !== null) {
        state.setCurrentSelectedDayOfWeek(newDayOfWeekNum);
        if (newDayOfWeekNum === 0) targetDayOffset = 6; // Sunday
        else targetDayOffset = newDayOfWeekNum - 1; // Monday is 0 offset from Monday
    } else {
        let dayToUse = state.currentSelectedDayOfWeek === undefined ? 1 : state.currentSelectedDayOfWeek; // Default to Monday if undefined
        if (dayToUse === 0) targetDayOffset = 6;
        else targetDayOffset = dayToUse - 1;
    }

    const targetDate = new Date(targetWeekMonday);
    targetDate.setUTCDate(targetWeekMonday.getUTCDate() + targetDayOffset);

    state.setActiveSelectedDate(utils.formatDate(targetDate));
    if (domElements.currentDateHiddenInput) domElements.currentDateHiddenInput.value = state.activeSelectedDate;

    // Corrected argument order: lineupDateElem, scoopDateElem, dateString
    ui.updateDateDisplays(domElements.lineupDateDisplay, domElements.scoopDateDisplay, state.activeSelectedDate); 

    const currentWeekDateInfo = utils.getWeekInfoForDate(state.activeSelectedDate, state.BASE_CYCLE_START_DATE);
    if (currentWeekDateInfo && currentWeekDateInfo.weekStartDate && typeof currentWeekDateInfo.weekStartDate === 'string') { // Added check for string type
        const dateStrToUse = currentWeekDateInfo.weekStartDate + 'T00:00:00Z';
        const newDateObj = new Date(dateStrToUse);

        if (!(newDateObj instanceof Date) || isNaN(newDateObj.getTime())) {
            console.error("calculateAndUpdateCurrentDate: Failed to create valid Date object from:", dateStrToUse, "Constructed Date:", newDateObj);
            console.log("[LOG events.js] Setting currentReportWeekStartDate to null due to invalid newDateObj. Value:", null, "Type:", typeof null);
            state.setCurrentReportWeekStartDate(null); // Fallback to null if date creation failed
        } else {
            console.log("[LOG events.js] Setting currentReportWeekStartDate. Value:", newDateObj, "Type:", typeof newDateObj, "IsDate:", newDateObj instanceof Date);
            state.setCurrentReportWeekStartDate(newDateObj);
        }
        ui.updateCurrentlyViewedWeekDisplay(domElements.currentlyViewedWeekDisplay, state.currentReportWeekStartDate);
    } else {
        console.log("[LOG events.js] Setting currentReportWeekStartDate to null due to invalid currentWeekDateInfo. Value:", null, "Type:", typeof null);
        state.setCurrentReportWeekStartDate(null); // Ensure it's null if not valid
        ui.updateCurrentlyViewedWeekDisplay(domElements.currentlyViewedWeekDisplay, null); // Update display accordingly
    }

    ui.renderDayNavigation(domElements.lineupDayNavContainer, state.activeSelectedDate, calculateAndUpdateCurrentDate);
    ui.renderDayNavigation(domElements.scoopDayNavContainer, state.activeSelectedDate, calculateAndUpdateCurrentDate);
    console.log("[LOG events.js] About to call renderEmployeeRoster. JOB_POSITIONS_AVAILABLE:", state.JOB_POSITIONS_AVAILABLE, "Type:", typeof state.JOB_POSITIONS_AVAILABLE, "IsArray:", Array.isArray(state.JOB_POSITIONS_AVAILABLE)); // DIAGNOSTIC
    // Corrected call to renderEmployeeRoster: removed handleRosterEmployeeClick and handleEditLoggedShiftSetup
    ui.renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, state.JOB_POSITIONS_AVAILABLE); 
    ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);

    const payoutContentEl = domElements.payoutContent;
    if (payoutContentEl && payoutContentEl.style.display !== 'none') {
        triggerDailyScoopCalculation();
    }
    const weeklyReportContentEl = domElements.weeklyReportContent;
    if (weeklyReportContentEl && weeklyReportContentEl.style.display !== 'none') {
        triggerWeeklyRewindCalculation();
    }
}

// --- Event Handlers ---

function handleCycleOrWeekChange() {
    calculateAndUpdateCurrentDate();
}

function handleEditEmployeeSetupFromMgmtList(employeeToEdit) {
    ui.switchViewToEmployeeForm(
        domElements.employeeLineupSection,    // Section to hide
        domElements.employeeFormSection,      // Section to show
        true,                                 // isEditing = true
        employeeToEdit,                       // The employee to edit
        domElements.addEmployeeFormWrapper,
        domElements.empNameInput,
        domElements.empPositionsContainer,
        domElements.addEmployeeBtn,
        domElements.updateEmployeeBtn,
        domElements.cancelEditBtn,
        domElements.editingEmployeeIdInput,
        state.JOB_POSITIONS_AVAILABLE,
        domElements.fullEmployeeRosterContainer,  // The container of the list itself
        state.employeeRoster,                     // The data for the list
        handleEditEmployeeSetupFromMgmtList,      // Callback for "Edit" within this list
        handleRemoveEmployeeFromMgmtList,         // Callback for "Remove" within this list
        domElements.toggleAddNewEmployeeFormBtn   // The button that toggles the "Add New" form visibility
    );
    // Note: ui.switchViewToEmployeeForm calls ui.populateEmployeeFormForEdit internally when isEditing is true.
    // It also calls ui.renderFullEmployeeListForManagement with the provided callbacks.
}

function handleShowAddEmployeeForm() {
    ui.switchViewToEmployeeForm(
        domElements.employeeLineupSection,
        domElements.employeeFormSection,
        false, // isEditing
        null,  // empToEdit
        domElements.addEmployeeFormWrapper,
        domElements.empNameInput,
        domElements.empPositionsContainer,
        domElements.addEmployeeBtn,
        domElements.updateEmployeeBtn,
        domElements.cancelEditBtn,
        domElements.editingEmployeeIdInput,
        state.JOB_POSITIONS_AVAILABLE,
        domElements.fullEmployeeRosterContainer,
        state.employeeRoster,
        handleEditEmployeeSetupFromMgmtList, // Use the dedicated handler for edits from the list
        handleRemoveEmployeeFromMgmtList,
        domElements.toggleAddNewEmployeeFormBtn
    );
}

function handleGoBackToLineup() {
    ui.switchViewToLineup(
        domElements.employeeLineupSection, 
        domElements.employeeFormSection, 
        'lineupContent', // lineupContentId
        domElements.rosterListContainer, 
        state.employeeRoster, 
        state.activeSelectedDate, 
        state.dailyShifts, 
        state.JOB_POSITIONS_AVAILABLE // Corrected: Pass JOB_POSITIONS_AVAILABLE as jobPositions
    );
    // The following two lines are likely redundant as switchViewToLineup should handle roster rendering and masonry updates.
    // ui.renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, handleRosterEmployeeClick, handleEditLoggedShiftSetup, state.JOB_POSITIONS_AVAILABLE);
    // ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
}

function handleToggleAddNewEmployeeFormVisibility() {
    const isCurrentlyHidden = domElements.addEmployeeFormWrapper.style.display === 'none';
    // Corrected arguments for toggleEmployeeFormVisibility:
    // formWrapper, toggleButton, isEditing, employeeToEdit, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList
    ui.toggleEmployeeFormVisibility(
        domElements.addEmployeeFormWrapper,       // formWrapper
        domElements.toggleAddNewEmployeeFormBtn,  // toggleButton
        !!domElements.editingEmployeeIdInput.value, // isEditing (true if editingIdInput has a value)
        null,                                     // employeeToEdit (not directly editing here, form might be pre-filled if ID exists)
        domElements.empNameInput,
        domElements.empPositionsContainer,
        domElements.addEmployeeBtn,
        domElements.updateEmployeeBtn,
        domElements.cancelEditBtn,
        domElements.editingEmployeeIdInput,
        state.JOB_POSITIONS_AVAILABLE
    );
    // The resetEmployeeForm call was inside an if(isCurrentlyHidden) block, 
    // but toggleEmployeeFormVisibility itself handles reset logic when opening for 'add new'.
    // If the intention is to always reset when toggling to *show* for 'add new', 
    // that logic is within toggleEmployeeFormVisibility.
}

function handleAddOrUpdateEmployee(isUpdating) {
    const name = domElements.empNameInput.value.trim();
    if (!name) {
        ui.showInfoModal("Employee name cannot be empty.");
        return;
    }
    const selectedPositions = [];
    const payRates = {};
    domElements.empPositionsContainer.querySelectorAll('.position-entry-group').forEach(group => {
        const roleBtn = group.querySelector('button.role-toggle-btn');
        if (roleBtn && roleBtn.classList.contains('selected-role')) {
            const position = roleBtn.dataset.position;
            selectedPositions.push(position);
            const payRateInput = group.querySelector(`.pay-rate-input-wrapper input[data-position="${position}"]`);
            payRates[position] = parseFloat(payRateInput.value) || 0;
        }
    });

    if (selectedPositions.length === 0 && state.JOB_POSITIONS_AVAILABLE.length > 0) {
        ui.showInfoModal("Please select at least one role for the employee.");
        return;
    }

    if (isUpdating) {
        const empId = domElements.editingEmployeeIdInput.value;
        const empIndex = state.employeeRoster.findIndex(e => e.id === empId);
        if (empIndex > -1) {
            const updatedEmployee = { ...state.employeeRoster[empIndex], name, positions: selectedPositions, payRates: payRates };
            state.updateEmployeeInRoster(updatedEmployee);
        }
    } else {
        const newEmployee = { id: utils.generateId(), name, positions: selectedPositions, payRates: payRates };
        state.addEmployeeToRoster(newEmployee);
    }
    ui.renderFullEmployeeListForManagement(
        domElements.fullEmployeeRosterContainer,
        state.employeeRoster,
        handleEditEmployeeSetupFromMgmtList, // Correct callback for edit
        handleRemoveEmployeeFromMgmtList     // Correct callback for remove
    );
    ui.toggleEmployeeFormVisibility(domElements.addEmployeeFormWrapper, domElements.toggleAddNewEmployeeFormBtn, false, null, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE); // Hide form, Added domElements
    ui.resetEmployeeForm(domElements.addEmployeeFormWrapper, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE); // Added domElements
}

function handleCancelEditEmployee() {
    ui.resetEmployeeForm(domElements.addEmployeeFormWrapper, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE); // Added domElements
    ui.toggleEmployeeFormVisibility(domElements.addEmployeeFormWrapper, domElements.toggleAddNewEmployeeFormBtn, false, null, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE); // Hide form, Added domElements
}

function handleRemoveEmployeeFromMgmtList(empId) {
    const employee = state.employeeRoster.find(e => e.id === empId);
    if (!employee) {
        console.error("Error: Employee not found for removal:", empId);
        ui.showInfoModal("Error: Employee not found.");
        return;
    }

    const message = `Are you sure you want to remove ${employee.name}? This will also remove any of their logged shifts.`;

    ui.showConfirmationModal(message, () => { // This is the onConfirm callback
        state.removeEmployeeFromRoster(empId);

        // Re-render the main employee roster (lineup view)
        ui.renderEmployeeRoster(
            domElements.rosterListContainer,
            state.employeeRoster,
            state.activeSelectedDate,
            state.dailyShifts,
            handleRosterEmployeeClick,
            handleEditLoggedShiftSetup,
            state.JOB_POSITIONS_AVAILABLE
        );
        ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);

        // Re-render the full employee list in the management view
        ui.renderFullEmployeeListForManagement(
            domElements.fullEmployeeRosterContainer,
            state.employeeRoster,
            handleEditEmployeeSetupFromMgmtList, // Pass the dedicated handler for edits
            handleRemoveEmployeeFromMgmtList     // Pass this function for removals
        );

        // If the employee being edited (if any, in the main form) was the one just removed, reset the form.
        if (domElements.editingEmployeeIdInput.value === empId) {
            ui.resetEmployeeForm(
                domElements.addEmployeeFormWrapper,
                domElements.empNameInput,
                domElements.empPositionsContainer,
                domElements.addEmployeeBtn,
                domElements.updateEmployeeBtn,
                domElements.cancelEditBtn,
                domElements.editingEmployeeIdInput,
                state.JOB_POSITIONS_AVAILABLE
            );
            // Ensure the form is in "add new" mode visually
            domElements.addEmployeeBtn.style.display = 'inline-block';
            domElements.updateEmployeeBtn.style.display = 'none';
        }
    });
}


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
            ui.renderInlineShiftForm(formContainer, employeeData, positionContext, state.activeSelectedDate, null, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift);
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
            ui.updateEmployeeLineupCard(liElement, actualButton, existingShiftForCancel, employeeData, positionContext);
        }
    }
    ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


async function handleLogOrUpdateInlineShift(event) {
    event.preventDefault();
    const saveButton = event.target; // The button that was clicked
    const form = saveButton.closest('.inline-shift-form-container').querySelector('div[data-shift-form-for]'); // Find the main form div

    if (!form) {
        console.error('[events.js] handleLogOrUpdateInlineShift - Could not find form element.');
        return;
    }

    console.log('[events.js] handleLogOrUpdateInlineShift - Event triggered, Save button:', saveButton, 'Form container:', form.parentElement); //诊断日志

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

    console.log('[events.js] handleLogOrUpdateInlineShift - Shift data to save:', JSON.parse(JSON.stringify(shiftDataToSave))); //诊断日志

    try {
        // Corrected to use addOrUpdateShift and ensure it's awaited if async (though it's synchronous in state.js)
        // Also, ensure addOrUpdateShift returns the saved/updated shift object.
        const savedShift = state.addOrUpdateShift(shiftDataToSave); 
        console.log('[events.js] handleLogOrUpdateInlineShift - Shift saved/updated in state:', JSON.parse(JSON.stringify(savedShift))); //诊断日志

        // Update the specific employee's lineup card
        const liId = `roster-emp-${employeeId}-${positionContext.replace(/\s+/g, '')}`;
        const liElement = document.getElementById(liId);
        const buttonElement = liElement ? liElement.querySelector('.worked-today-toggle-btn') : null;
        const employee = state.getEmployeeById(employeeId);

        if (liElement && buttonElement && employee) {
            console.log('[events.js] handleLogOrUpdateInlineShift - Calling ui.updateEmployeeLineupCard with:', {liId, shiftId: savedShift.id, empName: employee.name, pos: positionContext});
            ui.updateEmployeeLineupCard(liElement, buttonElement, savedShift, employee, positionContext);
        } else {
            console.error('[events.js] handleLogOrUpdateInlineShift - Could not find elements to update UI for employee:', employeeId, 'position:', positionContext, {liElement, buttonElement, employee});
        }

        // Hide the form
        const inlineFormContainer = form.parentElement; // container is one level up from form div
        if (inlineFormContainer) {
            inlineFormContainer.style.display = 'none';
            inlineFormContainer.innerHTML = '';
        }
        
        // Re-render daily payouts for the current date as shift data has changed
        renderDailyPayouts(selectedDate);
        // Optionally, regenerate weekly report if it's visible and might be affected
        // generateWeeklyReportContent(); // Consider if this is too heavy or needed immediately

    } catch (error) {
        console.error('Error saving shift:', error);
        alert(`Error saving shift: ${error.message}`);
    }
}

function handleDeleteInlineShift(employeeId, positionContext, shiftId) {
    ui.showConfirmationModal("Really delete this shift? This cannot be undone.", () => {
        state.removeShift(state.activeSelectedDate, shiftId);
        
        const rosterLiElement = document.getElementById(`roster-emp-${employeeId}-${positionContext.replace(/\s+/g, '')}`);
        if (rosterLiElement) {
            const formContainer = rosterLiElement.querySelector('.inline-shift-form-container');
            if (formContainer) {
                formContainer.style.display = 'none';
                formContainer.innerHTML = '';
            }
            const buttonElement = rosterLiElement.querySelector('.worked-today-toggle-btn');
            if (buttonElement) {
                 const employeeData = state.employeeRoster.find(e => e.id === employeeId);
                 ui.updateEmployeeLineupCard(rosterLiElement, buttonElement, null, employeeData, positionContext); // Null indicates no shift, Added employeeData, positionContext
            }
        } else {
            ui.renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, handleRosterEmployeeClick, handleEditLoggedShiftSetup, state.JOB_POSITIONS_AVAILABLE); // Added domElements.rosterListContainer and JOB_POSITIONS_AVAILABLE
        }
        ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
    });
}

function handleCancelInlineShift(employeeId, positionContext, existingShiftData) {
    // Robustly find the liElement using employeeId and positionContext
    const posKeyForId = positionContext.replace(/\\s+/g, ''); // Corrected: remove only whitespace, not all non-word chars
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
            // Pass existingShiftData which could be null if no shift was logged before opening the form
            ui.updateEmployeeLineupCard(rosterLiElement, buttonElement, existingShiftData, employeeData, positionContext);
        }
    } else {
        console.warn(`Could not find roster LI for empId: ${employeeId}, posKey: ${posKeyForId} during cancel.`);
        // Fallback: re-render the whole roster if the specific element isn't found
        // This is a safety net, ideally the element should always be found.
        // Ensure all arguments are passed correctly, especially jobPositions
        ui.renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, state.JOB_POSITIONS_AVAILABLE);
    }
    ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
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
            ui.updateEmployeeLineupCard(problemLi, buttonClicked, null, empData, posCtx);
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
            ui.updateEmployeeLineupCard(problemLi, buttonClicked, null, empData, posCtx);
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
            ui.updateEmployeeLineupCard(problemLi, buttonClicked, null, empData, posCtx);
        }
        return;
    }

    const employee = state.employeeRoster.find(e => e.id === shiftToEdit.employeeId);
    if (!employee) { ui.showInfoModal("Error: Employee data not found for this shift."); return; }

    const rosterLi = buttonClicked.closest('li');
    if (!rosterLi) { ui.showInfoModal("Error displaying edit form (parent LI not found)."); return; }

    let inlineFormContainer = rosterLi.querySelector('.inline-shift-form-container');
    if (!inlineFormContainer) { console.error("Inline form container not found in LI for edit."); return; }

    ui.renderInlineShiftForm(inlineFormContainer, employee, shiftToEdit.positionWorked, state.activeSelectedDate, shiftToEdit, handleLogOrUpdateInlineShift, handleDeleteInlineShift, handleCancelInlineShift); // Added state.activeSelectedDate
    inlineFormContainer.style.display = 'block';
    
    buttonClicked.textContent = 'Close Shift Form'; // Or some other indicator that form is open
    buttonClicked.classList.remove('is-not-working', 'is-editing-shift');
    buttonClicked.classList.add('is-working'); 
    buttonClicked.setAttribute('aria-pressed', 'true');


    // Scroll and focus
    setTimeout(() => {
        const firstInput = inlineFormContainer.querySelector('input[type="time"], select');
        if (firstInput) firstInput.focus();
        rosterLi.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
}


function handleRemoveShiftFromDailyScoop(shiftId, shiftDate, empId, posCtx) { // Modified to accept parameters directly
    if (!shiftId || !shiftDate) { 
        ui.showInfoModal("Error: Cannot identify shift to remove."); 
        return; 
    }

    const employee = state.employeeRoster.find(e => e.id === empId);
    const empNameDisplay = employee ? employee.name : `Employee ID ${empId}`;

    const message = `Are you sure you want to remove the shift for ${empNameDisplay} (${posCtx}) on ${utils.formatDisplayDate(shiftDate)}?\nThis action cannot be undone.`;
    ui.showConfirmationModal(message, () => {
        state.removeShift(shiftDate, shiftId);
        triggerDailyScoopCalculation();
        if (shiftDate === state.activeSelectedDate) {
            ui.renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, handleRosterEmployeeClick, handleEditLoggedShiftSetup, state.JOB_POSITIONS_AVAILABLE);
            ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
        }
    });
}


function handlePrevWeek() {
    if (state.currentReportWeekStartDate) {
        const newStartDate = new Date(state.currentReportWeekStartDate);
        newStartDate.setUTCDate(newStartDate.getUTCDate() - 7);
        state.setCurrentReportWeekStartDate(newStartDate);

        const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(newStartDate, state.BASE_CYCLE_START_DATE);
        if (cycleStart && weekNum && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
            domElements.cycleStartDateSelect.value = cycleStart;
            domElements.weekInCycleSelect.value = String(weekNum);
            calculateAndUpdateCurrentDate(1); // Update to Monday of that week
        } else {
            console.error("Could not find matching cycle/week for new prev week date:", newStartDate);
            // Revert if navigation fails
            state.setCurrentReportWeekStartDate(new Date(state.currentReportWeekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000));
            ui.showInfoModal("Could not navigate to the previous week. It might be out of the configured cycle range.");
        }
    }
}

function handleNextWeek() {
    if (state.currentReportWeekStartDate) {
        const newStartDate = new Date(state.currentReportWeekStartDate);
        newStartDate.setUTCDate(newStartDate.getUTCDate() + 7);
        state.setCurrentReportWeekStartDate(newStartDate);
        
        const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(newStartDate, state.BASE_CYCLE_START_DATE);
         if (cycleStart && weekNum && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
            domElements.cycleStartDateSelect.value = cycleStart;
            domElements.weekInCycleSelect.value = String(weekNum);
            calculateAndUpdateCurrentDate(1); // Update to Monday of that week
        } else {
            console.error("Could not find matching cycle/week for new next week date:", newStartDate);
            // Revert if navigation fails
            state.setCurrentReportWeekStartDate(new Date(state.currentReportWeekStartDate.getTime() - 7 * 24 * 60 * 60 * 1000));
            ui.showInfoModal("Could not navigate to the next week. It might be out of the configured cycle range.");
        }
    }
}

function handleEditShiftFromWeeklyReport(shiftIdToEdit, shiftDate, employeeId, positionContext) { // Modified to accept parameters directly
    if (!shiftIdToEdit || !shiftDate || !employeeId || !positionContext) {
        ui.showInfoModal("Error: Could not get all necessary details to edit the shift."); return;
    }

    const targetDateObj = new Date(shiftDate + 'T00:00:00Z');
    const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(targetDateObj, state.BASE_CYCLE_START_DATE);

    if (!cycleStart || !weekNum || !domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
        ui.showInfoModal("Error: Could not automatically set date controls. Please navigate manually."); return;
    }

    domElements.cycleStartDateSelect.value = cycleStart;
    domElements.weekInCycleSelect.value = String(weekNum);
    let dayOfWeekNum = targetDateObj.getUTCDay();
    state.setCurrentSelectedDayOfWeek(dayOfWeekNum);
    calculateAndUpdateCurrentDate(dayOfWeekNum);

    // Ensure lineup section is visible and scroll to it
    ui.switchViewToLineup(domElements.employeeFormSection, domElements.employeeLineupSection, domElements.payoutSection, domElements.weeklyReportSection, domElements.dataManagementSection); // Added domElements
    domElements.employeeLineupSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
        const rosterLiId = `roster-emp-${employeeId}-${positionContext.replace(/\s+/g, '')}`;
        const targetLi = document.getElementById(rosterLiId);
        if (targetLi) {
            const toggleButton = targetLi.querySelector('.worked-today-toggle-btn');
            if (toggleButton) {
                // Ensure the button's state reflects the shift to be edited
                const currentShiftInLineup = state.dailyShifts[state.activeSelectedDate]?.find(s => s.id === shiftIdToEdit);
                const employeeData = state.employeeRoster.find(e => e.id === employeeId);
                 ui.updateEmployeeLineupCard(targetLi, toggleButton, currentShiftInLineup, employeeData, positionContext); // Added employeeData, positionContext
                // Now, simulate the click to open the form
                if (toggleButton.dataset.action === "edit" && toggleButton.dataset.shiftId === shiftIdToEdit) {
                    // Directly call the setup function for editing
                     handleEditLoggedShiftSetup({target: toggleButton});
                     setTimeout(() => targetLi.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                } else {
                    // If it's not already in "edit" mode (e.g. form was closed), click it to open.
                    toggleButton.click(); 
                    // It might need a second click if the first click just opens the form without populating
                     setTimeout(() => {
                        if (toggleButton.dataset.action !== "edit" || toggleButton.dataset.shiftId !== shiftIdToEdit) {
                             handleEditLoggedShiftSetup({target: toggleButton});
                        }
                         setTimeout(() => targetLi.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                    }, 150);
                }
            }
        } else {
            ui.showInfoModal("Error: Could not find the employee's entry in The Lineup to edit the shift.");
        }
    }, 350);
}


function generateWeeklyReportContent() {
    console.log("[LOG events.js] generateWeeklyReportContent called. currentReportWeekStartDate:", state.currentReportWeekStartDate, "Type:", typeof state.currentReportWeekStartDate, "IsDate:", state.currentReportWeekStartDate instanceof Date);
    if (!state.currentReportWeekStartDate) {
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Use date selector to establish a week context first.</p>";
        return;
    }

    const weeklyEmployeeSummaryData = {};
    const processedDailyShiftsForWeek = {}; // New object to store processed shifts for each day

    if (state.currentReportWeekStartDate instanceof Date && !isNaN(state.currentReportWeekStartDate.getTime())) {
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(state.currentReportWeekStartDate);
            currentDay.setUTCDate(state.currentReportWeekStartDate.getUTCDate() + i);
            const dateString = utils.formatDate(currentDay);

            const shiftsForDay = state.dailyShifts[dateString];
            let processedShifts = []; // Default to empty array

            if (shiftsForDay && shiftsForDay.length > 0) {
                processedShifts = calculations.runTipAndWageCalculationsForDay(shiftsForDay);
                processedDailyShiftsForWeek[dateString] = processedShifts; // Store processed shifts

                processedShifts.forEach(pShift => {
                    if (!pShift.employeeId || !pShift.employeeName) {
                        console.warn("[LOG events.js] Processed shift missing employeeId or employeeName:", pShift);
                        return; 
                    }

                    if (!weeklyEmployeeSummaryData[pShift.employeeId]) {
                        weeklyEmployeeSummaryData[pShift.employeeId] = {
                            employeeId: pShift.employeeId,
                            employeeName: pShift.employeeName,
                            totalWeeklyWages: 0,
                            totalWeeklyTipsForTaxes: 0,
                            totalWeeklyTipsOnCheck: 0,
                            totalWeeklyPayoutOnCheck: 0
                        };
                    }
                    const summary = weeklyEmployeeSummaryData[pShift.employeeId];
                    summary.totalWeeklyWages += pShift.shiftWage || 0;
                    summary.totalWeeklyTipsForTaxes += pShift.tipsForTaxes || 0;
                    summary.totalWeeklyTipsOnCheck += pShift.finalTakeHomeTips || 0; 
                });
            } else {
                processedDailyShiftsForWeek[dateString] = []; // Ensure entry exists even if no shifts
            }
        }

        for (const empId in weeklyEmployeeSummaryData) {
            const summary = weeklyEmployeeSummaryData[empId];
            summary.totalWeeklyPayoutOnCheck = summary.totalWeeklyWages + summary.totalWeeklyTipsOnCheck;
        }
    }
    
    console.log("[LOG events.js] About to call ui.generateWeeklyReportContentUI. Type of function:", typeof ui.generateWeeklyReportContentUI);
    try {
        console.log("[LOG events.js] Source of ui.generateWeeklyReportContentUI:", ui.generateWeeklyReportContentUI.toString());
    } catch (e) {
        console.error("[LOG events.js] Error getting toString of ui.generateWeeklyReportContentUI:", e);
    }
    
    const editShiftCallbackFn = (shiftId, date, empId, posCtx) => handleEditShiftFromWeeklyReport(shiftId, date, empId, posCtx);

    // Corrected argument order and added missing arguments
    const resultFromUI = ui.generateWeeklyReportContentUI(
        domElements.reportOutputDiv, 
        weeklyEmployeeSummaryData, 
        processedDailyShiftsForWeek, // Pass the processed shifts for the week
        state.currentReportWeekStartDate, 
        state.JOB_POSITIONS_AVAILABLE, // jobPositions
        editShiftCallbackFn // onEditShiftCallback
    );

    console.log("[LOG events.js] Result from ui.generateWeeklyReportContentUI:", resultFromUI);
    console.log("[LOG events.js] Type of resultFromUI:", typeof resultFromUI);

    if (typeof resultFromUI === 'undefined') {
        console.error("[LOG events.js] CRITICAL: ui.generateWeeklyReportContentUI returned undefined! Defaulting reportHTML.");
        const reportHTML = "<p>Error generating report: UI function returned undefined.</p>";
        const hasData = false;
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = reportHTML;
        if (domElements.exportWeeklyCSVBtn) domElements.exportWeeklyCSVBtn.style.display = hasData ? 'inline-block' : 'none';
        return; // Exit early as we can't proceed
    }

    const { html: reportHTML, hasData } = resultFromUI;
    if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = reportHTML;
    if (domElements.exportWeeklyCSVBtn) domElements.exportWeeklyCSVBtn.style.display = hasData ? 'inline-block' : 'none';
    
    // Event listeners are now attached within generateWeeklyReportContentUI if it handles its own buttons,
    // or if it returns button elements, they would be handled here. 
    // Based on the call signature, it seems the callback is passed in, so internal handling is likely.
    // If it *doesn't* and relies on querySelectorAll here, then this is fine.
}

function handleExportToXLSX() {
    if (!state.currentReportWeekStartDate) {
        ui.showInfoModal("Please ensure a week is selected in the 'Weekly Rewind' section first.");
        return;
    }
    // This function will need access to XLSX library, state.dailyShifts, state.currentReportWeekStartDate, calculations.runTipAndWageCalculationsForDay
    // For now, we assume ui.exportToXLSX can handle it or we pass necessary data.
    // Let's assume ui.exportToXLSX is designed to fetch what it needs or take it as params.
    // We need to ensure it has access to runTipAndWageCalculationsForDay.
    ui.exportToXLSX(state.currentReportWeekStartDate, state.dailyShifts, calculations.runTipAndWageCalculationsForDay, utils.formatDate, utils.formatTimeTo12Hour, utils.sortEmployeesByName);
}


function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) {
        ui.displayImportStatus(domElements.importStatusMessages, domElements.importFileName, "No file selected.", [], true); // Corrected argument order
        return;
    }
    ui.displayImportStatus(domElements.importStatusMessages, domElements.importFileName, `Selected file: ${file.name}`, [], false); // Corrected argument order

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        try {
            // Corrected: Removed utils.generateId from the arguments
            const { employees, errors, skipped } = ui.parseImportedEmployeeData(content, state.JOB_POSITIONS_AVAILABLE);
            
            let importMessages = { success: null, skipped: null, errors: [] };

            if (errors && errors.length > 0) {
                importMessages.errors = errors;
                ui.displayImportStatus(domElements.importStatusMessages, domElements.importFileName, file.name, importMessages);
                return;
            }

            let newEmployeesAdded = 0;
            let employeesUpdated = 0;

            if (employees && employees.length > 0) {
                employees.forEach(parsedEmp => {
                    const existingEmpIndex = state.employeeRoster.findIndex(emp => emp.name.toLowerCase() === parsedEmp.name.toLowerCase());
                    if (existingEmpIndex > -1) {
                        // Update existing employee
                        const updatedEmployee = { 
                            ...state.employeeRoster[existingEmpIndex], 
                            positions: parsedEmp.positions, 
                            payRates: parsedEmp.payRates 
                        };
                        state.updateEmployeeInRoster(updatedEmployee);
                        employeesUpdated++;
                    } else {
                        // Add new employee
                        const newEmployeeWithId = { ...parsedEmp, id: utils.generateId() };
                        state.addEmployeeToRoster(newEmployeeWithId);
                        newEmployeesAdded++;
                    }
                });

                ui.renderFullEmployeeListForManagement(
                    domElements.fullEmployeeRosterContainer, 
                    state.employeeRoster, 
                    handleEditEmployeeSetupFromMgmtList, 
                    handleRemoveEmployeeFromMgmtList
                );
                
                let successMsg = [];
                if (newEmployeesAdded > 0) successMsg.push(`Added ${newEmployeesAdded} new employee(s).`);
                if (employeesUpdated > 0) successMsg.push(`Updated ${employeesUpdated} existing employee(s).`);
                if (newEmployeesAdded === 0 && employeesUpdated === 0 && (!skipped || skipped.length === 0)) {
                     importMessages.success = "No changes made. All employees in the file might already exist with the same details or the file was empty/correctly formatted but had no actionable data.";
                } else {
                    importMessages.success = successMsg.join(' ');
                }

            } else if ((!errors || errors.length === 0) && (!skipped || skipped.length === 0)) {
                 importMessages.success = "File processed, but no employee data was found or parsed.";
            }

            if (skipped && skipped.length > 0) {
                importMessages.skipped = `Skipped ${skipped.length} line(s). Check console for details if not shown here.`;
                // Optionally, add skipped messages to a more detailed log or part of the UI display if needed.
                // For now, just a count.
            }
            
            ui.displayImportStatus(domElements.importStatusMessages, domElements.importFileName, file.name, importMessages);

        } catch (err) {
            console.error("Error processing imported file:", err);
            const importMessages = { errors: [`An unexpected error occurred: ${err.message}`] };
            ui.displayImportStatus(domElements.importStatusMessages, domElements.importFileName, file.name, importMessages);
        }
        if (domElements.employeeImportFileInput) domElements.employeeImportFileInput.value = ''; // Reset file input
    };
    reader.onerror = () => {
        ui.displayImportStatus(domElements.importStatusMessages, domElements.importFileName, "Error reading file.", [], true); // Added domElements
        domElements.employeeImportFileInput.value = '';
    };
    reader.readAsText(file);
}

function handleDownloadState() {
    ui.downloadAppState(state.employeeRoster, state.dailyShifts, utils.formatDate);
}

function handleLoadState(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (loadedData.employeeRoster && loadedData.dailyShifts) {
                state.setEmployeeRoster(loadedData.employeeRoster);
                state.setDailyShifts(loadedData.dailyShifts);
                ui.showInfoModal("Application state loaded successfully! The page will now refresh to apply changes.", () => {
                    // Re-initialize or refresh the entire application UI
                    // For a full refresh, might be simplest to reload, or call a main re-render function
                    // For now, let's re-run the core setup parts
                    ui.populateCycleStartDateSelect(domElements.cycleStartDateSelect, state.BASE_CYCLE_START_DATE, state.activeSelectedDate);
                    ui.populateWeekInCycleSelect(domElements.weekInCycleSelect, state.activeSelectedDate, domElements.cycleStartDateSelect.value, state.BASE_CYCLE_START_DATE);
                    calculateAndUpdateCurrentDate(); // This should re-render most dynamic parts
                    ui.renderFullEmployeeListForManagement(domElements.fullEmployeeRosterContainer, state.employeeRoster, handleEditEmployeeSetupFromMgmtList, handleRemoveEmployeeFromMgmtList); 
                });

            } else {
                ui.showInfoModal("Error: Invalid state file format.");
            }
        } catch (err) {
            console.error("Error loading state:", err);
            ui.showInfoModal(`Error loading state: ${err.message}`);
        }
        domElements.loadStateFileInput.value = ''; // Reset file input
    };
    reader.readAsText(file);
}

// --- Tutorial Event Handlers ---
function handleStartTutorial(tutorialKey) {
    const tutorialSteps = state.tutorials[tutorialKey];
    if (tutorialSteps && tutorialSteps.length > 0) {
        state.setCurrentTutorialSteps(tutorialSteps);
        state.setCurrentTutorialStepIndex(0);
        ui.showTutorialStep(state.currentTutorialSteps, state.currentTutorialStepIndex, domElements.tutorialOverlay, domElements.tutorialHighlightBox, domElements.tutorialTextBox, domElements.tutorialTitle, domElements.tutorialText, domElements.tutorialStepCounter, domElements.tutorialPrevBtn, domElements.tutorialNextBtn, domElements.tutorialCloseBtn, state.setTutorialAnimationId, state.setCurrentTutorialTargetElement); // Added domElements and state setters
    }
}

function handleNextTutorialStep() {
    if (state.currentTutorialStepIndex < state.currentTutorialSteps.length - 1) {
        state.setCurrentTutorialStepIndex(state.currentTutorialStepIndex + 1);
        ui.showTutorialStep(state.currentTutorialSteps, state.currentTutorialStepIndex, domElements.tutorialOverlay, domElements.tutorialHighlightBox, domElements.tutorialTextBox, domElements.tutorialTitle, domElements.tutorialText, domElements.tutorialStepCounter, domElements.tutorialPrevBtn, domElements.tutorialNextBtn, domElements.tutorialCloseBtn, state.setTutorialAnimationId, state.setCurrentTutorialTargetElement); // Added domElements and state setters
    } else {
        ui.closeTutorial(domElements.tutorialOverlay, domElements.tutorialHighlightBox, domElements.tutorialTextBox, state.tutorialAnimationId, state.currentTutorialTargetElement, state.setTutorialAnimationId, state.setCurrentTutorialTargetElement); // Added domElements and state setters
    }
}

function handlePrevTutorialStep() {
    if (state.currentTutorialStepIndex > 0) {
        state.setCurrentTutorialStepIndex(state.currentTutorialStepIndex - 1);
        ui.showTutorialStep(state.currentTutorialSteps, state.currentTutorialStepIndex, domElements.tutorialOverlay, domElements.tutorialHighlightBox, domElements.tutorialTextBox, domElements.tutorialTitle, domElements.tutorialText, domElements.tutorialStepCounter, domElements.tutorialPrevBtn, domElements.tutorialNextBtn, domElements.tutorialCloseBtn, state.setTutorialAnimationId, state.setCurrentTutorialTargetElement); // Added domElements and state setters
    }
}

function handleCloseTutorial() {
    ui.closeTutorial(domElements.tutorialOverlay, domElements.tutorialHighlightBox, domElements.tutorialTextBox, state.tutorialAnimationId, state.currentTutorialTargetElement, state.setTutorialAnimationId, state.setCurrentTutorialTargetElement); // Added domElements and state setters
}


// --- Initialization of Event Listeners ---
export function initializeEventListeners() {
    // Global Date Controls
    if (domElements.cycleStartDateSelect) domElements.cycleStartDateSelect.addEventListener('change', handleCycleOrWeekChange);
    if (domElements.weekInCycleSelect) domElements.weekInCycleSelect.addEventListener('change', handleCycleOrWeekChange);

    // Employee Management View
    if (domElements.goBackToLineupBtn) domElements.goBackToLineupBtn.addEventListener('click', handleGoBackToLineup);
    if (domElements.toggleAddNewEmployeeFormBtn) domElements.toggleAddNewEmployeeFormBtn.addEventListener('click', handleToggleAddNewEmployeeFormVisibility);
    if (domElements.addEmployeeBtn) domElements.addEmployeeBtn.addEventListener('click', () => handleAddOrUpdateEmployee(false));
    if (domElements.updateEmployeeBtn) domElements.updateEmployeeBtn.addEventListener('click', () => handleAddOrUpdateEmployee(true));
    if (domElements.cancelEditBtn) domElements.cancelEditBtn.addEventListener('click', handleCancelEditEmployee);
    if (domElements.employeeImportFileInput) domElements.employeeImportFileInput.addEventListener('change', handleFileImport);
    // Event listeners for dynamically generated role toggle buttons in employee form
    if (domElements.empPositionsContainer) {
        domElements.empPositionsContainer.addEventListener('click', (event) => {
            const roleToggleButton = event.target.closest('.role-toggle-btn');
            if (roleToggleButton) {
                const positionIdentifier = roleToggleButton.dataset.position.replace(/\s+/g, '');
                const isSelected = roleToggleButton.classList.toggle('selected-role');
                roleToggleButton.classList.toggle('is-not-working', !isSelected);
                roleToggleButton.setAttribute('aria-pressed', isSelected.toString());
                ui.togglePayRateInputVisibility(positionIdentifier, isSelected);
            }
        });
    }

    // Shift Logging View
    if (domElements.showAddEmployeeFormBtn) domElements.showAddEmployeeFormBtn.addEventListener('click', handleShowAddEmployeeForm);
    // Roster list item clicks (for logging/editing shifts) are handled during renderEmployeeRoster by attaching to specific elements.
    // However, if rosterListContainer is the parent for delegation:
    if (domElements.rosterListContainer) {
        domElements.rosterListContainer.addEventListener('click', handleRosterEmployeeClick);
    }

    // Weekly Report View
    if (domElements.prevWeekBtn) domElements.prevWeekBtn.addEventListener('click', handlePrevWeek);
    if (domElements.nextWeekBtn) domElements.nextWeekBtn.addEventListener('click', handleNextWeek);
    if (domElements.exportWeeklyCSVBtn) domElements.exportWeeklyCSVBtn.addEventListener('click', handleExportToXLSX);
    // Edit buttons within weekly report are attached dynamically in generateWeeklyReportContent

    // Data Management View
    if (domElements.downloadStateBtn) domElements.downloadStateBtn.addEventListener('click', handleDownloadState);
    if (domElements.loadStateFileInput) domElements.loadStateFileInput.addEventListener('change', handleLoadState);

    // Tutorial System
    document.addEventListener('click', function(event) {
        const tutorialButton = event.target.closest('[data-tutorial]');
        if (tutorialButton) {
            console.log(`APP_LOG: Delegated tutorial button click in js/events.js. Tutorial ID: ${tutorialButton.dataset.tutorial}, Element:`, tutorialButton); // DIAGNOSTIC LOG
            handleStartTutorial(tutorialButton.dataset.tutorial);
            // We might want to stop propagation if the tutorial opens a modal and we don't want underlying elements to react.
            // event.stopPropagation(); // Consider uncommenting if needed after testing.
        }
    });
    if (domElements.tutorialNextBtn) domElements.tutorialNextBtn.addEventListener('click', handleNextTutorialStep);
    if (domElements.tutorialPrevBtn) domElements.tutorialPrevBtn.addEventListener('click', handlePrevTutorialStep);
    if (domElements.tutorialCloseBtn) domElements.tutorialCloseBtn.addEventListener('click', handleCloseTutorial);
    if (domElements.tutorialOverlay) {
        domElements.tutorialOverlay.addEventListener('click', (e) => {
            if (e.target === domElements.tutorialOverlay) { // Only close if clicking overlay itself
                handleCloseTutorial();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (domElements.tutorialOverlay && domElements.tutorialOverlay.style.display === 'block') {
            if (e.key === 'Escape') handleCloseTutorial();
            if (e.key === 'ArrowRight') handleNextTutorialStep();
            if (e.key === 'ArrowLeft') handlePrevTutorialStep();
        }
    });

    // Resize listener for masonry layout
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (domElements.employeeLineupSection && domElements.employeeLineupSection.style.display !== 'none') {
                ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
            }
        }, 250);
    });

    // Tab/View switching listeners
    document.querySelectorAll('.view-toggle-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetViewId = event.currentTarget.dataset.viewTarget;
            ui.switchView(targetViewId, domElements.employeeFormSection, domElements.employeeLineupSection, domElements.payoutSection, domElements.weeklyReportSection, domElements.dataManagementSection); // Added domElements
            // If switching to lineup, re-apply masonry
            if (targetViewId === 'employeeLineupSection' && domElements.employeeLineupSection.style.display !== 'none') {
                ui.applyMasonryLayoutToRoster(domElements.rosterListContainer);
            }
            // If switching to daily scoop, trigger calculation
            if (targetViewId === 'payoutSection' && domElements.payoutSection.style.display !== 'none') {
                triggerDailyScoopCalculation();
            }
            // If switching to weekly rewind, trigger calculation
            if (targetViewId === 'weeklyReportSection' && domElements.weeklyReportSection.style.display !== 'none') {
                triggerWeeklyRewindCalculation();
            }
        });
    });

    console.log("EVENT_LOG: All event listeners initialized.");
}
// Expose functions that might be called by UI elements directly if not through a standard event
// (e.g. if a button is dynamically created and needs a handler from here)
// Most handlers are assigned via initializeEventListeners.
// However, callbacks passed to UI functions are effectively exports.
export {
    calculateAndUpdateCurrentDate, // Also called by main.js
    triggerDailyScoopCalculation,
    triggerWeeklyRewindCalculation,
    handleAddOrUpdateEmployee,
    handleCancelEditEmployee,
    handleRemoveEmployeeFromMgmtList,
    handleRosterEmployeeClick,
    handleEditLoggedShiftSetup,
    handleLogOrUpdateInlineShift,
    handleDeleteInlineShift,
    handleCancelInlineShift,
    handleRemoveShiftFromDailyScoop,
    handleEditShiftFromWeeklyReport,
    handleEditEmployeeSetupFromMgmtList // Export if needed by other modules, or keep local if only used here
};

// filepath: c:\\Users\\orthd\\OneDrive\\Documents\\CodeMonkeez\\Projects\\Toodys-Tip-Deluxe\\js\\shifts.js
// --- Shift Logging and Management ---

/**
 * Logs a new shift or updates an existing one.
 * @param {string} employeeId - The ID of the employee.
 * @param {string} date - The date of the shift (YYYY-MM-DD).
 * @param {string} startTime - The start time of the shift (HH:MM).
 * @param {string} endTime - The end time of the shift (HH:MM).
 * @param {string} jobPositionId - The ID of the job position for this shift.
 * @param {number} [totalSales=0] - Total sales during the shift (optional).
 * @param {number} [ccTips=0] - Credit card tips (optional).
 * @param {number} [cashTips=0] - Cash tips (optional).
 * @param {string} [shiftId=null] - The ID of the shift to update (if editing).
 * @returns {boolean} True if shift was logged/updated successfully, false otherwise.
 */
function logShift(employeeId, date, startTime, endTime, jobPositionId, totalSales = 0, ccTips = 0, cashTips = 0, shiftId = null) {
    const employee = employeeRoster.find(emp => emp.id === employeeId);
    if (!employee) {
        showCustomModal("Employee not found for logging shift.");
        return false;
    }

    if (!jobPositionId || !employee.positions[jobPositionId]) {
        showCustomModal("Selected job position is not valid for this employee.");
        return false;
    }

    const payRate = employee.positions[jobPositionId];

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        showCustomModal("End time must be after start time.");
        return false;
    }

    const hoursWorked = calculateHoursWorked(startTime, endTime);
    if (hoursWorked <= 0) {
        showCustomModal("Calculated hours worked is zero or negative. Please check times.");
        return false;
    }

    const shiftData = {
        id: shiftId || generateId(),
        employeeId: employeeId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        jobPositionId: jobPositionId,
        payRate: payRate, // Store the pay rate at the time of shift logging
        hoursWorked: hoursWorked,
        totalSales: parseFloat(totalSales) || 0,
        ccTips: parseFloat(ccTips) || 0,
        cashTips: parseFloat(cashTips) || 0,
        totalTips: (parseFloat(ccTips) || 0) + (parseFloat(cashTips) || 0)
    };

    if (!dailyShifts[date]) {
        dailyShifts[date] = [];
    }

    if (shiftId) { // Editing existing shift
        const shiftIndex = dailyShifts[date].findIndex(s => s.id === shiftId);
        if (shiftIndex > -1) {
            dailyShifts[date][shiftIndex] = shiftData;
            showCustomModal("Shift updated successfully!", "success");
        } else {
            showCustomModal("Could not find shift to update.");
            return false; // Or handle error appropriately
        }
    } else { // Adding new shift
        dailyShifts[date].push(shiftData);
        showCustomModal("Shift logged successfully!", "success");
    }

    saveState();
    renderEmployeeLineup(); // Re-render the lineup to show new shift status
    renderDayNavigation(currentDate); // Update day navigation if shifts were added/modified
    // If reports view is active, re-render it
    if (document.getElementById('reportsSection').style.display !== 'none') {
        generateAndDisplayReport();
    }
    return true;
}


/**
 * Opens a modal or form to edit an existing shift.
 * For this application, we use an inline form, so this function prepares and shows it.
 * @param {string} shiftId - The ID of the shift to edit.
 * @param {string} employeeId - The ID of the employee whose shift is being edited.
 * @param {string} date - The date of the shift.
 * @param {HTMLElement} buttonElement - The button element that triggered the edit.
 */
function openEditShiftModal(shiftId, employeeId, date, buttonElement) {
    const shift = dailyShifts[date] ? dailyShifts[date].find(s => s.id === shiftId) : null;
    if (!shift) {
        showCustomModal("Shift not found for editing.");
        return;
    }
    // If another inline form is open, close it first
    const existingForm = document.querySelector('.inline-shift-form-container');
    if (existingForm && existingForm.dataset.editingShiftId !== shiftId) {
        cancelInlineShift(existingForm.dataset.employeeId, existingForm.dataset.date);
    }

    renderShiftInlineForm(employeeId, date, buttonElement.closest('li'), shift);
}

/**
 * Deletes a shift.
 * @param {string} shiftId - The ID of the shift to delete.
 * @param {string} employeeId - The ID of the employee.
 * @param {string} date - The date of the shift.
 */
function deleteShift(shiftId, employeeId, date) {
    if (!dailyShifts[date]) {
        showCustomModal("No shifts found for this date to delete.");
        return;
    }

    const shiftIndex = dailyShifts[date].findIndex(s => s.id === shiftId);
    if (shiftIndex > -1) {
        const employee = employeeRoster.find(emp => emp.id === employeeId);
        const shiftDescription = `shift on ${formatDate(date, { month: 'short', day: 'numeric' })}`;
        showCustomModal(
            `Are you sure you want to delete ${employee ? employee.name + "'s" : "this"} ${shiftDescription}? This action cannot be undone.`,
            'confirm',
            () => {
                dailyShifts[date].splice(shiftIndex, 1);
                if (dailyShifts[date].length === 0) {
                    delete dailyShifts[date]; // Clean up if no shifts left for the date
                }
                saveState();
                renderEmployeeLineup(); // Re-render to reflect deletion
                renderDayNavigation(currentDate);
                if (document.getElementById('reportsSection').style.display !== 'none') {
                    generateAndDisplayReport();
                }
                showCustomModal("Shift deleted successfully.", "success");
            }
        );
    } else {
        showCustomModal("Shift not found for deletion.");
    }
}


/**
 * Renders an inline form for adding or editing a shift directly in the employee lineup.
 * @param {string} employeeId - The ID of the employee.
 * @param {string} date - The date for the shift (YYYY-MM-DD).
 * @param {HTMLElement} listItemElement - The <li> element of the employee in the lineup.
 * @param {object} [shiftToEdit=null] - Optional. Shift object if editing an existing shift.
 */
function renderShiftInlineForm(employeeId, date, listItemElement, shiftToEdit = null) {
    // Close any other open inline forms first
    const allInlineForms = document.querySelectorAll('.inline-shift-form-container');
    allInlineForms.forEach(form => {
        // Check if the form to be closed is different from the one we might be trying to open/re-open
        const isDifferentForm = !(form.dataset.employeeId === employeeId && form.dataset.date === date && 
                                (shiftToEdit && form.dataset.editingShiftId === shiftToEdit.id));
        
        // Or, if we are opening a new form (shiftToEdit is null) and this form is for a different employee/date
        const isNewFormForDifferentEntry = !shiftToEdit && (form.dataset.employeeId !== employeeId || form.dataset.date !== date);

        if (form.style.display !== 'none' && (isDifferentForm || isNewFormForDifferentEntry)) {
            // Find the button associated with this form to reset its text
            const liForOtherForm = form.closest('li[data-employee-id]');
            if (liForOtherForm) {
                const otherEmployeeId = liForOtherForm.dataset.employeeId;
                // Call cancelInlineShift for the *other* form
                // cancelInlineShift should ideally handle finding its own button and resetting it.
                // We pass its specific employeeId and date to ensure correct cancellation.
                cancelInlineShift(otherEmployeeId, form.dataset.date, true); // Pass true to indicate it's closing due to another opening
            }
        }
    });
    
    // Now, handle the current form request
    const targetFormContainer = listItemElement.querySelector('.inline-shift-form-container');
    if (!targetFormContainer) {
        console.error("Target form container not found in list item for renderShiftInlineForm");
        return;
    }

    // If the target form is already visible and we are trying to open it for the same shift (or new shift if it was new)
    // then this click should close it.
    const isTargetFormVisible = targetFormContainer.style.display !== 'none';
    const isSameShiftOrNew = (shiftToEdit && targetFormContainer.dataset.editingShiftId === shiftToEdit.id) || 
                             (!shiftToEdit && !targetFormContainer.dataset.editingShiftId);

    if (isTargetFormVisible && isSameShiftOrNew) {
        cancelInlineShift(employeeId, date); // This will hide the form and reset the button
        return;
    }

    // If we are opening a new form or a different form, ensure any existing content in the target container is cleared
    targetFormContainer.innerHTML = ''; 

    const appState = window.state.getAppState(); // Use state.getAppState()
    const employee = appState.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        console.error("Employee not found in renderShiftInlineForm");
        if(window.ui && typeof window.ui.showCustomModal === 'function') {
            window.ui.showCustomModal({title: "Error", message: "Employee data not found.", type: "error"});
        }
        return;
    }

    targetFormContainer.dataset.employeeId = employeeId;
    targetFormContainer.dataset.date = date;
    if (shiftToEdit) {
        targetFormContainer.dataset.editingShiftId = shiftToEdit.id;
    } else {
        delete targetFormContainer.dataset.editingShiftId;
    }

    // Ensure 'date' is a valid YYYY-MM-DD string before formatting
    let displayDate = date; // Default to the raw date string
    if (date && typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        if (window.utils && typeof window.utils.formatDisplayDate === 'function') {
            displayDate = window.utils.formatDisplayDate(date);
        } else {
            console.warn("window.utils.formatDisplayDate is not available. Falling back to raw date string.");
        }
    } else {
        console.warn(`Invalid date provided to renderShiftInlineForm: ${date}. Displaying as is or 'Invalid Date'.`);
        displayDate = "Invalid Date"; // Or handle as appropriate
    }


    let formHTML = `
        <h4>${shiftToEdit ? 'Edit Shift' : 'Log Shift'} for ${employee.name} on ${displayDate}</h4>
        <div class="time-inputs-group">
            <div>
                <label for="inline-shift-job-${employeeId}-${date}">Job Position:</label>
                <select id="inline-shift-job-${employeeId}-${date}" class="inline-shift-job">
                    ${Object.keys(employee.positions).map(posId => {
                        const job = window.state.JOB_POSITIONS_AVAILABLE.find(p => p.id === posId);
                        return job ? `<option value="${job.id}" ${shiftToEdit && shiftToEdit.jobPositionId === job.id ? 'selected' : ''}>${job.name}</option>` : '';
                    }).join('')}
                </select>
            </div>
        </div>
        <div class="time-inputs-group">
            <div>
                <label for="inline-shift-start-${employeeId}-${date}">Start Time:</label>
                <input type="time" id="inline-shift-start-${employeeId}-${date}" value="${shiftToEdit ? shiftToEdit.startTime : '09:00'}">
            </div>
            <div>
                <label for="inline-shift-end-${employeeId}-${date}">End Time:</label>
                <input type="time" id="inline-shift-end-${employeeId}-${date}" value="${shiftToEdit ? shiftToEdit.endTime : '17:00'}">
            </div>
        </div>
        <div class="tip-inputs-group">
            <div>
                <label for="inline-shift-sales-${employeeId}-${date}">Total Sales (Optional):</label>
                <input type="number" id="inline-shift-sales-${employeeId}-${date}" min="0" step="0.01" placeholder="0.00" value="${shiftToEdit && shiftToEdit.totalSales ? shiftToEdit.totalSales.toFixed(2) : ''}">
            </div>
            <div>
                <label for="inline-shift-cctips-${employeeId}-${date}">CC Tips (Optional):</label>
                <input type="number" id="inline-shift-cctips-${employeeId}-${date}" min="0" step="0.01" placeholder="0.00" value="${shiftToEdit && shiftToEdit.ccTips ? shiftToEdit.ccTips.toFixed(2) : ''}">
            </div>
            <div>
                <label for="inline-shift-cashtips-${employeeId}-${date}">Cash Tips (Optional):</label>
                <input type="number" id="inline-shift-cashtips-${employeeId}-${date}" min="0" step="0.01" placeholder="0.00" value="${shiftToEdit && shiftToEdit.cashTips ? shiftToEdit.cashTips.toFixed(2) : ''}">
            </div>
        </div>
        <div class="inline-form-actions">
            <button class="button save-inline-btn">${shiftToEdit ? 'Update Shift' : 'Save Shift'}</button>
            <button class="button cancel-inline-btn" style="background-color: #757575;">Cancel</button>
            ${shiftToEdit ? `<button class="button delete-inline-btn" style="background-color: var(--primary-red); margin-left: auto;">Delete Shift</button>` : ''}
        </div>
    `;
    targetFormContainer.innerHTML = formHTML;
    targetFormContainer.style.display = 'block'; // Make the form visible

    const toggleButton = listItemElement.querySelector('.worked-today-toggle-btn');
    if (toggleButton) {
        toggleButton.classList.add('is-editing-shift');
        toggleButton.textContent = shiftToEdit ? 'Editing Shift...' : 'Logging Shift...';
    }

    // Add event listeners for the new buttons
    targetFormContainer.querySelector('.save-inline-btn').addEventListener('click', () => saveInlineShift(employeeId, date, shiftToEdit ? shiftToEdit.id : null));
    targetFormContainer.querySelector('.cancel-inline-btn').addEventListener('click', () => cancelInlineShift(employeeId, date));
    if (shiftToEdit) {
        targetFormContainer.querySelector('.delete-inline-btn').addEventListener('click', () => {
            if (window.ui && typeof window.ui.showCustomModal === 'function') {
                window.ui.showCustomModal({
                    title: "Confirm Deletion",
                    message: `Are you sure you want to delete this shift for ${employee.name} on ${displayDate}?`,
                    type: "confirm",
                    confirmText: "Delete Shift",
                    onConfirm: () => {
                        if (window.state && typeof window.state.deleteShift === 'function') {
                            window.state.deleteShift(shiftToEdit.id, employeeId, date);
                            cancelInlineShift(employeeId, date); // Close form
                            // Re-render lineup to reflect deletion and update card
                            if (window.employees && typeof window.employees.renderEmployeeLineup === 'function') {
                                window.employees.renderEmployeeLineup(date); 
                            }
                            if (window.ui && typeof window.ui.showCustomModal === 'function') {
                                window.ui.showCustomModal({ title: "Success", message: "Shift deleted.", type: "info" });
                            }
                        } else {
                            console.error("state.deleteShift function not found.");
                            if (window.ui && typeof window.ui.showCustomModal === 'function') {
                                window.ui.showCustomModal({ title: "Error", message: "Could not delete shift. Function missing.", type: "error" });
                            }
                        }
                    },
                    showCancel: true
                });
            } else {
                // Fallback if modal not available
                if (confirm(`Delete shift for ${employee.name} on ${displayDate}?`)) {
                    if (window.state && typeof window.state.deleteShift === 'function') {
                        window.state.deleteShift(shiftToEdit.id, employeeId, date);
                        cancelInlineShift(employeeId, date);
                        if (window.employees && typeof window.employees.renderEmployeeLineup === 'function') {
                           window.employees.renderEmployeeLineup(date);
                        }
                    } else {
                        alert("Error: Delete function not available.");
                    }
                }
            }
        });
    }
     // Focus the first input
    const firstInput = targetFormContainer.querySelector('select, input');
    if (firstInput) {
        firstInput.focus();
    }
}


/**
 * Saves the shift data from the inline form.
 * @param {string} employeeId - The ID of the employee.
 * @param {string} date - The date of the shift.
 * @param {string|null} shiftId - The ID of the shift if editing, or null if new.
 */
function saveInlineShift(employeeId, date, shiftId = null) {
    const startTime = document.getElementById(`inline-shift-start-${employeeId}-${date}`).value;
    const endTime = document.getElementById(`inline-shift-end-${employeeId}-${date}`).value;
    const jobPositionId = document.getElementById(`inline-shift-job-${employeeId}-${date}`).value;
    const totalSales = document.getElementById(`inline-shift-sales-${employeeId}-${date}`).value;
    const ccTips = document.getElementById(`inline-shift-cctips-${employeeId}-${date}`).value;
    const cashTips = document.getElementById(`inline-shift-cashtips-${employeeId}-${date}`).value;

    // Basic validation
    if (!startTime || !endTime || !jobPositionId) {
        if(window.ui && typeof window.ui.showCustomModal === 'function') window.ui.showCustomModal({title: "Input Error", message: "Start time, end time, and job position are required.", type: "error"});
        else alert("Start time, end time, and job position are required.");
        return;
    }

    if (window.utils && window.utils.timeToMinutes(startTime) >= window.utils.timeToMinutes(endTime)) {
        if(window.ui && typeof window.ui.showCustomModal === 'function') window.ui.showCustomModal({title: "Input Error", message: "End time must be after start time.", type: "error"});
        else alert("End time must be after start time.");
        return;
    }

    const shiftData = {
        employeeId: employeeId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        jobPositionId: jobPositionId,
        totalSales: parseFloat(totalSales) || 0,
        ccTips: parseFloat(ccTips) || 0,
        cashTips: parseFloat(cashTips) || 0,
        id: shiftId // if null, state.logOrUpdateShift will generate one
    };

    let success = false;
    if (window.state && typeof window.state.logOrUpdateShift === 'function') {
        success = window.state.logOrUpdateShift(shiftData);
    } else {
        console.error("state.logOrUpdateShift function not found.");
        // Prioritize custom modal for this critical error
        if(window.ui && typeof window.ui.showCustomModal === 'function') {
            window.ui.showCustomModal({title: "Error", message: "Could not save shift. Required function missing.", type: "error"});
        } else {
            // Fallback to alert only if custom modal itself is broken, which is unlikely.
            alert("Critical Error: Could not save shift. State function missing AND custom modal unavailable.");
        }
    }

    if (success) {
        cancelInlineShift(employeeId, date); // Close form on successful save
        
        // Re-render the employee lineup for the current date to reflect changes
        if (window.employees && typeof window.employees.renderEmployeeLineup === 'function') {
            const appState = window.state.getAppState();
            window.employees.renderEmployeeLineup(appState.activeSelectedDate || date);
        }
        
        // Explicitly update the specific card that was just edited/added
        // This is a more targeted update than re-rendering the whole lineup,
        // but renderEmployeeLineup should also correctly update it.
        // However, renderEmployeeLineup might be slightly delayed or might re-create elements,
        // so a direct update here ensures immediate visual feedback on the correct card.
        const listItemElement = document.querySelector(`li[data-employee-id="${employeeId}"]`);
        const buttonElement = listItemElement ? listItemElement.querySelector('.worked-today-toggle-btn') : null;
        
        if (listItemElement && buttonElement && window.ui && typeof window.ui.updateEmployeeLineupCard === 'function') {
            // Fetch the latest shift data for this employee and date
            const updatedAppState = window.state.getAppState();
            let latestShiftData = null;
            if (updatedAppState.dailyShifts && updatedAppState.dailyShifts[date]) {
                latestShiftData = updatedAppState.dailyShifts[date].find(s => s.employeeId === employeeId && (shiftId ? s.id === shiftId : true));
                 // If it was a new shift, and multiple shifts are possible, this might need to be more specific
                 // For now, assume the last added/updated shift for that employee on that day is the relevant one if shiftId was null.
                 // If shiftId was provided, it will find that specific one.
                 if (!latestShiftData && !shiftId && updatedAppState.dailyShifts[date].length > 0) {
                    const empShifts = updatedAppState.dailyShifts[date].filter(s => s.employeeId === employeeId);
                    if (empShifts.length > 0) latestShiftData = empShifts[empShifts.length -1]; // get the last one for that employee
                 }
            }
            window.ui.updateEmployeeLineupCard(listItemElement, buttonElement, latestShiftData);
        }

        if (window.ui && typeof window.ui.showCustomModal === 'function') {
            window.ui.showCustomModal({title: "Success", message: `Shift ${shiftId ? 'updated' : 'logged'} successfully!`, type: "info"});
        }
    } 
    // If logOrUpdateShift shows its own modal for errors, we don't need another one here.
}

/**
 * Cancels the inline shift form, removing it from the DOM and resetting button states.
 * @param {string} employeeId - The ID of the employee.
 * @param {string} date - The date of the shift.
 * @param {boolean} [isClosingForOther=false] - True if this form is being closed because another is opening.
 */
function cancelInlineShift(employeeId, date, isClosingForOther = false) {
    // Find the specific form container using a more precise selector if IDs are date-specific
    const formContainer = document.querySelector(`.inline-shift-form-container[data-employee-id="${employeeId}"][data-date="${date}"]`);
    
    if (formContainer) {
        const listItemElement = formContainer.closest('li[data-employee-id]');
        formContainer.style.display = 'none'; // Hide it instead of removing, to preserve structure if needed
        formContainer.innerHTML = ''; // Clear its content
        delete formContainer.dataset.editingShiftId; // Clear editing state

        if (listItemElement) {
            const toggleButton = listItemElement.querySelector('.worked-today-toggle-btn');
            if (toggleButton) {
                toggleButton.classList.remove('is-editing-shift');
                // Update button text and summary based on whether shifts exist for this employee on this date
                // This requires fetching the shift state again.
                const appState = window.state.getAppState();
                let existingShift = null;
                if (appState.dailyShifts && appState.dailyShifts[date]) {
                    existingShift = appState.dailyShifts[date].find(s => s.employeeId === employeeId);
                }
                if (window.ui && typeof window.ui.updateEmployeeLineupCard === 'function') {
                    window.ui.updateEmployeeLineupCard(listItemElement, toggleButton, existingShift);
                } else {
                    // Fallback if ui.updateEmployeeLineupCard is not available
                    toggleButton.textContent = existingShift ? 'Edit Shift' : 'Log Shift';
                }
            }
        }
    }
    // If not closing for another form, and if the main lineup needs a general refresh, do it.
    // However, individual card updates should be sufficient.
    // if (!isClosingForOther && window.employees && typeof window.employees.renderEmployeeLineup === 'function') {
    //     const appState = window.state.getAppState();
    //     window.employees.renderEmployeeLineup(appState.activeSelectedDate || date);
    // }
}

// DOM Elements related to Shift Entry
const employeeSelectForShifts = document.getElementById('employeeSelect'); // Also used by employees.js
const positionsCheckboxesContainer = document.getElementById('positionsCheckboxes');
const payRateInputsContainer = document.getElementById('payRateInputsContainer');
const shiftDateInput = document.getElementById('shiftDate');
const shiftStartTimeInput = document.getElementById('shiftStartTime');
const shiftEndTimeInput = document.getElementById('shiftEndTime');
const breakDurationInput = document.getElementById('breakDuration');
const shiftTipsInput = document.getElementById('shiftTips');
const addShiftBtn = document.getElementById('addShiftBtn');
const updateShiftBtn = document.getElementById('updateShiftBtn');
const cancelUpdateShiftBtn = document.getElementById('cancelUpdateShiftBtn');
const shiftListUl = document.getElementById('shiftList');
const clearAllShiftsBtn = document.getElementById('clearAllShiftsBtn');
const currentEmployeeForShiftsDisplay = document.getElementById('currentEmployeeForShifts');

/**
 * Initializes shift entry functionalities and event listeners.
 */
function initializeShiftSection() {
    employeeSelectForShifts.addEventListener('change', handleEmployeeSelectionForShiftEntry);
    addShiftBtn.addEventListener('click', handleAddOrUpdateShift);
    updateShiftBtn.addEventListener('click', handleAddOrUpdateShift);
    cancelUpdateShiftBtn.addEventListener('click', cancelShiftUpdate);
    clearAllShiftsBtn.addEventListener('click', confirmClearAllShifts);

    shiftListUl.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-shift-btn') || event.target.closest('.edit-shift-btn')) {
            const button = event.target.classList.contains('edit-shift-btn') ? event.target : event.target.closest('.edit-shift-btn');
            const shiftId = button.dataset.shiftId;
            loadShiftForEditing(shiftId);
        }
        if (event.target.classList.contains('delete-shift-btn') || event.target.closest('.delete-shift-btn')) {
            const button = event.target.classList.contains('delete-shift-btn') ? event.target : event.target.closest('.delete-shift-btn');
            const shiftId = button.dataset.shiftId;
            confirmRemoveShift(shiftId);
        }
    });
    
    // Set default shift date to today
    shiftDateInput.value = formatDate(new Date(), 'YYYY-MM-DD');

    renderShiftEntryFormForSelectedEmployee(); // Initial render (likely empty)
    renderShiftList(); // Initial render of shifts for potentially selected employee or all
}

/**
 * Handles the selection of an employee in the shift entry form.
 */
function handleEmployeeSelectionForShiftEntry() {
    const selectedEmployeeId = employeeSelectForShifts.value;
    updateUiState('selectedEmployeeIdForShifts', selectedEmployeeId);
    updateUiState('editingShiftId', null); // Clear any ongoing edit
    resetShiftForm();
    renderShiftEntryFormForSelectedEmployee();
    renderShiftList(); // Update shift list for the newly selected employee
}

/**
 * Renders the position checkboxes and pay rate inputs based on the selected employee's defaults or global positions.
 */
function renderShiftEntryFormForSelectedEmployee() {
    const selectedEmployeeId = getUiState().selectedEmployeeIdForShifts;
    const employee = selectedEmployeeId ? getEmployeeById(selectedEmployeeId) : null;
    const allPositions = getPositions();

    positionsCheckboxesContainer.innerHTML = '';
    payRateInputsContainer.innerHTML = '';

    if (!selectedEmployeeId) {
        positionsCheckboxesContainer.innerHTML = '<p class="support-tip">Select an employee to enter their shift details.</p>';
        disableShiftFormFields(true); // Disable form fields if no employee selected
        currentEmployeeForShiftsDisplay.textContent = 'No One';
        return;
    }

    disableShiftFormFields(false);
    currentEmployeeForShiftsDisplay.textContent = employee ? employee.name : 'Selected Employee';

    if (allPositions.length === 0) {
        positionsCheckboxesContainer.innerHTML = '<p>No positions defined. <a href="#" onclick="openPositionManagementModal(); return false;">Manage Positions</a> first.</p>';
        return;
    }

    const positionsToDisplay = allPositions; // For now, show all positions

    positionsToDisplay.forEach(position => {
        const empDefaultPos = employee ? employee.defaultPositions.find(dp => dp.positionId === position.id) : null;
        const initialPayRate = empDefaultPos ? empDefaultPos.payRate : position.defaultPayRate;

        // Position Checkbox
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('checkbox-group'); // Use SCSS styling
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `shift-pos-check-${position.id}`;
        checkbox.dataset.positionId = position.id;
        checkbox.name = 'shiftPositions';
        checkbox.addEventListener('change', (e) => togglePayRateInputForPosition(position.id, e.target.checked, initialPayRate));
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = position.name;

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        positionsCheckboxesContainer.appendChild(checkboxDiv);

        // Pay Rate Input (initially hidden, shown on check)
        const payRateDiv = document.createElement('div');
        payRateDiv.id = `payrate-input-div-${position.id}`;
        payRateDiv.classList.add('pay-rate-input-wrapper'); // Reuse style from employee defaults if suitable
        payRateDiv.style.display = 'none'; // Hidden by default

        const payRateLabel = document.createElement('label');
        payRateLabel.htmlFor = `shift-payrate-${position.id}`;
        payRateLabel.textContent = `Pay Rate for ${position.name} ($/hr):`;
        payRateLabel.style.fontWeight = 'normal';
        payRateLabel.style.fontSize = '0.9em';

        const payRateInput = document.createElement('input');
        payRateInput.type = 'number';
        payRateInput.id = `shift-payrate-${position.id}`;
        payRateInput.dataset.positionId = position.id;
        payRateInput.placeholder = `Default: ${initialPayRate !== null ? formatCurrency(initialPayRate) : 'N/A'}`;
        payRateInput.value = initialPayRate !== null ? initialPayRate.toFixed(2) : '';
        payRateInput.min = "0";
        payRateInput.step = "0.01";
        payRateInput.classList.add('shift-position-payrate');

        payRateDiv.appendChild(payRateLabel);
        payRateDiv.appendChild(payRateInput);
        payRateInputsContainer.appendChild(payRateDiv);
    });
}

/**
 * Shows or hides the pay rate input for a given position when its checkbox is toggled.
 * @param {string} positionId - The ID of the position.
 * @param {boolean} isChecked - Whether the position checkbox is now checked.
 * @param {number|null} defaultRate - The default pay rate to populate if shown.
 */
function togglePayRateInputForPosition(positionId, isChecked, defaultRate) {
    const payRateDiv = document.getElementById(`payrate-input-div-${positionId}`);
    const payRateInput = document.getElementById(`shift-payrate-${positionId}`);
    if (payRateDiv) {
        payRateDiv.style.display = isChecked ? 'block' : 'none';
        if (isChecked && payRateInput && payRateInput.value === '') { // Populate if becoming visible and empty
             payRateInput.value = defaultRate !== null ? defaultRate.toFixed(2) : '';
        }
    }
}

/**
 * Disables or enables shift form fields.
 * @param {boolean} disabled - True to disable, false to enable.
 */
function disableShiftFormFields(disabled) {
    shiftDateInput.disabled = disabled;
    shiftStartTimeInput.disabled = disabled;
    shiftEndTimeInput.disabled = disabled;
    breakDurationInput.disabled = disabled;
    shiftTipsInput.disabled = disabled;
    addShiftBtn.disabled = disabled;
    // Checkboxes and their pay rate inputs are handled by their rendering logic (not shown if no employee)
}

/**
 * Handles adding or updating a shift based on the current form mode (new vs. edit).
 */
function handleAddOrUpdateShift() {
    const selectedEmployeeId = getUiState().selectedEmployeeIdForShifts;
    const editingShiftId = getUiState().editingShiftId;

    if (!selectedEmployeeId) {
        showToast("Please select an employee first.", "warning");
        return;
    }

    const shiftData = {
        employeeId: selectedEmployeeId,
        date: shiftDateInput.value,
        startTime: shiftStartTimeInput.value,
        endTime: shiftEndTimeInput.value,
        breakMinutes: parseInt(breakDurationInput.value) || 0,
        tips: parseFloat(shiftTipsInput.value) || 0,
        positions: [] // To be populated below
    };

    const checkedPositionCheckboxes = positionsCheckboxesContainer.querySelectorAll('input[type="checkbox"][name="shiftPositions"]:checked');
    if (checkedPositionCheckboxes.length === 0) {
        showToast("Please select at least one position for the shift.", "warning");
        return;
    }

    let allPayRatesValid = true;
    checkedPositionCheckboxes.forEach(checkbox => {
        const positionId = checkbox.dataset.positionId;
        const payRateInput = document.getElementById(`shift-payrate-${positionId}`);
        let payRate = null;
        if (payRateInput && payRateInput.value !== '') {
            const parsedRate = parseFloat(payRateInput.value);
            if (!isNaN(parsedRate) && parsedRate >= 0) {
                payRate = parsedRate;
            } else {
                showToast(`Invalid pay rate for position ${getPositionById(positionId)?.name}. Please correct it.`, "error");
                allPayRatesValid = false;
            }
        }
        shiftData.positions.push({ positionId: positionId, payRate: payRate });
    });

    if (!allPayRatesValid) return;

    if (!shiftData.date || !shiftData.startTime || !shiftData.endTime) {
        showToast("Shift date, start time, and end time are required.", "warning");
        return;
    }

    if (editingShiftId) {
        const updatedShift = updateShiftInState(editingShiftId, shiftData);
        if (updatedShift) {
            showToast("Shift updated successfully.", "success");
        }
    } else {
        const newShift = addShiftToState(shiftData);
        if (newShift) {
            showToast("Shift added successfully.", "success");
        }
    }

    resetShiftForm();
    renderShiftList();
    if (typeof renderTipPoolResults === "function") renderTipPoolResults(); // Update reports
    updateUiState('editingShiftId', null); // Exit edit mode
    addShiftBtn.style.display = 'inline-block';
    updateShiftBtn.style.display = 'none';
    cancelUpdateShiftBtn.style.display = 'none';
}

/**
 * Resets the shift entry form to its default state.
 */
function resetShiftForm() {
    shiftDateInput.value = formatDate(new Date(), 'YYYY-MM-DD'); // Default to today or last used date for convenience?
    shiftStartTimeInput.value = '';
    shiftEndTimeInput.value = '';
    breakDurationInput.value = '0';
    shiftTipsInput.value = '';

    // Uncheck all position checkboxes and hide pay rate inputs
    const positionCheckboxes = positionsCheckboxesContainer.querySelectorAll('input[type="checkbox"][name="shiftPositions"]');
    positionCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const positionId = checkbox.dataset.positionId;
        const payRateDiv = document.getElementById(`payrate-input-div-${positionId}`);
        if (payRateDiv) payRateDiv.style.display = 'none';
        const payRateInput = document.getElementById(`shift-payrate-${positionId}`);
        if (payRateInput) payRateInput.value = ''; // Clear pay rate input field
    });
    
    // If an employee is selected, re-render positions to reset their pay rates to defaults
    // This is important if a user changed a pay rate, then cleared the form without saving.
    if (getUiState().selectedEmployeeIdForShifts) {
        renderShiftEntryFormForSelectedEmployee();
    }

    updateUiState('editingShiftId', null);
    addShiftBtn.textContent = 'Add Shift';
    addShiftBtn.style.display = 'inline-block';
    updateShiftBtn.style.display = 'none';
    cancelUpdateShiftBtn.style.display = 'none';
    shiftTipsInput.placeholder = "0.00";
}

/**
 * Renders the list of shifts for the currently selected employee or all shifts if no employee is selected.
 */
function renderShiftList() {
    const selectedEmployeeId = getUiState().selectedEmployeeIdForShifts;
    const shiftsToDisplay = selectedEmployeeId ? getShiftsByEmployee(selectedEmployeeId) : getShifts(); // Show all if no one selected, or just for selected

    shiftListUl.innerHTML = ''; // Clear existing list

    if (shiftsToDisplay.length === 0) {
        const li = document.createElement('li');
        li.textContent = selectedEmployeeId ? 'No shifts recorded for this employee yet.' : 'No shifts recorded in the system yet.';
        li.classList.add('empty-list-placeholder');
        shiftListUl.appendChild(li);
    } else {
        // Sort shifts by date, then by start time (most recent first)
        shiftsToDisplay.sort((a, b) => {
            const dateComparison = new Date(b.date) - new Date(a.date);
            if (dateComparison !== 0) return dateComparison;
            // If dates are same, sort by start time (e.g., "09:00" vs "14:00")
            return (b.startTime || "").localeCompare(a.startTime || "");
        });

        shiftsToDisplay.forEach(shift => {
            const li = document.createElement('li');
            li.dataset.shiftId = shift.id;
            const employee = getEmployeeById(shift.employeeId); // Get employee for name display if showing all shifts
            const employeeName = employee ? employee.name : 'Unknown Employee';
            
            let positionNames = "N/A";
            if (shift.positions && shift.positions.length > 0) {
                positionNames = shift.positions.map(sp => {
                    const pos = getPositionById(sp.positionId);
                    let nameStr = pos ? pos.name : 'Unknown Position';
                    if (sp.payRate !== null) {
                        nameStr += ` (@ ${formatCurrency(sp.payRate)}/hr)`;
                    }
                    return nameStr;
                }).join(', ');
            }

            let shiftSummary = `<strong>${formatDate(shift.date, 'MM/DD/YYYY')}</strong>: ${shift.startTime} - ${shift.endTime}`;
            if (!selectedEmployeeId) { // If showing all shifts, prepend employee name
                shiftSummary = `<em>${employeeName}</em> - ${shiftSummary}`
            }
            shiftSummary += `, ${shift.hours.toFixed(2)} hrs`;
            if (shift.breakMinutes > 0) {
                shiftSummary += ` (${shift.breakMinutes} min break)`;
            }
            shiftSummary += `<br>Positions: ${positionNames}`;
            shiftSummary += `<br>Tips: ${formatCurrency(shift.tips)}`;

            const textSpan = document.createElement('span');
            textSpan.innerHTML = shiftSummary;

            const controlsDiv = document.createElement('div');
            controlsDiv.classList.add('shift-item-controls');

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.classList.add('button', 'button-small', 'edit-shift-btn');
            editBtn.dataset.shiftId = shift.id;
            editBtn.title = "Edit Shift";
            controlsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.classList.add('button', 'button-small', 'button-danger', 'delete-shift-btn');
            deleteBtn.dataset.shiftId = shift.id;
            deleteBtn.title = "Delete Shift";
            controlsDiv.appendChild(deleteBtn);

            li.appendChild(textSpan);
            li.appendChild(controlsDiv);
            shiftListUl.appendChild(li);
        });
    }
    clearAllShiftsBtn.disabled = getShifts().length === 0;
}

/**
 * Loads a shift's data into the form for editing.
 * @param {string} shiftId - The ID of the shift to edit.
 */
function loadShiftForEditing(shiftId) {
    const shift = appState.shifts.find(s => s.id === shiftId); // Access state directly for original object
    if (!shift) {
        showToast("Shift not found for editing.", "error");
        return;
    }

    // Ensure the correct employee is selected in the dropdown
    if (employeeSelectForShifts.value !== shift.employeeId) {
        employeeSelectForShifts.value = shift.employeeId;
        // Manually trigger change to update UI state and re-render position checkboxes for this employee
        handleEmployeeSelectionForShiftEntry(); 
    }
    updateUiState('selectedEmployeeIdForShifts', shift.employeeId); // Explicitly set, in case dropdown change didn't fire if already selected
    updateUiState('editingShiftId', shiftId);

    // Populate form fields (must be done AFTER employee selection might re-render checkboxes)
    // Use a slight delay if handleEmployeeSelectionForShiftEntry causes async re-render of checkboxes
    setTimeout(() => {
        shiftDateInput.value = shift.date;
        shiftStartTimeInput.value = shift.startTime;
        shiftEndTimeInput.value = shift.endTime;
        breakDurationInput.value = shift.breakMinutes;
        shiftTipsInput.value = shift.tips.toFixed(2);

        // Reset all position checkboxes and pay rates first
        const allPosCheckboxes = positionsCheckboxesContainer.querySelectorAll('input[type="checkbox"][name="shiftPositions"]');
        allPosCheckboxes.forEach(cb => {
            cb.checked = false;
            const posId = cb.dataset.positionId;
            const payRateDiv = document.getElementById(`payrate-input-div-${posId}`);
            if (payRateDiv) payRateDiv.style.display = 'none';
            const payRateInputEl = document.getElementById(`shift-payrate-${posId}`);
            if (payRateInputEl) payRateInputEl.value = ''; // Clear it
        });

        // Check and fill data for positions in the shift
        shift.positions.forEach(shiftPos => {
            const checkbox = positionsCheckboxesContainer.querySelector(`input[type="checkbox"][data-position-id="${shiftPos.positionId}"]`);
            const payRateInput = document.getElementById(`shift-payrate-${shiftPos.positionId}`);
            const payRateDiv = document.getElementById(`payrate-input-div-${shiftPos.positionId}`);

            if (checkbox) {
                checkbox.checked = true;
                if (payRateDiv) payRateDiv.style.display = 'block';
                if (payRateInput) {
                    payRateInput.value = shiftPos.payRate !== null ? shiftPos.payRate.toFixed(2) : '';
                }
            } else {
                console.warn(`Position checkbox not found for shift position ID: ${shiftPos.positionId}`);
            }
        });

        addShiftBtn.style.display = 'none';
        updateShiftBtn.style.display = 'inline-block';
        cancelUpdateShiftBtn.style.display = 'inline-block';
        updateShiftBtn.textContent = 'Update Shift';
        showToast("Editing shift. Make changes and click Update Shift.", "info");
        shiftDateInput.focus(); // Focus on the first field
    }, 50); // Small delay to ensure DOM is ready after potential re-render from employee select change
}

/**
 * Cancels the shift update process and resets the form.
 */
function cancelShiftUpdate() {
    resetShiftForm();
    updateUiState('editingShiftId', null);
    addShiftBtn.style.display = 'inline-block';
    updateShiftBtn.style.display = 'none';
    cancelUpdateShiftBtn.style.display = 'none';
    showToast("Shift update cancelled.", "info");
}

/**
 * Confirms and removes a specific shift.
 * @param {string} shiftId - The ID of the shift to remove.
 */
function confirmRemoveShift(shiftId) {
    setupConfirmationModal(
        "Confirm Delete Shift",
        "Are you sure you want to delete this shift? This action cannot be undone.",
        () => {
            removeShiftFromState(shiftId);
            renderShiftList();
            if (typeof renderTipPoolResults === "function") renderTipPoolResults(); // Update reports
            showToast("Shift deleted.", "success");
            // If this shift was being edited, reset form
            if (getUiState().editingShiftId === shiftId) {
                cancelShiftUpdate();
            }
        }
    );
}

/**
 * Confirms and clears all shifts for all employees.
 */
function confirmClearAllShifts() {
    if (getShifts().length === 0) {
        showToast("There are no shifts to clear.", "info");
        return;
    }
    setupConfirmationModal(
        "Confirm Clear All Shifts",
        "Are you sure you want to delete ALL shifts for ALL employees? This action cannot be undone.",
        () => {
            clearAllShiftsFromState();
            renderShiftList();
            if (typeof renderTipPoolResults === "function") renderTipPoolResults(); // Update reports
            showToast("All shifts have been cleared.", "success");
            cancelShiftUpdate(); // Reset form if anything was being edited
        }
    );
}

// Expose functions to the global window.shifts object
window.shifts = {
    renderShiftInlineForm,
    saveInlineShift,
    cancelInlineShift,
    // deleteShift, // If called directly from the form, might not need to be globally exposed
    // logShift // Internal, called by saveInlineShift which calls state.logOrUpdateShift
    initializeShiftFormsForDate: (date) => {
        // This function was previously in employees.js, intended to initialize all forms on lineup render.
        // With event delegation, explicit initialization of forms might not be needed in the same way.
        // However, it's crucial that `ui.updateEmployeeLineupCard` is called for each card
        // during `employees.renderEmployeeLineup` to set the correct initial button text and summary.
        // This function can be a no-op or removed if that covers the needs.
        // console.log(`shifts.initializeShiftFormsForDate called for ${date}, but may be redundant.`);
    }
};

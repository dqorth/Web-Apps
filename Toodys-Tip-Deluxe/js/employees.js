// filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toodys-Tip-Deluxe\js\employees.js
window.employees = (() => {
    // --- Scoped State Accessors ---
    function getAppState() {
        if (window.state && typeof window.state.getAppState === 'function') {
            const appStateFromStateManager = window.state.getAppState();
            // console.log("APP_LOG: [employees.js internal] Fetched appState. Employees:", appStateFromStateManager.employees.length);
            return appStateFromStateManager;
        }
        console.warn("[employees.js internal] CRITICAL: window.state.getAppState() is not available. Falling back.");
        return { employees: [], dailyShifts: {}, settings: {} }; // Safe fallback
    }

    function getJobPositions() {
        if (window.state && window.state.JOB_POSITIONS_AVAILABLE) {
            return window.state.JOB_POSITIONS_AVAILABLE;
        }
        console.warn("[employees.js internal] window.state.JOB_POSITIONS_AVAILABLE not found.");
        return []; // Safe fallback
    }

    // --- Employee Form and Position Rendering ---
    function renderEmpPositionsWithPayRates(containerEl, existingRates = {}) {
        const JOB_POSITIONS_AVAILABLE = getJobPositions();
        if (!containerEl) {
            console.error('[employees.js] Position containerEl not found for renderEmpPositionsWithPayRates');
            return;
        }
        containerEl.innerHTML = ''; // Clear previous positions

        JOB_POSITIONS_AVAILABLE.forEach(position => {
            const positionEntry = document.createElement('div');
            positionEntry.classList.add('position-entry-group');

            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('role-toggle-btn');
            button.dataset.position = position.id;
            button.textContent = position.name;
            
            const payRateWrapper = document.createElement('div');
            payRateWrapper.classList.add('pay-rate-input-wrapper');
            payRateWrapper.style.display = 'none';

            const payRateLabel = document.createElement('label');
            payRateLabel.setAttribute('for', `payRate-${position.id}`);
            payRateLabel.textContent = `Hourly Rate for ${position.name}:`;
            
            const payRateInput = document.createElement('input');
            payRateInput.type = 'number';
            payRateInput.id = `payRate-${position.id}`;
            payRateInput.dataset.position = position.id;
            payRateInput.min = "0";
            payRateInput.step = "0.01";
            payRateInput.placeholder = "e.g., 15.50";
            payRateInput.value = existingRates[position.id] !== undefined 
                ? parseFloat(existingRates[position.id]).toFixed(2) 
                : (position.defaultRate !== undefined ? parseFloat(position.defaultRate).toFixed(2) : '0.00');

            payRateWrapper.appendChild(payRateLabel);
            payRateWrapper.appendChild(payRateInput);
            
            positionEntry.appendChild(button);
            positionEntry.appendChild(payRateWrapper);
            containerEl.appendChild(positionEntry);

            button.addEventListener('click', () => {
                button.classList.toggle('selected-role');
                payRateWrapper.style.display = button.classList.contains('selected-role') ? 'block' : 'none';
            });

            if (existingRates[position.id] !== undefined) {
                button.classList.add('selected-role');
                payRateWrapper.style.display = 'block';
            }
        });
    }

    function populateFormForEdit(employeeId) {
        const appState = getAppState();
        const employee = appState.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            if (typeof showCustomModal === 'function') showCustomModal('Employee not found.');
            else console.error('[employees.js] Employee not found for edit:', employeeId);
            return;
        }

        document.getElementById('empName').value = employee.name;
        document.getElementById('editingEmployeeId').value = employeeId;

        const positionsContainerEl = document.getElementById('empPositionsContainer');
        if (positionsContainerEl) {
            renderEmpPositionsWithPayRates(positionsContainerEl, employee.positions);
        } else {
            console.error("[employees.js] 'empPositionsContainer' not found for populating form.");
        }

        document.getElementById('addEmployeeBtn').style.display = 'none';
        document.getElementById('updateEmployeeBtn').style.display = 'inline-block';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        
        if (window.ui && typeof window.ui.showEmployeeFormView === 'function') {
            window.ui.showEmployeeFormView(); // Manages overall view switching
        } else {
            console.warn("[employees.js] ui.showEmployeeFormView() not available to populateFormForEdit.");
            // Fallback to ensure form is visible if UI module call fails
            const formWrapper = document.getElementById('addEmployeeFormWrapper');
            if (formWrapper) formWrapper.style.display = 'block';
            const toggleButton = document.getElementById('toggleAddNewEmployeeFormBtn');
            if (toggleButton) toggleButton.textContent = 'Cancel Editing';
        }
    }
    
    function resetEmployeeForm() {
        document.getElementById('empName').value = '';
        document.getElementById('editingEmployeeId').value = '';
        const positionsContainerEl = document.getElementById('empPositionsContainer');
        if (positionsContainerEl) {
            // Re-render with no existing rates, effectively clearing and resetting to defaults
            renderEmpPositionsWithPayRates(positionsContainerEl, {});
        }
        document.getElementById('addEmployeeBtn').style.display = 'inline-block';
        document.getElementById('updateEmployeeBtn').style.display = 'none';
        document.getElementById('cancelEditBtn').style.display = 'none';
        
        // Also reset the file input for import
        const importFileInput = document.getElementById('employeeImportFile');
        if (importFileInput) importFileInput.value = ''; // Clears the selected file
        const importFileNameSpan = document.getElementById('importFileName');
        if (importFileNameSpan) importFileNameSpan.textContent = 'No file chosen';
        const importStatusMessages = document.getElementById('importStatusMessages');
        if (importStatusMessages) importStatusMessages.innerHTML = '';

        // Ensure the "Add New Jukebox Hero" button text is reset if it was changed to "Cancel Editing"
        const toggleButton = document.getElementById('toggleAddNewEmployeeFormBtn');
        if (toggleButton && typeof window.ui !== 'undefined' && typeof window.ui.showEmployeeListView === 'function') { // Check if it's in edit mode
             // This check is a bit indirect. Better to manage button text in ui.js
        }
    }


    // --- CUD Operations for Employees ---
    function handleAddOrUpdateEmployee(isUpdate = false) {
        const name = document.getElementById('empName').value.trim();
        const editingId = document.getElementById('editingEmployeeId').value;
        
        if (!name) {
            alert('Employee name cannot be blank.');
            return null;
        }

        const selectedPositions = {};
        console.log("APP_LOG: [employees.js] Querying for selected role buttons in #empPositionsContainer:", document.querySelectorAll('#empPositionsContainer .role-toggle-btn.selected-role'));
        document.querySelectorAll('#empPositionsContainer .role-toggle-btn.selected-role').forEach(btn => {
            const role = btn.dataset.position; // CORRECTED: Was btn.dataset.role, changed to btn.dataset.position
            console.log(`APP_LOG: [employees.js] Processing selected role button. data-position found: '${role}'`, btn);

            if (role && role.trim() !== "") {
                const payRateInput = document.getElementById(`payRate-${role}`);
                if (payRateInput) {
                    if (payRateInput.value && payRateInput.value.trim() !== "") {
                        const payRate = parseFloat(payRateInput.value);
                        selectedPositions[role] = isNaN(payRate) ? 0 : payRate;
                        console.log(`APP_LOG: [employees.js] Role '${role}' has pay rate '${payRateInput.value}', parsed to: ${selectedPositions[role]}`);
                    } else {
                        selectedPositions[role] = 0;
                        console.log(`APP_LOG: [employees.js] Role '${role}' selected, but pay rate input is empty. Defaulting to 0.`);
                    }
                } else {
                    selectedPositions[role] = 0; // Should not happen if form is structured correctly
                    console.warn(`APP_LOG: [employees.js] Role '${role}' selected, but pay rate input #payRate-${role} NOT FOUND. Defaulting to 0.`);
                }
            } else {
                console.warn("APP_LOG: [employees.js] A selected role button is missing 'data-position' attribute or it's empty/undefined. Skipping this button.", btn);
            }
        });
        console.log("APP_LOG: [employees.js] Final collected selectedPositions before creating employeeData:", JSON.stringify(selectedPositions));


        if (Object.keys(selectedPositions).length === 0 && !isUpdate) { // For new employees, a position must be selected. For updates, they might be unselecting all.
            alert('Please select at least one position for the new employee.');
            return null;
        }

        let success = false;
        const appState = getAppState(); // Fetch current app state

        const employeeData = {
            id: isUpdate ? editingId : null, 
            name: name,
            positions: selectedPositions, // This will now have more detailed logging
            active: true 
        };

        if (isUpdate) {
            // Logic for updating an existing employee
            if (window.state && typeof window.state.updateEmployee === 'function') {
                window.state.updateEmployee(employeeData.id, { name: employeeData.name, positions: employeeData.positions });
                success = true;
                // if (typeof showCustomModal === 'function') showCustomModal('Employee updated!', 'success');
                console.log("APP_LOG: Employee updated:", employeeData);
            } else {
                 console.error("[employees.js] window.state.updateEmployee is not a function");
                 // if (typeof showCustomModal === 'function') showCustomModal('Error updating employee. State function missing.', 'error');
            }
        } else {
            // Logic for adding a new employee
            if (appState.employees.some(emp => emp.name.toLowerCase() === name.toLowerCase())) {
                alert(`An employee named "${name}" already exists.`);
                return; 
            }
            
            // Assign the id using window.utils.generateId for new employees
            employeeData.id = window.utils.generateId(); 

            if (window.state && typeof window.state.addEmployee === 'function') {
                window.state.addEmployee(employeeData); 
                success = true;
                console.log("APP_LOG: [employees.js] Employee added with data:", JSON.stringify(employeeData));
            } else {
                console.error("[employees.js] window.state.addEmployee is not a function");
                // if (typeof showCustomModal === 'function') showCustomModal('Error adding employee. State function missing.', 'error');
            }
        }
        
        if (success) {
            renderFullEmployeeListForManagement(); 
            if (window.main && typeof window.main.getSelectedDate === 'function') {
                 const selectedDate = window.main.getSelectedDate();
                 console.log("APP_LOG: [employees.js] Rendering lineup for date:", selectedDate);
                 renderEmployeeLineup(selectedDate);
            } else {
                 const fallbackDate = new Date().toISOString().split('T')[0];
                 console.log("APP_LOG: [employees.js] Rendering lineup for fallback date:", fallbackDate);
                 renderEmployeeLineup(fallbackDate);
            }
            resetEmployeeForm();
            // UI module should handle view switching (e.g., back to list or hide form)
            if (window.ui && typeof window.ui.showEmployeeListView === 'function') {
                 // window.ui.showEmployeeListView(); // Or ui.toggleAddEmployeeFormVisibility(false);
            }
        }
    }

    function performDeletion(employeeId) {
        if (window.state && typeof window.state.removeEmployee === 'function') {
            window.state.removeEmployee(employeeId);
            renderFullEmployeeListForManagement();
             if (window.main && typeof window.main.getSelectedDate === 'function') {
                 renderEmployeeLineup(window.main.getSelectedDate());
            } else {
                 renderEmployeeLineup(new Date().toISOString().split('T')[0]);
            }
            if (typeof showCustomModal === 'function') showCustomModal('Employee deleted.', 'success');
        } else {
            console.error("[employees.js] window.state.removeEmployee is not a function");
            if (typeof showCustomModal === 'function') showCustomModal('Error deleting employee. State function missing.', 'error');
        }
    }

    function handleDeleteEmployee(employeeId, employeeName) {
        if (typeof showCustomModal !== 'function') {
            if (confirm(`Delete ${employeeName}? This is a fallback confirmation.`)) {
                performDeletion(employeeId);
            }
            return;
        }
        showCustomModal(
            `Delete ${employeeName}? This cannot be undone.`, 'warning',
            [
                { text: 'Cancel', class: 'button secondary', action: (modal) => modal.hide() },
                { text: 'Delete Hero', class: 'button delete', action: (modal) => { modal.hide(); performDeletion(employeeId); } }
            ]
        );
    }

    // --- Roster and Lineup Rendering ---
    function renderEmployeeLineup(providedDate) { // Expects date as YYYY-MM-DD string
        let date = providedDate;
        const appStateForDateCheck = getAppState(); // Use existing local accessor

        if (!date) {
            console.warn("[employees.js] renderEmployeeLineup called without a date. Attempting to use activeSelectedDate from state.");
            if (appStateForDateCheck && appStateForDateCheck.activeSelectedDate) {
                date = appStateForDateCheck.activeSelectedDate;
                console.log(`[employees.js] Using activeSelectedDate from state: ${date}`);
            } else {
                // Fallback to today if activeSelectedDate is also not available
                if (window.utils && typeof window.utils.formatDate === 'function') {
                    date = window.utils.formatDate(new Date());
                    console.warn(`[employees.js] activeSelectedDate not found in state. Defaulting to today: ${date}. This might lead to incorrect display.`);
                } else {
                    // Absolute fallback if utils not ready (should not happen in normal flow)
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    date = `${yyyy}-${mm}-${dd}`;
                    console.warn(`[employees.js] activeSelectedDate and utils.formatDate not available. Defaulting to today (${date}) using basic formatting.`);
                }
            }
        }

        const appState = appStateForDateCheck; // Use the already fetched appState
        const rosterListContainer = document.getElementById('rosterListContainer');

        // console.log(`[employees.js] renderEmployeeLineup for date: ${date}. Employees in state: ${appState.employees.length}`);

        if (!rosterListContainer) {
            console.error("[employees.js] Roster list container 'rosterListContainer' not found.");
            return;
        }
        rosterListContainer.innerHTML = ''; 

        if (!appState.employees || appState.employees.length === 0) {
            rosterListContainer.innerHTML = '<p>No Jukebox Heroes on the roster yet. Add some!</p>';
            return;
        }

        const sortedEmployees = [...appState.employees].sort((a, b) => a.name.localeCompare(b.name));
        const JOB_POSITIONS_AVAILABLE = getJobPositions();
        const employeesByPosition = {};
        JOB_POSITIONS_AVAILABLE.forEach(pos => {
            employeesByPosition[pos.id] = { name: pos.name, employees: [] };
        });

        sortedEmployees.forEach(employee => {
            Object.keys(employee.positions).forEach(posId => {
                if (employeesByPosition[posId]) {
                    employeesByPosition[posId].employees.push(employee);
                }
            });
        });
        
        let contentAdded = false;
        for (const positionId in employeesByPosition) {
            const positionGroup = employeesByPosition[positionId];
            if (positionGroup.employees.length > 0) {
                contentAdded = true;
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('roster-position-group');
                
                const header = document.createElement('h4');
                header.classList.add('position-group-header-roster');
                header.textContent = positionGroup.name;
                groupDiv.appendChild(header);

                const ul = document.createElement('ul');
                ul.classList.add('item-list', 'employee-lineup-list');
                positionGroup.employees.forEach(employee => {
                    const li = document.createElement('li');
                    li.dataset.employeeId = employee.id;

                    const infoDiv = document.createElement('div');
                    infoDiv.classList.add('employee-info');
                    infoDiv.innerHTML = `<strong>${employee.name}</strong>`;
                    
                    // Create shift summary display area (initially empty)
                    const summaryDiv = document.createElement('div');
                    summaryDiv.classList.add('shift-summary-display');
                    summaryDiv.style.display = 'none'; // Initially hidden

                    const shiftFormContainer = document.createElement('div');
                    shiftFormContainer.classList.add('inline-shift-form-container');
                    // Unique ID for the form container, though might not be strictly necessary if targeting via dataset
                    shiftFormContainer.id = `shift-form-${date}-${employee.id}-${positionId}`;
                    shiftFormContainer.style.display = 'none';

                    const addShiftBtn = document.createElement('button');
                    // Use 'worked-today-toggle-btn' as it's expected by shifts.js and ui.js
                    addShiftBtn.classList.add('button', 'worked-today-toggle-btn', 'small-action-btn');
                    // Initial text will be set by updateEmployeeLineupCard
                    addShiftBtn.dataset.employeeId = employee.id;
                    addShiftBtn.dataset.positionId = positionId; // Store positionId for context if needed
                    addShiftBtn.dataset.date = date; 

                    li.appendChild(infoDiv);
                    li.appendChild(summaryDiv); // Add summary div before the button
                    li.appendChild(addShiftBtn);
                    li.appendChild(shiftFormContainer);
                    ul.appendChild(li);

                    // Get existing shift data for this employee and date to set initial card state
                    let existingShift = null;
                    if (appState.dailyShifts && appState.dailyShifts[date]) {
                        existingShift = appState.dailyShifts[date].find(s => s.employeeId === employee.id);
                        // If multiple shifts per day per employee are possible, this logic might need refinement
                        // For now, assume one shift entry in the lineup card context, or the first one found.
                    }
                    if (window.ui && typeof window.ui.updateEmployeeLineupCard === 'function') {
                        window.ui.updateEmployeeLineupCard(li, addShiftBtn, existingShift);
                    } else {
                        // Fallback if ui.updateEmployeeLineupCard is not available
                        addShiftBtn.textContent = existingShift ? 'Edit Shift' : 'Log Shift';
                        if (existingShift) {
                            summaryDiv.innerHTML = `Worked: ${window.utils.formatTimeTo12Hour(existingShift.startTime)} - ${window.utils.formatTimeTo12Hour(existingShift.endTime)} (${existingShift.hoursWorked.toFixed(2)} hrs) as ${JOB_POSITIONS_AVAILABLE.find(p => p.id === existingShift.jobPositionId)?.name || existingShift.jobPositionId}`;
                            summaryDiv.style.display = 'block';
                            li.classList.add('has-shift-logged');
                        } else {
                            summaryDiv.style.display = 'none';
                            li.classList.remove('has-shift-logged');
                        }
                    }
                });
                groupDiv.appendChild(ul);
                rosterListContainer.appendChild(groupDiv);
            }
        }
        if (!contentAdded) {
             rosterListContainer.innerHTML = '<p>No Jukebox Heroes assigned to roles for lineup. Manage roles in roster section.</p>';
        }
        
        if (window.shifts && typeof window.shifts.initializeShiftFormsForDate === 'function') {
            window.shifts.initializeShiftFormsForDate(date);
        } else {
            // console.warn("[employees.js] shifts.initializeShiftFormsForDate() not available for lineup.");
        }
    }

    function renderFullEmployeeListForManagement() {
        const appState = getAppState();
        const JOB_POSITIONS_AVAILABLE = getJobPositions();
        const container = document.getElementById('fullEmployeeRosterContainer');

        if (!container) {
            console.error("[employees.js] Container 'fullEmployeeRosterContainer' not found.");
            return;
        }
        container.innerHTML = '';

        if (!appState.employees || appState.employees.length === 0) {
            container.innerHTML = '<p>No Jukebox Heroes. Click "Add New Jukebox Hero" to start!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('item-list');
        const sortedEmployees = [...appState.employees].sort((a, b) => a.name.localeCompare(b.name));

        sortedEmployees.forEach(employee => {
            const li = document.createElement('li');
            li.dataset.employeeId = employee.id;

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('employee-info');
            let positionsHTML = '<div class="roster-positions"><strong>Roles:</strong> ';
            const empPositions = [];
            if (employee.positions && Object.keys(employee.positions).length > 0) {
                for (const posId in employee.positions) {
                    const positionDetails = JOB_POSITIONS_AVAILABLE.find(p => p.id === posId);
                    const rate = employee.positions[posId];
                    if (positionDetails) {
                        empPositions.push(`${positionDetails.name} ($${parseFloat(rate).toFixed(2)}/hr)`);
                    } else {
                        empPositions.push(`Unknown Role (${posId}) ($${parseFloat(rate).toFixed(2)}/hr)`);
                    }
                }
                positionsHTML += empPositions.join(', ') || 'N/A';
            } else {
                positionsHTML += 'No roles assigned';
            }
            positionsHTML += '</div>';
            infoDiv.innerHTML = `<strong>${employee.name}</strong>${positionsHTML}`;

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('employee-actions');

            const editButton = document.createElement('button');
            editButton.classList.add('button', 'edit-btn', 'small-action-btn');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                populateFormForEdit(employee.id); // Calls internal populateFormForEdit
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('button', 'delete-btn', 'small-action-btn');
            deleteButton.style.backgroundColor = 'var(--warning-red)';
            deleteButton.textContent = 'X';
            deleteButton.addEventListener('click', () => handleDeleteEmployee(employee.id, employee.name));

            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    // --- Public API ---
    return {
        // State Accessors (primarily for internal use or debugging, state module is main source)
        // getAppState, // Not typically exposed if state module handles it
        // getJobPositions, // Same as above

        // Form Management
        renderEmpPositionsWithPayRates, // Used by ui.js to build the form initially
        populateFormForEdit,          // Called by edit buttons
        resetEmployeeForm,            // Called by ui.js or cancel buttons

        // CUD Operations (called by form buttons)
        handleAddOrUpdateEmployee,    // Public handler for add/update
        handleDeleteEmployee,         // Public handler for delete

        // Roster and Lineup Rendering
        renderEmployeeLineup,         // Called by main.js and ui.js
        renderFullEmployeeListForManagement, // Called by ui.js and internally
        
        // Event Handlers (if any need to be directly called from other modules, though usually internal or via main.js)
        // handleFileImport, // Example if it were public
    };
})();

// DOM Elements related to Employee Roster
const employeeNameInput = document.getElementById('employeeName');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const employeeListUl = document.getElementById('employeeList');
const clearRosterBtn = document.getElementById('clearRosterBtn');
const loadRosterBtn = document.getElementById('loadRosterBtn');
const saveRosterBtn = document.getElementById('saveRosterBtn');
const rosterFileInput = document.getElementById('rosterFileInput');

const defaultPositionsContainer = document.getElementById('defaultPositionsContainer');
const saveDefaultPositionsBtn = document.getElementById('saveDefaultPositionsBtn');

const employeeSelectForShifts = document.getElementById('employeeSelect'); // For shift entry section

/**
 * Initializes employee-related functionalities and event listeners.
 */
function initializeEmployeeSection() {
    addEmployeeBtn.addEventListener('click', handleAddEmployee);
    clearRosterBtn.addEventListener('click', handleClearRoster);
    saveRosterBtn.addEventListener('click', handleSaveRoster);
    loadRosterBtn.addEventListener('click', () => rosterFileInput.click());
    rosterFileInput.addEventListener('change', handleLoadRosterFile);
    saveDefaultPositionsBtn.addEventListener('click', handleSaveDefaultPositionsForSelectedEmployee);

    employeeListUl.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-employee-btn')) {
            const employeeId = event.target.dataset.employeeId;
            confirmRemoveEmployee(employeeId);
        }
        if (event.target.classList.contains('edit-employee-btn')) {
            const employeeId = event.target.dataset.employeeId;
            handleEditEmployeeName(employeeId);
        }
        // If a list item (or its child) is clicked, select that employee for default position editing
        const listItem = event.target.closest('li[data-employee-id]');
        if (listItem) {
            const employeeId = listItem.dataset.employeeId;
            selectEmployeeForDefaultPositionEditing(employeeId);
        }
    });

    renderEmployeeList();
    populateEmployeeDropdown();
    // Initially, no employee is selected for default position editing, so clear/disable that section
    renderDefaultPositionsForSelectedEmployee(null); 
}

/**
 * Handles adding a new employee.
 */
function handleAddEmployee() {
    const name = employeeNameInput.value.trim();
    if (name) {
        const newEmployee = addEmployeeToState(name);
        if (newEmployee) {
            renderEmployeeList();
            populateEmployeeDropdown();
            employeeNameInput.value = ''; // Clear input
            showToast(`Employee "${name}" added.`, 'success');
            selectEmployeeForDefaultPositionEditing(newEmployee.id); // Select new employee for default pos editing
        }
    } else {
        showToast('Please enter an employee name.', 'warning');
    }
}

/**
 * Renders the list of employees in the UI.
 */
function renderEmployeeList() {
    const employees = getEmployees();
    employeeListUl.innerHTML = ''; // Clear existing list

    if (employees.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No employees in the roster yet.';
        li.classList.add('empty-list-placeholder');
        employeeListUl.appendChild(li);
    } else {
        employees.forEach(employee => {
            const li = document.createElement('li');
            li.dataset.employeeId = employee.id;
            li.classList.add('employee-list-item');
            if (appState.ui.selectedEmployeeIdForDefaultPos === employee.id) {
                li.classList.add('selected');
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = employee.name;
            nameSpan.classList.add('employee-name-display');
            li.appendChild(nameSpan);

            const controlsDiv = document.createElement('div');
            controlsDiv.classList.add('employee-item-controls');

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.classList.add('button', 'button-small', 'edit-employee-btn');
            editBtn.dataset.employeeId = employee.id;
            editBtn.title = "Edit Name";
            controlsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.classList.add('button', 'button-small', 'button-danger', 'delete-employee-btn');
            deleteBtn.dataset.employeeId = employee.id;
            deleteBtn.title = "Delete Employee";
            controlsDiv.appendChild(deleteBtn);
            
            li.appendChild(controlsDiv);
            employeeListUl.appendChild(li);
        });
    }
    // Update visibility of roster controls based on whether there are employees
    clearRosterBtn.disabled = employees.length === 0;
    saveRosterBtn.disabled = employees.length === 0;
}

/**
 * Handles editing an employee's name.
 * @param {string} employeeId - The ID of the employee to edit.
 */
function handleEditEmployeeName(employeeId) {
    const employee = getEmployeeById(employeeId);
    if (!employee) return;

    const newName = prompt("Enter new name for " + employee.name + ":", employee.name);
    if (newName && newName.trim() !== '' && newName.trim() !== employee.name) {
        const updatedEmployee = updateEmployeeInState(employeeId, { name: newName.trim() });
        if (updatedEmployee) {
            renderEmployeeList();
            populateEmployeeDropdown(); // Update dropdowns if name changed
            showToast(`Employee name updated to "${updatedEmployee.name}".`, 'success');
        }
    } else if (newName !== null) { // User didn't cancel but entered same or empty name
        showToast('Employee name not changed.', 'info');
    }
}

/**
 * Confirms and removes an employee.
 * @param {string} employeeId - The ID of the employee to remove.
 */
function confirmRemoveEmployee(employeeId) {
    const employee = getEmployeeById(employeeId);
    if (!employee) return;

    setupConfirmationModal(
        "Confirm Delete Employee",
        `Are you sure you want to delete "${employee.name}"? All their shifts will also be removed.`,
        () => {
            removeEmployeeFromState(employeeId);
            renderEmployeeList();
            populateEmployeeDropdown();
            // If the deleted employee was selected for default position editing, clear that section
            if (appState.ui.selectedEmployeeIdForDefaultPos === employeeId) {
                appState.ui.selectedEmployeeIdForDefaultPos = null;
                renderDefaultPositionsForSelectedEmployee(null);
            }
            // If the deleted employee was selected for shift entry, reset that selection
            if (getUiState().selectedEmployeeIdForShifts === employeeId) {
                updateUiState('selectedEmployeeIdForShifts', null);
                employeeSelectForShifts.value = '';
                renderShiftEntryFormForSelectedEmployee(); // This function is in shifts.js
            }
            showToast(`Employee "${employee.name}" and their shifts have been removed.`, 'success');
        }
    );
}

/**
 * Handles clearing the entire employee roster.
 */
function handleClearRoster() {
    if (getEmployees().length === 0) {
        showToast("Roster is already empty.", "info");
        return;
    }
    setupConfirmationModal(
        "Confirm Clear Roster",
        "Are you sure you want to clear the entire employee roster? This will also remove ALL shifts for ALL employees.",
        () => {
            clearEmployeeRosterState();
            renderEmployeeList();
            populateEmployeeDropdown();
            renderDefaultPositionsForSelectedEmployee(null); // Clear default positions section
            updateUiState('selectedEmployeeIdForShifts', null); // Clear shift entry employee selection
            if (typeof renderShiftList === "function") renderShiftList(); // In shifts.js
            if (typeof renderTipPoolResults === "function") renderTipPoolResults(); // In reports.js
            showToast("Employee roster and all shifts cleared.", "success");
        }
    );
}

/**
 * Populates the employee selection dropdown in the Shift Entry section.
 */
function populateEmployeeDropdown() {
    const employees = getEmployees();
    const selectedEmployeeId = getUiState().selectedEmployeeIdForShifts; // Persist selection if possible

    clearSelectOptions(employeeSelectForShifts);
    addOptionToSelect(employeeSelectForShifts, '--Select Employee--', '');

    employees.forEach(employee => {
        addOptionToSelect(employeeSelectForShifts, employee.name, employee.id, employee.id === selectedEmployeeId);
    });
    employeeSelectForShifts.disabled = employees.length === 0;
}

/**
 * Handles saving the current roster to a JSON file.
 */
function handleSaveRoster() {
    const employees = getEmployees();
    if (employees.length === 0) {
        showToast("Roster is empty. Nothing to save.", "info");
        return;
    }
    const dataStr = JSON.stringify({ employees: employees, positions: getPositions() }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_roster.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Roster saved to employee_roster.json", "success");
}

/**
 * Handles loading a roster from a selected JSON file.
 * @param {Event} event - The file input change event.
 */
function handleLoadRosterFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.employees && Array.isArray(data.employees)) {
                    setupConfirmationModal(
                        "Confirm Load Roster",
                        "Loading this roster will replace current employees and their default positions. Associated shifts will NOT be loaded from this file. Proceed?",
                        () => {
                            // Clear existing employees before loading new ones
                            // Keep existing positions, but merge/update from file if provided
                            if (data.positions && Array.isArray(data.positions)) {
                                data.positions.forEach(filePos => {
                                    const existingPos = appState.positions.find(p => p.id === filePos.id || p.name.toLowerCase() === filePos.name.toLowerCase());
                                    if (existingPos) {
                                        updatePositionInState(existingPos.id, { ...existingPos, ...filePos, id: existingPos.id });
                                    } else {
                                        addPositionToState(filePos.name, filePos.defaultPayRate);
                                    }
                                });
                            }

                            // Replace employees
                            appState.employees = []; // Clear current employees
                            data.employees.forEach(emp => {
                                // Basic validation/sanitization for loaded employee data
                                const newEmp = {
                                    id: emp.id || generateUniqueId('emp_'),
                                    name: emp.name || 'Unnamed Employee',
                                    defaultPositions: Array.isArray(emp.defaultPositions) ? emp.defaultPositions.map(dp => ({
                                        positionId: dp.positionId,
                                        // Ensure payRate is a number or null
                                        payRate: (dp.payRate !== null && !isNaN(parseFloat(dp.payRate))) ? parseFloat(dp.payRate) : null
                                    })) : []
                                };
                                // Ensure all positionIds in defaultPositions actually exist in appState.positions
                                newEmp.defaultPositions = newEmp.defaultPositions.filter(dp => getPositionById(dp.positionId));
                                appState.employees.push(newEmp);
                            });
                            
                            saveState();
                            renderEmployeeList();
                            populateEmployeeDropdown();
                            renderAllPositionsInManagementModal(); // in ui.js, to reflect new/updated positions
                            renderDefaultPositionsForSelectedEmployee(null); // Clear default position editor
                            showToast("Roster loaded successfully.", "success");
                        }
                    );
                } else {
                    showToast("Invalid roster file format. Expected { employees: [...] }.", "error");
                }
            } catch (error) {
                console.error("Error parsing roster file:", error);
                showToast("Error reading or parsing roster file.", "error");
            }
            rosterFileInput.value = ''; // Reset file input
        };
        reader.readAsText(file);
    }
}

// --- Default Positions for Employees ---

/**
 * Selects an employee for editing their default positions.
 * @param {string | null} employeeId - The ID of the employee to select, or null to clear selection.
 */
function selectEmployeeForDefaultPositionEditing(employeeId) {
    appState.ui.selectedEmployeeIdForDefaultPos = employeeId;
    // Re-render employee list to highlight selection
    const employeeListItems = employeeListUl.querySelectorAll('li.employee-list-item');
    employeeListItems.forEach(item => {
        if (item.dataset.employeeId === employeeId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    renderDefaultPositionsForSelectedEmployee(employeeId);
}

/**
 * Renders the checkboxes and pay rate inputs for an employee's default positions.
 * @param {string | null} employeeId - The ID of the employee whose default positions are to be rendered.
 *                                    If null, clears the section.
 */
function renderDefaultPositionsForSelectedEmployee(employeeId) {
    defaultPositionsContainer.innerHTML = '';
    const allPositions = getPositions();
    const employee = employeeId ? getEmployeeById(employeeId) : null;

    if (!employee) {
        defaultPositionsContainer.innerHTML = '<p class="support-tip">Select an employee from the roster to set their default positions and pay rates.</p>';
        saveDefaultPositionsBtn.disabled = true;
        return;
    }

    saveDefaultPositionsBtn.disabled = false;
    defaultPositionsContainer.innerHTML = `<h4>Default settings for: <strong>${employee.name}</strong></h4>`;

    if (allPositions.length === 0) {
        defaultPositionsContainer.innerHTML += '<p>No positions defined yet. <a href="#" onclick="openPositionManagementModal(); return false;">Manage Positions</a> to add some.</p>';
        return;
    }

    allPositions.forEach(position => {
        const empDefaultPos = employee.defaultPositions.find(dp => dp.positionId === position.id);
        const isChecked = !!empDefaultPos;
        const payRate = empDefaultPos ? empDefaultPos.payRate : (position.defaultPayRate !== null ? position.defaultPayRate : '');

        const groupDiv = document.createElement('div');
        groupDiv.classList.add('position-entry-group'); // Re-use class from _components.scss if suitable

        const checkboxLabelGroup = document.createElement('div');
        checkboxLabelGroup.classList.add('position-checkbox-label-group');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `default-pos-check-${employee.id}-${position.id}`;
        checkbox.dataset.positionId = position.id;
        checkbox.checked = isChecked;
        checkbox.addEventListener('change', (e) => {
            const payRateInputDiv = e.target.closest('.position-entry-group').querySelector('.pay-rate-input-wrapper');
            if (payRateInputDiv) payRateInputDiv.style.display = e.target.checked ? 'block' : 'none';
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = position.name;

        checkboxLabelGroup.appendChild(checkbox);
        checkboxLabelGroup.appendChild(label);
        groupDiv.appendChild(checkboxLabelGroup);

        const payRateInputWrapper = document.createElement('div');
        payRateInputWrapper.classList.add('pay-rate-input-wrapper');
        payRateInputWrapper.style.display = isChecked ? 'block' : 'none'; // Show only if checked

        const payRateLabel = document.createElement('label');
        payRateLabel.htmlFor = `default-payrate-${employee.id}-${position.id}`;
        payRateLabel.textContent = `Pay Rate for ${position.name} ($/hr):`;
        payRateLabel.style.fontWeight = 'normal'; // Less emphasis than main labels
        payRateLabel.style.fontSize = '0.9em';

        const payRateInput = document.createElement('input');
        payRateInput.type = 'number';
        payRateInput.id = `default-payrate-${employee.id}-${position.id}`;
        payRateInput.dataset.positionId = position.id;
        payRateInput.placeholder = `Default: ${position.defaultPayRate !== null ? formatCurrency(position.defaultPayRate) : 'N/A'}`;
        payRateInput.value = payRate !== null ? payRate : '';
        payRateInput.min = "0";
        payRateInput.step = "0.01";
        payRateInput.classList.add('default-position-payrate');

        payRateInputWrapper.appendChild(payRateLabel);
        payRateInputWrapper.appendChild(payRateInput);
        groupDiv.appendChild(payRateInputWrapper);

        defaultPositionsContainer.appendChild(groupDiv);
    });
}

/**
 * Handles saving the default positions and pay rates for the currently selected employee.
 */
function handleSaveDefaultPositionsForSelectedEmployee() {
    const selectedEmployeeId = appState.ui.selectedEmployeeIdForDefaultPos;
    if (!selectedEmployeeId) {
        showToast("No employee selected to save default positions for.", "warning");
        return;
    }

    const employee = getEmployeeById(selectedEmployeeId);
    if (!employee) {
        showToast("Selected employee not found.", "error");
        return;
    }

    const newDefaultPositions = [];
    const positionCheckboxes = defaultPositionsContainer.querySelectorAll('input[type="checkbox"][data-position-id]');

    positionCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const positionId = checkbox.dataset.positionId;
            const payRateInput = defaultPositionsContainer.querySelector(`input[type="number"][data-position-id="${positionId}"]`);
            let payRate = null;
            if (payRateInput && payRateInput.value !== '') {
                const parsedRate = parseFloat(payRateInput.value);
                if (!isNaN(parsedRate) && parsedRate >= 0) {
                    payRate = parsedRate;
                } else {
                    showToast(`Invalid pay rate for position ${getPositionById(positionId)?.name}. Using no default rate.`, "warning");
                }
            }
            newDefaultPositions.push({ positionId: positionId, payRate: payRate });
        }
    });

    updateEmployeeInState(selectedEmployeeId, { defaultPositions: newDefaultPositions });
    showToast(`Default positions for ${employee.name} saved.`, "success");
    // Optionally, re-render to confirm changes or if there's visual feedback needed
    // renderDefaultPositionsForSelectedEmployee(selectedEmployeeId);
}

// Helper to get selected employee ID for default position editing (if needed by other modules)
function getSelectedEmployeeIdForDefaultPos() {
    return appState.ui.selectedEmployeeIdForDefaultPos;
}
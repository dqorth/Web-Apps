import { domElements } from '../domElements.js';
import { sortEmployeesByName } from '../utils.js';

export function renderFullEmployeeListForManagement(container, employeeRosterData, onEditCallback, onRemoveCallback) {
    if (!container) { console.error("UI_LOG: Full employee roster container not found!"); return; }
    container.innerHTML = '';
    if (employeeRosterData.length === 0) {
        container.innerHTML = '<p>No employees in the roster yet. Add a new hero using the form!</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'item-list';
    employeeRosterData.sort((a, b) => sortEmployeesByName(a, b, 'name')).forEach(emp => {
        const li = document.createElement('li');
        li.id = `management-emp-${emp.id}`;

        const employeeInfoDiv = document.createElement('div');
        employeeInfoDiv.className = 'employee-info';
        employeeInfoDiv.innerHTML = `<strong>${emp.name}</strong><span class=\"roster-positions\">${emp.positions.join(', ')}</span>`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'employee-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'button small-action-btn edit-btn';
        editBtn.dataset.id = emp.id;
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => onEditCallback(emp));
        actionsDiv.appendChild(editBtn);

        const removeXBtn = document.createElement('button');
        removeXBtn.className = 'remove-x-btn';
        removeXBtn.dataset.id = emp.id;
        removeXBtn.textContent = 'X';
        removeXBtn.setAttribute('aria-label', `Remove ${emp.name}`);
        removeXBtn.addEventListener('click', () => onRemoveCallback(emp.id)); // Pass emp.id

        li.append(employeeInfoDiv, actionsDiv, removeXBtn);
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

export function renderEmpPositionsWithPayRates(positionsContainer, jobPositionsList, editingEmpData) {
    if (!positionsContainer) return;
    positionsContainer.innerHTML = '';

    if (jobPositionsList.length === 0) {
        positionsContainer.innerHTML = "<p>No job positions configured.</p>";
        return;
    }

    jobPositionsList.forEach(pos => {
        const posIdentifier = pos.replace(/\\s+/g, '');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'position-entry-group';

        const isSelected = editingEmpData ? editingEmpData.positions.includes(pos) : false;
        const currentPayRateValue = (editingEmpData && editingEmpData.payRates && editingEmpData.payRates[pos] !== undefined) ? String(editingEmpData.payRates[pos]) : '';

        const roleToggleButton = document.createElement('button');
        roleToggleButton.type = 'button';
        roleToggleButton.classList.add('button', 'role-toggle-btn');
        if (isSelected) roleToggleButton.classList.add('selected-role');
        else roleToggleButton.classList.add('is-not-working'); // Re-evaluate class name if needed
        roleToggleButton.dataset.position = pos;
        roleToggleButton.textContent = pos;
        roleToggleButton.setAttribute('aria-pressed', String(isSelected));

        const payRateWrapperDiv = document.createElement('div');
        payRateWrapperDiv.className = 'pay-rate-input-wrapper';
        payRateWrapperDiv.id = `payRateWrapper_${posIdentifier}`;
        payRateWrapperDiv.style.display = isSelected ? 'block' : 'none';

        const payRateLabel = document.createElement('label');
        payRateLabel.htmlFor = `payRate_${posIdentifier}`;
        payRateLabel.textContent = `${pos} Pay Rate ($/hr):`;

        const payRateInput = document.createElement('input');
        payRateInput.type = 'number';
        payRateInput.id = `payRate_${posIdentifier}`;
        payRateInput.dataset.position = pos; // For easier data retrieval
        payRateInput.placeholder = "0.00";
        payRateInput.step = "0.01";
        payRateInput.value = currentPayRateValue;

        payRateWrapperDiv.appendChild(payRateLabel);
        payRateWrapperDiv.appendChild(payRateInput);
        groupDiv.appendChild(roleToggleButton);
        groupDiv.appendChild(payRateWrapperDiv);
        positionsContainer.appendChild(groupDiv);

        // Event listener for toggling pay rate input will be in events.js
        // roleToggleButton.addEventListener('click', () => { ... });
    });
}

export function resetEmployeeForm(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList) {
    if (nameInput) nameInput.value = '';
    if (editingIdInput) editingIdInput.value = '';
    
    renderEmpPositionsWithPayRates(positionsContainer, jobPositionsList, null); // Pass null for editingEmpData

    if (addBtn) addBtn.style.display = 'inline-block';
    if (updateBtn) updateBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block'; // Or manage visibility as needed
    if (formWrapper) formWrapper.style.display = 'none'; // Default to hidden after reset
}

export function populateEmployeeFormForEdit(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, employeeData, jobPositionsList) {
    if (!employeeData) return;
    if (editingIdInput) editingIdInput.value = employeeData.id;
    if (nameInput) nameInput.value = employeeData.name;

    renderEmpPositionsWithPayRates(positionsContainer, jobPositionsList, employeeData);

    if (addBtn) addBtn.style.display = 'none';
    if (updateBtn) updateBtn.style.display = 'inline-block';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
    if (formWrapper) formWrapper.style.display = 'block';
    if (nameInput) nameInput.focus();
}

export function togglePayRateInputVisibility(positionIdentifier, isVisible) {
    const payRateWrapper = document.getElementById(`payRateWrapper_${positionIdentifier}`);
    if (payRateWrapper) {
        payRateWrapper.style.display = isVisible ? 'block' : 'none';
        if (isVisible) {
            const payRateInput = payRateWrapper.querySelector('input[type="number"]');
            if (payRateInput) {
                // payRateInput.focus(); // Optional: focus when shown
            }
        }
    } else {
        console.warn(`Pay rate wrapper not found for position: ${positionIdentifier}`);
    }
}

export function toggleEmployeeFormVisibility(formWrapper, toggleButton, isEditing, employeeToEdit, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList) {
    const isCurrentlyHidden = formWrapper.style.display === 'none';
    if (isCurrentlyHidden) {
        if (isEditing && employeeToEdit) {
            populateEmployeeFormForEdit(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, employeeToEdit, jobPositionsList);
            if (toggleButton) toggleButton.textContent = 'Hide Edit Form';
        } else {
            resetEmployeeForm(null, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList); // Don't hide wrapper here
            formWrapper.style.display = 'block';
            if (toggleButton) toggleButton.textContent = 'Hide Add Employee Form';
            if (nameInput) nameInput.focus();
        }
    } else {
        formWrapper.style.display = 'none';
        if (toggleButton) toggleButton.textContent = 'Add New Jukebox Hero'; 
        // If it was an edit form that is now hidden, reset it fully
        if (editingIdInput && editingIdInput.value) {
             resetEmployeeForm(null, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList);
        }
    }
}

export function switchViewToEmployeeForm(lineupSection, formSection, isEditing, empToEdit, formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList, fullRosterContainer, employeeRosterData, onEditFullRoster, onRemoveFullRoster, toggleButton) {
    if (lineupSection) lineupSection.style.display = 'none';
    if (formSection) formSection.style.display = 'block';

    if (isEditing && empToEdit) {
        populateEmployeeFormForEdit(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, empToEdit, jobPositionsList);
        if (toggleButton) toggleButton.textContent = 'Hide Edit Form';
    } else {
        // When switching to form view not for a specific edit (e.g. from main button), ensure form is reset but potentially visible or hidden based on toggle button state
        // The toggle button itself might control the addEmployeeFormWrapper visibility
        resetEmployeeForm(null, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList);
        if (formWrapper.style.display === 'block') {
             if (toggleButton) toggleButton.textContent = 'Hide Add Employee Form';
             if (nameInput) nameInput.focus();
        } else {
            if (toggleButton) toggleButton.textContent = 'Add New Jukebox Hero';
        }
    }
    renderFullEmployeeListForManagement(fullRosterContainer, employeeRosterData, onEditFullRoster, onRemoveFullRoster);
}

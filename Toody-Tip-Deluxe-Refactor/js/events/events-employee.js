import { domElements } from '../domElements.js';
import * as state from '../state.js';
import * as utils from '../utils.js';
import { switchViewToEmployeeForm, toggleEmployeeFormVisibility, renderFullEmployeeListForManagement, resetEmployeeForm } from '../ui/ui-employee-management.js';
import { switchViewToLineup } from '../ui/ui-core.js'; // Assuming switchViewToLineup is in ui-core.js, adjust if it was moved
import { renderEmployeeRoster, applyMasonryLayoutToRoster } from '../ui/ui-roster.js';

// import { showInfoModal, showConfirmationModal } from '../ui/ui-modals.js'; // Assuming modals are separated, adjust path as needed

// Placeholder for ui.showInfoModal and ui.showConfirmationModal until they are properly refactored and imported
const ui = {
    showInfoModal: (message) => { console.warn("TODO: showInfoModal:", message); alert(message); },
    showConfirmationModal: (message, callback) => { 
        console.warn("TODO: showConfirmationModal:", message);
        if(confirm(message)) {
            callback();
        }
    }
};

export function handleEditEmployeeSetupFromMgmtList(employeeToEdit) {
    switchViewToEmployeeForm(
        domElements.employeeLineupSection,    
        domElements.employeeFormSection,      
        true,                                 
        employeeToEdit,                       
        domElements.addEmployeeFormWrapper,
        domElements.empNameInput,
        domElements.empPositionsContainer,
        domElements.addEmployeeBtn,
        domElements.updateEmployeeBtn,
        domElements.cancelEditBtn,
        domElements.editingEmployeeIdInput,
        state.state.jobPositions, // Corrected
        domElements.fullEmployeeRosterContainer,  
        state.state.employeeRoster,                     
        handleEditEmployeeSetupFromMgmtList,      
        handleRemoveEmployeeFromMgmtList,         
        domElements.toggleAddNewEmployeeFormBtn   
    );
}

export function initializeEmployeeEventListeners() {
    if (domElements.toggleAddNewEmployeeFormBtn) {
        domElements.toggleAddNewEmployeeFormBtn.addEventListener('click', () => {
            const isFormVisible = domElements.addEmployeeFormWrapper.style.display === 'block';
            domElements.addEmployeeFormWrapper.style.display = isFormVisible ? 'none' : 'block';
            // Pass state.state.jobPositions here
            switchViewToEmployeeForm(
                domElements.employeeLineupSection,
                domElements.employeeFormSection,
                false, // Not editing a specific employee when toggling the add form
                null,  // No specific employee to edit
                domElements.addEmployeeFormWrapper,
                domElements.empNameInput,
                domElements.empPositionsContainer,
                domElements.addEmployeeBtn,
                domElements.updateEmployeeBtn,
                domElements.cancelEditBtn,
                domElements.editingEmployeeIdInput,
                state.state.jobPositions, // Corrected: Pass the jobPositions from the state object
                domElements.fullEmployeeRosterContainer,  
                state.state.employeeRoster,                     
                handleEditEmployeeSetupFromMgmtList,      
                handleRemoveEmployeeFromMgmtList,         
                domElements.toggleAddNewEmployeeFormBtn   
            );
            if (domElements.addEmployeeFormWrapper.style.display === 'block') {
                domElements.empNameInput.focus();
            }
        });
    }
}

export function handleShowAddEmployeeForm() {
    // This function is called by the 'Manage Roster / Add New Hero' button, which is now handled by toggleAddNewEmployeeFormBtn's listener.
    // However, if it were to be called directly, it should also use state.state.jobPositions.
    // For safety, let's ensure it's consistent, though the primary path is the toggle button.
    const isFormVisible = domElements.addEmployeeFormWrapper.style.display === 'block';
    // If the button's purpose is just to ensure the form section is visible and correctly populated for adding (not toggling visibility)
    // then we might not toggle display here, but ensure it's 'block'.
    // domElements.addEmployeeFormWrapper.style.display = 'block'; // Or manage via toggle button state

    switchViewToEmployeeForm(
        domElements.employeeLineupSection,
        domElements.employeeFormSection,
        false, 
        null,  
        domElements.addEmployeeFormWrapper,
        domElements.empNameInput,
        domElements.empPositionsContainer,
        domElements.addEmployeeBtn,
        domElements.updateEmployeeBtn,
        domElements.cancelEditBtn,
        domElements.editingEmployeeIdInput,
        state.state.jobPositions, // Corrected: Pass the jobPositions from the state object
        domElements.fullEmployeeRosterContainer,
        state.state.employeeRoster,
        handleEditEmployeeSetupFromMgmtList,
        handleRemoveEmployeeFromMgmtList,
        domElements.toggleAddNewEmployeeFormBtn // Pass the toggle button itself
    );
    // Ensure form is visible if this function's intent is to show it
    if (domElements.addEmployeeFormWrapper.style.display !== 'block') {
        domElements.addEmployeeFormWrapper.style.display = 'block';
    }
    if (domElements.addEmployeeFormWrapper.style.display === 'block') {
        domElements.empNameInput.focus();
        // Update button text if needed, consistent with switchViewToEmployeeForm logic
        if (domElements.toggleAddNewEmployeeFormBtn) {
            domElements.toggleAddNewEmployeeFormBtn.textContent = 'Hide Add Employee Form';
        }
    }
}

export function handleGoBackToLineup() {
    switchViewToLineup(
        domElements.employeeLineupSection, 
        domElements.employeeFormSection, 
        domElements.rosterListContainer, // Corrected: Pass the actual DOM element
        state.state.activeSelectedDate
    );
}

export function handleToggleAddNewEmployeeFormVisibility() {
    // const isCurrentlyHidden = domElements.addEmployeeFormWrapper.style.display === 'none';
    toggleEmployeeFormVisibility(
        domElements.addEmployeeFormWrapper,       
        domElements.toggleAddNewEmployeeFormBtn,  
        !!domElements.editingEmployeeIdInput.value, 
        null,                                     
        domElements.empNameInput,
        domElements.empPositionsContainer,
        domElements.addEmployeeBtn,
        domElements.updateEmployeeBtn,
        domElements.cancelEditBtn,
        domElements.editingEmployeeIdInput,
        state.JOB_POSITIONS_AVAILABLE
    );
}

export function handleAddOrUpdateEmployee(isUpdating) {
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
    renderFullEmployeeListForManagement(
        domElements.fullEmployeeRosterContainer,
        state.employeeRoster,
        handleEditEmployeeSetupFromMgmtList, 
        handleRemoveEmployeeFromMgmtList     
    );
    toggleEmployeeFormVisibility(domElements.addEmployeeFormWrapper, domElements.toggleAddNewEmployeeFormBtn, false, null, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE);
    resetEmployeeForm(domElements.addEmployeeFormWrapper, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE);
}

export function handleCancelEditEmployee() {
    resetEmployeeForm(domElements.addEmployeeFormWrapper, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE);
    toggleEmployeeFormVisibility(domElements.addEmployeeFormWrapper, domElements.toggleAddNewEmployeeFormBtn, false, null, domElements.empNameInput, domElements.empPositionsContainer, domElements.addEmployeeBtn, domElements.updateEmployeeBtn, domElements.cancelEditBtn, domElements.editingEmployeeIdInput, state.JOB_POSITIONS_AVAILABLE);
}

export function handleRemoveEmployeeFromMgmtList(empId) {
    const employee = state.employeeRoster.find(e => e.id === empId);
    if (!employee) {
        console.error("Error: Employee not found for removal:", empId);
        ui.showInfoModal("Error: Employee not found.");
        return;
    }

    const message = `Are you sure you want to remove ${employee.name}? This will also remove any of their logged shifts.`;

    ui.showConfirmationModal(message, () => {
        state.removeEmployeeFromRoster(empId);

        renderEmployeeRoster(
            domElements.rosterListContainer,
            state,
            state.activeSelectedDate
        );
        applyMasonryLayoutToRoster(domElements.rosterListContainer);

        renderFullEmployeeListForManagement(
            domElements.fullEmployeeRosterContainer,
            state.employeeRoster,
            handleEditEmployeeSetupFromMgmtList, 
            handleRemoveEmployeeFromMgmtList     
        );

        if (domElements.editingEmployeeIdInput.value === empId) {
            resetEmployeeForm(
                domElements.addEmployeeFormWrapper,
                domElements.empNameInput,
                domElements.empPositionsContainer,
                domElements.addEmployeeBtn,
                domElements.updateEmployeeBtn,
                domElements.cancelEditBtn,
                domElements.editingEmployeeIdInput,
                state.JOB_POSITIONS_AVAILABLE
            );
            domElements.addEmployeeBtn.style.display = 'inline-block';
            domElements.updateEmployeeBtn.style.display = 'none';
        }
    });
}

// --- File Import Handler (Placeholder) ---
export function handleFileImport(event) {
    console.warn("handleFileImport is not yet implemented.");
    // TODO: Implement file import logic
    if (domElements.employeeImportFileInput) {
        domElements.employeeImportFileInput.value = ''; 
    }
}

import { domElements } from '../domElements.js';
import * as uiCore from '../ui/ui-core.js';
import * as uiTutorial from '../ui/ui-tutorial.js';
import * as uiEmployeeManagement from '../ui/ui-employee-management.js'; // For togglePayRateInputVisibility
import * as uiRoster from '../ui/ui-roster.js'; // For applyMasonryLayoutToRoster
import * as uiDefaultPayRates from '../ui/ui-default-pay-rates.js';

import { handleCycleOrWeekChange, handlePrevWeek, handleNextWeek } from './events-date-time.js';
import { 
    handleGoBackToLineup, 
    handleToggleAddNewEmployeeFormVisibility, 
    handleAddOrUpdateEmployee, 
    handleCancelEditEmployee, 
    handleShowAddEmployeeForm,
    handleFileImport
} from './events-employee.js';
import { handleRosterEmployeeClick } from './events-shift.js';
import { handleExportToXLSX, handleDownloadState, handleLoadState } from './events-data.js';
import { handleNextTutorialStep, handlePrevTutorialStep, handleStartTutorial } from './events-tutorial.js';
import { triggerDailyScoopCalculation, triggerWeeklyRewindCalculation } from './events-app-logic.js';

// --- General Click Logger (for debugging event propagation) ---
// Moved to the bottom of the file to ensure it's attached after specific handlers if that matters.
// However, using capture phase means it runs early anyway.

// --- Initialize All Event Listeners ---
function initializeEventListeners() {
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
                // Assuming togglePayRateInputVisibility is part of uiEmployeeManagement or a shared ui utility
                uiEmployeeManagement.togglePayRateInputVisibility(positionIdentifier, isSelected); 
            }
        });
    }

    // Shift Logging View
    if (domElements.showAddEmployeeFormBtn) domElements.showAddEmployeeFormBtn.addEventListener('click', handleShowAddEmployeeForm);
    if (domElements.rosterListContainer) {
        domElements.rosterListContainer.addEventListener('click', handleRosterEmployeeClick);
    }

    // Weekly Report View
    if (domElements.prevWeekBtn) domElements.prevWeekBtn.addEventListener('click', handlePrevWeek);
    if (domElements.nextWeekBtn) domElements.nextWeekBtn.addEventListener('click', handleNextWeek);
    if (domElements.exportWeeklyCSVBtn) domElements.exportWeeklyCSVBtn.addEventListener('click', handleExportToXLSX);    // Data Management View
    if (domElements.downloadStateBtn) domElements.downloadStateBtn.addEventListener('click', handleDownloadState);
    if (domElements.loadStateFileInput) domElements.loadStateFileInput.addEventListener('change', handleLoadState);
    if (domElements.saveDefaultPayRatesBtn) domElements.saveDefaultPayRatesBtn.addEventListener('click', handleSaveDefaultPayRates);

    // Tutorial System
    if (domElements.tutorialNextBtn) domElements.tutorialNextBtn.addEventListener('click', handleNextTutorialStep);
    if (domElements.tutorialPrevBtn) domElements.tutorialPrevBtn.addEventListener('click', handlePrevTutorialStep);
    if (domElements.tutorialCloseBtn) domElements.tutorialCloseBtn.addEventListener('click', () => uiTutorial.closeTutorial(domElements));
    if (domElements.tutorialOverlay) {
        domElements.tutorialOverlay.addEventListener('click', (e) => {
            if (e.target === domElements.tutorialOverlay) { 
                uiTutorial.closeTutorial(domElements);
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (domElements.tutorialOverlay && domElements.tutorialOverlay.style.display === 'block') {
            if (e.key === 'Escape') uiTutorial.closeTutorial(domElements);
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
                uiRoster.applyMasonryLayoutToRoster(domElements.rosterListContainer);
            }        }, 250);
    });    // Tutorial button event listeners (direct, like original app)
    const tutorialButtons = document.querySelectorAll('.tutorial-btn');
    console.log("APP_LOG: Found", tutorialButtons.length, "tutorial buttons to attach listeners to");
    
    tutorialButtons.forEach((btn, index) => {
        const tutorialKey = btn.dataset.tutorialFor;
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop the click from bubbling up to the collapsible header
            const clickedTutorialKey = e.target.dataset.tutorialFor;
            
            if (clickedTutorialKey) {
                console.log("APP_LOG: Tutorial button clicked for:", clickedTutorialKey);
                handleStartTutorial(clickedTutorialKey);
            }
        });
    });

    // Tab/View switching listeners
    document.querySelectorAll('.view-toggle-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetViewId = event.currentTarget.dataset.viewTarget;
            uiCore.switchView(targetViewId); // Corrected: switchView now only takes targetSectionId
            if (targetViewId === 'employeeLineupSection' && domElements.employeeLineupSection.style.display !== 'none') {
                uiRoster.applyMasonryLayoutToRoster(domElements.rosterListContainer);
            }
            if (targetViewId === 'payoutSection' && domElements.payoutSection.style.display !== 'none') {
                triggerDailyScoopCalculation();
            }
            if (targetViewId === 'weeklyReportSection' && domElements.weeklyReportSection.style.display !== 'none') {
                triggerWeeklyRewindCalculation();
            }
        });
    });
    
    // General Click Logger (for debugging event propagation)
    document.body.addEventListener('click', function(event) {
        console.log('DEBUG_CLICK_LISTENER: [js/events/events-initialization.js] document.body click detected. Target:', event.target);
    }, true); // Use capture phase for this general logger    console.log("EVENT_LOG: All event listeners initialized from events-initialization.js");
}

// Handler for saving default pay rates
function handleSaveDefaultPayRates() {
    uiDefaultPayRates.saveDefaultPayRates();
}

// Expose initializeEventListeners for main.js
// Expose handleStartTutorial globally for index.html - this will be handled by main.js
export {
    initializeEventListeners,
    handleStartTutorial 
};

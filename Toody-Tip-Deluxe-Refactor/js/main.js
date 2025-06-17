import { initializeEventListeners } from './events/events-initialization.js';
import { calculateAndUpdateCurrentDate } from './events/events-date-time.js';
import * as state from './state.js';
import { populateJobPositions, populateCycleStartDateSelect, initializeCollapsibleSections } from './ui/ui-core.js';
import { initTutorialUI } from './ui/ui-tutorial.js'; // Import initTutorialUI
import { domElements } from './domElements.js';
import { triggerDailyScoopCalculation, triggerWeeklyRewindCalculation } from './events/events-app-logic.js';
// Import specific tutorial event handlers for button wiring
import { handleStartTutorial, handleNextTutorialStep, handlePrevTutorialStep } from './events/events-tutorial.js';
import { applyMasonryLayoutToRoster } from './ui/ui-roster.js';
import * as utils from './utils.js';
import { BASE_CYCLE_START_DATE } from './state.js';
import { renderDefaultPayRatesUI } from './ui/ui-default-pay-rates.js';

// Initialize the application
function init() {
  state.loadStateFromLocalStorage();

  // Always set today's date and day of week after loading state
  const today = new Date();
  const todayMDTString = utils.formatDate(today);
  const todayDayOfWeekMDT = utils.getDayOfWeekMDT(today);
  state.setActiveSelectedDate(todayMDTString);
  state.setCurrentSelectedDayOfWeek(todayDayOfWeekMDT);

  populateJobPositions(domElements.jobPositionSelect, state.state.jobPositions);

  const parts = todayMDTString.split('-');
  const todayAtMDTMidnight = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  todayAtMDTMidnight.setHours(0,0,0,0);
  // Corrected: Use the directly imported BASE_CYCLE_START_DATE
  const { cycleStart: cycleStartForToday, weekNum: weekNumForToday } = utils.findCycleAndWeekForDatePrecise(todayAtMDTMidnight, BASE_CYCLE_START_DATE);

  populateCycleStartDateSelect(domElements.cycleStartDateSelect, BASE_CYCLE_START_DATE, cycleStartForToday ? cycleStartForToday : state.state.activeSelectedDate);

  if (cycleStartForToday && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStartForToday}"]`)) {
    domElements.cycleStartDateSelect.value = cycleStartForToday;
  }
  if (weekNumForToday && domElements.weekInCycleSelect.querySelector(`option[value="${weekNumForToday}"]`)) {
    domElements.weekInCycleSelect.value = String(weekNumForToday);
  }

  calculateAndUpdateCurrentDate(state.state.currentSelectedDayOfWeek); 

  initializeEventListeners();
  initTutorialUI(); // Initialize the tutorial UI elements
    // Attach tutorial navigation event listeners
  if (domElements.tutorialNextBtn) {
    domElements.tutorialNextBtn.addEventListener('click', handleNextTutorialStep);
  }
  if (domElements.tutorialPrevBtn) {
    domElements.tutorialPrevBtn.addEventListener('click', handlePrevTutorialStep);
  }
  // Note: The tutorial close button listener is handled within initTutorialUI itself (using hideTutorial from ui-tutorial.js)
  // And tutorial start buttons in index.html call window.handleStartTutorial  // Initialize collapsible sections, providing a callback for when sections are opened
  initializeCollapsibleSections((openedContentId) => {
    if (openedContentId === 'lineupContent') {
        applyMasonryLayoutToRoster();
    }
    if (openedContentId === 'dataManagementContent') {
        console.log("APP_LOG: Data management section opened, re-rendering pay rates UI");
        setTimeout(() => renderDefaultPayRatesUI(), 50);
    }
    // Add other specific actions based on openedContentId if needed
  });
  // Initialize default pay rates UI
  console.log("APP_LOG: About to render default pay rates UI");
  setTimeout(() => {
    console.log("APP_LOG: Delayed render of default pay rates UI");
    renderDefaultPayRatesUI();
  }, 100);

  // Trigger Daily Scoop calculation on startup after state is loaded and UI is initialized
  triggerDailyScoopCalculation();
  // Expose necessary functions to the global scope for index.html inline scripts
  window.handleStartTutorial = handleStartTutorial; // Already here, ensure it's the imported one
  window.triggerDailyScoopCalculation = triggerDailyScoopCalculation;
  window.triggerWeeklyRewindCalculation = triggerWeeklyRewindCalculation;
  
  // Debug function for default pay rates
  window.debugRenderPayRates = function() {
    console.log("DEBUG: Manual call to renderDefaultPayRatesUI");
    renderDefaultPayRatesUI();
  };

  // Debug function for testing tutorial buttons
  window.debugTutorialButtons = function() {
    console.log("=== Tutorial Button Debug ===");
    const buttons = document.querySelectorAll('.tutorial-btn');
    console.log(`Found ${buttons.length} tutorial buttons`);
    
    buttons.forEach((btn, i) => {
      const key = btn.dataset.tutorialFor;
      console.log(`Button ${i + 1}: "${key}"`);
      
      // Test if clicking it manually works
      if (i === 0) {
        console.log("Testing first button manually...");
        try {
          if (window.handleStartTutorial) {
            window.handleStartTutorial(key);
            console.log("SUCCESS: Manual call worked");
          } else {
            console.log("ERROR: window.handleStartTutorial not found");
          }
        } catch (error) {
          console.error("ERROR:", error);
        }
      }
    });
  };

  console.log("Application initialized to today's date");
}

document.addEventListener('DOMContentLoaded', init);

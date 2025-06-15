import { initializeEventListeners, calculateAndUpdateCurrentDate } from './events.js';
import * as state from './state.js'; // Changed to import all as state
import { populateJobPositions, populateCycleStartDateSelect } from './ui.js';
import { domElements } from './domElements.js';

// Initialize the application
function init() {
  state.loadStateFromLocalStorage(); // Prefixed with state.
  populateJobPositions(domElements.jobPositionSelect, state.JOB_POSITIONS_AVAILABLE); // Prefixed with state.
  // Ensure cycleStartDateSelect is populated before calculateAndUpdateCurrentDate reads its value
  populateCycleStartDateSelect(domElements.cycleStartDateSelect, state.BASE_CYCLE_START_DATE, state.activeSelectedDate); // Prefixed with state.
  
  // calculateAndUpdateCurrentDate will use the selected cycle/week to determine the active date
  // and then render day navigation and other date-dependent UI elements.
  calculateAndUpdateCurrentDate(); 

  initializeEventListeners();
  console.log("Application initialized");
}

document.addEventListener('DOMContentLoaded', init);

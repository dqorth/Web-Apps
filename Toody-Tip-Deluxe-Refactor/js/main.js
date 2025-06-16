import { initializeEventListeners } from './events/events-initialization.js';
import { calculateAndUpdateCurrentDate } from './events/events-date-time.js';
import * as state from './state.js';
import { populateJobPositions, populateCycleStartDateSelect, initializeCollapsibleSections } from './ui/ui-core.js';
import { domElements } from './domElements.js';
import { triggerDailyScoopCalculation, triggerWeeklyRewindCalculation } from './events/events-app-logic.js';
import { handleStartTutorial } from './events/events-tutorial.js';
import { applyMasonryLayoutToRoster } from './ui/ui-roster.js';
import * as utils from './utils.js';
import { BASE_CYCLE_START_DATE } from './state.js';

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
  const { cycleStart: cycleStartForToday, weekNum: weekNumForToday } = utils.findCycleAndWeekForDatePrecise(todayAtMDTMidnight, state.state.BASE_CYCLE_START_DATE);

  populateCycleStartDateSelect(domElements.cycleStartDateSelect, BASE_CYCLE_START_DATE, cycleStartForToday ? cycleStartForToday : state.state.activeSelectedDate);

  if (cycleStartForToday && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStartForToday}"]`)) {
    domElements.cycleStartDateSelect.value = cycleStartForToday;
  }
  if (weekNumForToday && domElements.weekInCycleSelect.querySelector(`option[value="${weekNumForToday}"]`)) {
    domElements.weekInCycleSelect.value = String(weekNumForToday);
  }

  calculateAndUpdateCurrentDate(state.state.currentSelectedDayOfWeek); 

  initializeEventListeners();
  
  // Initialize collapsible sections, providing a callback for when sections are opened
  initializeCollapsibleSections((openedContentId) => {
    console.log(`MAIN_LOG: Section ${openedContentId} was opened.`);
    if (openedContentId === 'lineupContent') {
        applyMasonryLayoutToRoster();
    }
    // Add other specific actions based on openedContentId if needed
  });

  // Expose necessary functions to the global scope for index.html inline scripts
  // and for ui-core.js event handlers
  window.handleStartTutorial = handleStartTutorial;
  window.triggerDailyScoopCalculation = triggerDailyScoopCalculation;
  window.triggerWeeklyRewindCalculation = triggerWeeklyRewindCalculation;

  console.log("Application initialized to today's date");
}

document.addEventListener('DOMContentLoaded', init);

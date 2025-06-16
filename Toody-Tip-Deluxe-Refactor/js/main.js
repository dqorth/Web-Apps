import { initializeEventListeners } from './events/events-initialization.js';
import { calculateAndUpdateCurrentDate } from './events/events-date-time.js';
import * as state from './state.js';
import { populateJobPositions, populateCycleStartDateSelect, initializeCollapsibleSections } from './ui/ui-core.js';
import { domElements } from './domElements.js';
import { triggerDailyScoopCalculation, triggerWeeklyRewindCalculation } from './events/events-app-logic.js';
import { handleStartTutorial } from './events/events-tutorial.js';
import { applyMasonryLayoutToRoster } from './ui/ui-roster.js';
import * as utils from './utils.js';

// Initialize the application
function init() {
  state.loadStateFromLocalStorage();
  populateJobPositions(domElements.jobPositionSelect, state.JOB_POSITIONS_AVAILABLE);

  // Determine today's date in MDT
  const today = new Date(); // Current moment
  // We need a Date object that represents midnight MDT for today.
  // utils.formatDate(today) will give YYYY-MM-DD in MDT.
  // Then parse this YYYY-MM-DD as an MDT date.
  const todayMDTString = utils.formatDate(today);
  const parts = todayMDTString.split('-');
  const todayAtMDTMidnight = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  todayAtMDTMidnight.setHours(0,0,0,0); // Ensure it's midnight

  const { cycleStart: cycleStartForToday, weekNum: weekNumForToday } = utils.findCycleAndWeekForDatePrecise(todayAtMDTMidnight, state.BASE_CYCLE_START_DATE);
  
  state.setActiveSelectedDate(todayMDTString); 

  populateCycleStartDateSelect(domElements.cycleStartDateSelect, state.BASE_CYCLE_START_DATE, cycleStartForToday ? cycleStartForToday : state.activeSelectedDate);

  if (cycleStartForToday && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStartForToday}"]`)) {
    domElements.cycleStartDateSelect.value = cycleStartForToday;
  }
  if (weekNumForToday && domElements.weekInCycleSelect.querySelector(`option[value="${weekNumForToday}"]`)) {
    domElements.weekInCycleSelect.value = String(weekNumForToday);
  }

  // state.currentSelectedDayOfWeek is already initialized to MDT day of week in state.js
  // const todayDayOfWeekMDT = todayAtMDTMidnight.getDay(); // Sunday is 0, Monday is 1, etc. (in local time, which we set to MDT)
  // state.setCurrentSelectedDayOfWeek(todayDayOfWeekMDT);
  
  calculateAndUpdateCurrentDate(state.currentSelectedDayOfWeek); 

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

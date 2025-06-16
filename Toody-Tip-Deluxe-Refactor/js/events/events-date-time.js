import { domElements } from '../domElements.js';
import * as state from '../state.js';
import * as utils from '../utils.js';
import { renderDayNavigation, updateDateDisplays, updateCurrentlyViewedWeekDisplay } from '../ui/ui-core.js';
import { renderEmployeeRoster, applyMasonryLayoutToRoster } from '../ui/ui-roster.js';
// Import other trigger functions if they are called directly from this module after refactor
// For now, assuming they are called from elsewhere or will be handled by initializeEventListeners
// import { triggerDailyScoopCalculation, triggerWeeklyRewindCalculation } from './events-app-logic.js'; // Example

// --- App Logic/Helper functions that involve state and UI updates ---

// calculateAndUpdateCurrentDate is also called by main.js, so it's exported.
// It's also called by handlePrevWeek/handleNextWeek within this module.
export function calculateAndUpdateCurrentDate(newDayOfWeekNum = null) {
    const cycleStartStr = domElements.cycleStartDateSelect.value;
    const weekNum = parseInt(domElements.weekInCycleSelect.value);

    if (!cycleStartStr) {
        if (domElements.lineupDateDisplay) domElements.lineupDateDisplay.textContent = "Set Cycle Start";
        if (domElements.scoopDateDisplay) domElements.scoopDateDisplay.textContent = "Set Cycle Start";
        state.setActiveSelectedDate(null);
        renderDayNavigation(domElements.lineupDayNavContainer, null, calculateAndUpdateCurrentDate);
        renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, state.JOB_POSITIONS_AVAILABLE);
        applyMasonryLayoutToRoster(domElements.rosterListContainer);
        return;
    }
    // const cycleStartDateObj = new Date(cycleStartStr + 'T00:00:00Z'); // Old UTC way
    const cycleStartDateObj = utils.parseDateToMDT(cycleStartStr); // MDT aware

    // const targetWeekMonday = new Date(cycleStartDateObj); // Old way
    // targetWeekMonday.setUTCDate(cycleStartDateObj.getUTCDate() + (weekNum - 1) * 7); // Old UTC way
    const targetWeekMonday = utils.addDaysToDate(cycleStartDateObj, (weekNum - 1) * 7); // MDT aware

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

    // const targetDate = new Date(targetWeekMonday); // Old way
    // targetDate.setUTCDate(targetWeekMonday.getUTCDate() + targetDayOffset); // Old UTC way
    const targetDate = utils.addDaysToDate(targetWeekMonday, targetDayOffset); // MDT aware

    state.setActiveSelectedDate(utils.formatDate(targetDate)); // formatDate is already MDT aware
    if (domElements.currentDateHiddenInput) domElements.currentDateHiddenInput.value = state.activeSelectedDate;

    updateDateDisplays(domElements.lineupDateDisplay, domElements.scoopDateDisplay, state.activeSelectedDate);

    // getWeekInfoForDate is MDT aware, activeSelectedDate is 'YYYY-MM-DD' MDT
    const currentWeekDateInfo = utils.getWeekInfoForDate(state.activeSelectedDate, state.BASE_CYCLE_START_DATE);
    if (currentWeekDateInfo && currentWeekDateInfo.weekStartDate && typeof currentWeekDateInfo.weekStartDate === 'string') {
        // currentWeekDateInfo.weekStartDate is 'YYYY-MM-DD' MDT string
        // const dateStrToUse = currentWeekDateInfo.weekStartDate + 'T00:00:00Z'; // Old UTC way
        // const newDateObj = new Date(dateStrToUse); // Old UTC way
        const newDateObj = utils.parseDateToMDT(currentWeekDateInfo.weekStartDate); // MDT aware

        if (!(newDateObj instanceof Date) || isNaN(newDateObj.getTime())) {
            console.error("calculateAndUpdateCurrentDate: Failed to create valid Date object from:", currentWeekDateInfo.weekStartDate, "Constructed Date:", newDateObj);
            state.setCurrentReportWeekStartDate(null);
        } else {
            state.setCurrentReportWeekStartDate(newDateObj); // Store as MDT Date object
        }
        updateCurrentlyViewedWeekDisplay(domElements.currentlyViewedWeekDisplay, state.currentReportWeekStartDate);
    } else {
        state.setCurrentReportWeekStartDate(null);
        updateCurrentlyViewedWeekDisplay(domElements.currentlyViewedWeekDisplay, null);
    }

    renderDayNavigation(domElements.lineupDayNavContainer, state.activeSelectedDate, calculateAndUpdateCurrentDate);
    renderDayNavigation(domElements.scoopDayNavContainer, state.activeSelectedDate, calculateAndUpdateCurrentDate);
    renderEmployeeRoster(domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, state.JOB_POSITIONS_AVAILABLE);
    applyMasonryLayoutToRoster(domElements.rosterListContainer);

    // Conditional calculation triggers will be handled by the view switching logic in events-initialization.js
    // or directly if those views are already active.
    // For now, removing direct calls to triggerDailyScoopCalculation and triggerWeeklyRewindCalculation
    // as they might not be defined yet or could cause circular dependencies if imported directly.
    // This will be re-evaluated when integrating with events-initialization.js
}

// --- Event Handlers ---

export function handleCycleOrWeekChange() {
    calculateAndUpdateCurrentDate();
}

export function handlePrevWeek() {
    if (state.currentReportWeekStartDate) {
        // const newStartDate = new Date(state.currentReportWeekStartDate); // Old way
        // newStartDate.setUTCDate(newStartDate.getUTCDate() - 7); // Old UTC way
        const newStartDate = utils.addDaysToDate(state.currentReportWeekStartDate, -7); // MDT aware

        // findCycleAndWeekForDatePrecise is MDT aware
        const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(newStartDate, state.BASE_CYCLE_START_DATE);
        if (cycleStart && weekNum && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
            domElements.cycleStartDateSelect.value = cycleStart;
            domElements.weekInCycleSelect.value = String(weekNum);
            // setCurrentReportWeekStartDate will be correctly set within calculateAndUpdateCurrentDate
            calculateAndUpdateCurrentDate(1); // Update to Monday of that week
        } else {
            console.error("Could not find matching cycle/week for new prev week date:", newStartDate);
            // state.setCurrentReportWeekStartDate(new Date(state.currentReportWeekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)); // Revert if navigation fails - no longer needed as state is set in calc
            // ui.showInfoModal("Could not navigate to the previous week. It might be out of the configured cycle range."); // showInfoModal will be handled later
            alert("Could not navigate to the previous week. It might be out of the configured cycle range.");
        }
    }
}

export function handleNextWeek() {
    if (state.currentReportWeekStartDate) {
        // const newStartDate = new Date(state.currentReportWeekStartDate); // Old way
        // newStartDate.setUTCDate(newStartDate.getUTCDate() + 7); // Old UTC way
        const newStartDate = utils.addDaysToDate(state.currentReportWeekStartDate, 7); // MDT aware

        // findCycleAndWeekForDatePrecise is MDT aware
        const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(newStartDate, state.BASE_CYCLE_START_DATE);
         if (cycleStart && weekNum && domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
            domElements.cycleStartDateSelect.value = cycleStart;
            domElements.weekInCycleSelect.value = String(weekNum);
            // setCurrentReportWeekStartDate will be correctly set within calculateAndUpdateCurrentDate
            calculateAndUpdateCurrentDate(1); // Update to Monday of that week
        } else {
            console.error("Could not find matching cycle/week for new next week date:", newStartDate);
            // state.setCurrentReportWeekStartDate(new Date(state.currentReportWeekStartDate.getTime() - 7 * 24 * 60 * 60 * 1000)); // Revert
            // ui.showInfoModal("Could not navigate to the next week. It might be out of the configured cycle range.");
            alert("Could not navigate to the next week. It might be out of the configured cycle range.");
        }
    }
}

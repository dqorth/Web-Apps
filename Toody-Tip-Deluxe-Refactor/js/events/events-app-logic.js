import { domElements } from '../domElements.js';
import * as state from '../state.js';
import * as utils from '../utils.js';
import * as calculations from '../calculations.js';
import { renderDailyPayoutResults, generateWeeklyReportContentUI } from '../ui/ui-data-reports.js';
// Import handlers from events-shift.js once it's created and functions are moved.
// For now, these will be undefined if called directly, but the functions are structured
// to receive them as arguments or they are called via event listeners.
// import { handleRemoveShiftFromDailyScoop, handleEditLoggedShiftSetup } from './events-shift.js';

// --- App Logic/Helper functions that involve state and UI updates ---

export function generateWeeklyReportContent() {
    console.log("[LOG events-app-logic.js] generateWeeklyReportContent called. currentReportWeekStartDate:", state.currentReportWeekStartDate, "Type:", typeof state.currentReportWeekStartDate, "IsDate:", state.currentReportWeekStartDate instanceof Date);
    if (!state.currentReportWeekStartDate) {
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Use date selector to establish a week context first.</p>";
        return;
    }

    const weeklyEmployeeSummaryData = {};
    const processedDailyShiftsForWeek = {}; 

    if (state.currentReportWeekStartDate instanceof Date && !isNaN(state.currentReportWeekStartDate.getTime())) {
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(state.currentReportWeekStartDate);
            currentDay.setUTCDate(state.currentReportWeekStartDate.getUTCDate() + i);
            const dateString = utils.formatDate(currentDay);

            const shiftsForDay = state.dailyShifts[dateString];
            let processedShifts = []; 

            if (shiftsForDay && shiftsForDay.length > 0) {
                processedShifts = calculations.runTipAndWageCalculationsForDay(shiftsForDay);
                processedDailyShiftsForWeek[dateString] = processedShifts; 

                processedShifts.forEach(pShift => {
                    if (!pShift.employeeId || !pShift.employeeName) {
                        console.warn("[LOG events-app-logic.js] Processed shift missing employeeId or employeeName:", pShift);
                        return; 
                    }

                    if (!weeklyEmployeeSummaryData[pShift.employeeId]) {
                        weeklyEmployeeSummaryData[pShift.employeeId] = {
                            employeeId: pShift.employeeId,
                            employeeName: pShift.employeeName,
                            totalWeeklyWages: 0,
                            totalWeeklyTipsForTaxes: 0,
                            totalWeeklyTipsOnCheck: 0,
                            totalWeeklyPayoutOnCheck: 0
                        };
                    }
                    const summary = weeklyEmployeeSummaryData[pShift.employeeId];
                    summary.totalWeeklyWages += pShift.shiftWage || 0;
                    summary.totalWeeklyTipsForTaxes += pShift.tipsForTaxes || 0;
                    summary.totalWeeklyTipsOnCheck += pShift.finalTakeHomeTips || 0; 
                });
            } else {
                processedDailyShiftsForWeek[dateString] = []; 
            }
        }

        for (const empId in weeklyEmployeeSummaryData) {
            const summary = weeklyEmployeeSummaryData[empId];
            summary.totalWeeklyPayoutOnCheck = summary.totalWeeklyWages + summary.totalWeeklyTipsOnCheck;
        }
    }
    
    // The 'handleEditLoggedShiftSetup' would need to be imported from 'events-shift.js'
    // For now, if this function is called directly before events-shift.js is ready and imports are updated,
    // it might cause an error if handleEditLoggedShiftSetup is not defined.
    // This will be resolved when all modules are in place and imports are finalized.
    // Placeholder for now, assuming it will be available in the global scope or passed if necessary.
    const handleEditShiftCallback = typeof handleEditLoggedShiftSetup !== 'undefined' ? handleEditLoggedShiftSetup : () => console.warn("handleEditLoggedShiftSetup not yet available to generateWeeklyReportContentUI");

    generateWeeklyReportContentUI(domElements.reportOutputDiv, weeklyEmployeeSummaryData, processedDailyShiftsForWeek, state.currentReportWeekStartDate, state.JOB_POSITIONS_AVAILABLE, handleEditShiftCallback);
}


export function triggerDailyScoopCalculation() {
    if (!state.activeSelectedDate) {
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = "<p>Please select a date first.</p>";
        return;
    }
    const shiftsForSelectedDay = state.dailyShifts[state.activeSelectedDate];
    if (!shiftsForSelectedDay || shiftsForSelectedDay.length === 0) {
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = `<p>No shifts have been logged for ${utils.formatDisplayDate(state.activeSelectedDate)}.</p>`;
        return;
    }
    try {
        const processedShifts = calculations.runTipAndWageCalculationsForDay(shiftsForSelectedDay);
        // The 'handleRemoveShiftFromDailyScoop' would need to be imported from 'events-shift.js'
        // Placeholder for now.
        const handleRemoveCallback = typeof handleRemoveShiftFromDailyScoop !== 'undefined' ? handleRemoveShiftFromDailyScoop : () => console.warn("handleRemoveShiftFromDailyScoop not yet available to renderDailyPayoutResults");
        renderDailyPayoutResults(domElements.payoutResultsDiv, processedShifts, state.activeSelectedDate, handleRemoveCallback);
    } catch (error) {
        console.error("Error during payout calculation:", error);
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = "<p style='color:red;'>An error occurred during calculations.</p>";
    }
}

export function triggerWeeklyRewindCalculation() {
    if (!state.currentReportWeekStartDate) {
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Week context not set. Navigate using main date controls or weekly navigation.</p>";
        return;
    }
    generateWeeklyReportContent(); // Internal call to the function within this module
}

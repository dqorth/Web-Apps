import { domElements } from '../domElements.js';
import * as state from '../state.js';
import * as utils from '../utils.js';
import * as calculations from '../calculations.js';
import { renderDailyPayoutResults, generateWeeklyReportContentUI } from '../ui/ui-data-reports.js';
import { handleRemoveShiftFromDailyScoop, handleEditLoggedShiftSetup } from './events-shift.js';
import { switchView } from '../ui/ui-core.js'; // Added import for switchView

// --- App Logic/Helper functions that involve state and UI updates ---

export function generateWeeklyReportContent() {
    // console.log("[LOG events-app-logic.js] generateWeeklyReportContent called. currentReportWeekStartDate:", state.state.currentReportWeekStartDate, "Type:", typeof state.state.currentReportWeekStartDate, "IsDate:", state.state.currentReportWeekStartDate instanceof Date);
    if (!state.state.currentReportWeekStartDate) {
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Use date selector to establish a week context first.</p>";
        return;
    }

    const weeklyEmployeeSummaryData = {};
    const processedDailyShiftsForWeek = {}; 

    if (state.state.currentReportWeekStartDate instanceof Date && !isNaN(state.state.currentReportWeekStartDate.getTime())) {
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(state.state.currentReportWeekStartDate);
            currentDay.setUTCDate(state.state.currentReportWeekStartDate.getUTCDate() + i);
            const dateString = utils.formatDate(currentDay);

            const shiftsForDay = state.state.dailyShifts[dateString];
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
                    summary.totalWeeklyTipsOnCheck += pShift.tipsOnCheck || 0; 
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

    generateWeeklyReportContentUI(domElements.reportOutputDiv, weeklyEmployeeSummaryData, processedDailyShiftsForWeek, state.state.currentReportWeekStartDate, state.state.jobPositions, handleEditShiftCallback);
}


export function triggerDailyScoopCalculation() {
    if (!state.state.activeSelectedDate) { // Corrected: Access activeSelectedDate from state.state
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = "<p>Please select a date first.</p>";
        return;
    }
    // console.log('[events-app-logic.js] triggerDailyScoopCalculation - Active Date:', state.state.activeSelectedDate); // Corrected
    const shiftsForSelectedDay = state.state.dailyShifts[state.state.activeSelectedDate]; // Corrected
    // console.log('[events-app-logic.js] triggerDailyScoopCalculation - Shifts for selected day from state:', JSON.parse(JSON.stringify(shiftsForSelectedDay || [])));

    if (!shiftsForSelectedDay || shiftsForSelectedDay.length === 0) {
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = `<p>No shifts have been logged for ${utils.formatDisplayDate(state.state.activeSelectedDate)}.</p>`; // Corrected
        return;
    }
    try {
        const processedShifts = calculations.runTipAndWageCalculationsForDay(shiftsForSelectedDay);
        // console.log('[events-app-logic.js] triggerDailyScoopCalculation - Processed shifts for rendering:', JSON.parse(JSON.stringify(processedShifts || [])));
        // The 'handleRemoveShiftFromDailyScoop' would need to be imported from 'events-shift.js'
        // Placeholder for now.
        const handleRemoveCallback = typeof handleRemoveShiftFromDailyScoop !== 'undefined' ? handleRemoveShiftFromDailyScoop : () => console.warn("handleRemoveShiftFromDailyScoop not yet available to renderDailyPayoutResults");
        renderDailyPayoutResults(domElements.payoutResultsDiv, processedShifts, state.state.activeSelectedDate, handleRemoveCallback); // Corrected
    } catch (error) {
        console.error("Error during payout calculation:", error);
        if (domElements.payoutResultsDiv) domElements.payoutResultsDiv.innerHTML = "<p style='color:red;'>An error occurred during calculations.</p>";
    }
}

export function triggerWeeklyRewindCalculation() {
    if (!state.state.currentReportWeekStartDate) { // Corrected: Access currentReportWeekStartDate from state.state
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Week context not set. Navigate using main date controls or weekly navigation.</p>";
        return;
    }
    generateWeeklyReportContent(); // Internal call to the function within this module
}

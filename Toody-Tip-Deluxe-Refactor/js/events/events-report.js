import { domElements } from '../domElements.js';
import * as state from '../state.js';
import * as utils from '../utils.js';
import * as calculations from '../calculations.js';
import { generateWeeklyReportContentUI } from '../ui/ui-data-reports.js';
import { handleEditLoggedShiftSetup } from './events-shift.js';
import { calculateAndUpdateCurrentDate } from './events-date-time.js';
import { switchViewToLineup } from '../ui/ui-core.js';
import { updateEmployeeLineupCard } from '../ui/ui-roster.js';

// Placeholder for UI functions (e.g., modals)
const ui = {
    showInfoModal: (message) => {
        console.warn("Placeholder: ui.showInfoModal called from events-report.js with:", message);
        alert(message); // Basic fallback
    },
    showConfirmationModal: (message, callback) => {
        console.warn("Placeholder: ui.showConfirmationModal called from events-report.js with:", message);
        if (confirm(message)) { // Basic fallback
            callback();
        }
    }
};

function generateWeeklyReportContent() {
    console.log("[LOG events-report.js] generateWeeklyReportContent called. currentReportWeekStartDate:", state.currentReportWeekStartDate, "Type:", typeof state.currentReportWeekStartDate, "IsDate:", state.currentReportWeekStartDate instanceof Date);
    if (!state.currentReportWeekStartDate) {
        if (domElements.reportOutputDiv) domElements.reportOutputDiv.innerHTML = "<p>Use date selector to establish a week context first.</p>";
        return;
    }

    const weeklyEmployeeSummaryData = {};
    const processedDailyShiftsForWeek = {}; // New object to store processed shifts for each day

    if (state.currentReportWeekStartDate instanceof Date && !isNaN(state.currentReportWeekStartDate.getTime())) {
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(state.currentReportWeekStartDate);
            currentDay.setUTCDate(state.currentReportWeekStartDate.getUTCDate() + i);
            const dateString = utils.formatDate(currentDay);

            const shiftsForDay = state.dailyShifts[dateString];
            let processedShifts = []; // Default to empty array

            if (shiftsForDay && shiftsForDay.length > 0) {
                processedShifts = calculations.runTipAndWageCalculationsForDay(shiftsForDay);
                processedDailyShiftsForWeek[dateString] = processedShifts; // Store processed shifts

                processedShifts.forEach(pShift => {
                    if (!pShift.employeeId || !pShift.employeeName) {
                        console.warn("[LOG events-report.js] Processed shift missing employeeId or employeeName:", pShift);
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
                processedDailyShiftsForWeek[dateString] = []; // Ensure entry exists even if no shifts
            }
        }

        for (const empId in weeklyEmployeeSummaryData) {
            const summary = weeklyEmployeeSummaryData[empId];
            summary.totalWeeklyPayoutOnCheck = summary.totalWeeklyWages + summary.totalWeeklyTipsOnCheck;
        }
    }
    
    generateWeeklyReportContentUI(domElements.reportOutputDiv, weeklyEmployeeSummaryData, processedDailyShiftsForWeek, state.currentReportWeekStartDate, state.JOB_POSITIONS_AVAILABLE, handleEditShiftFromWeeklyReport); // Pass processedDailyShiftsForWeek instead of state.dailyShifts, and use the local handleEditShiftFromWeeklyReport
}

// Note: employeeId and positionContext are used in setTimeout but not defined in function scope. This is an existing issue.
function handleEditShiftFromWeeklyReport(shiftId, date) {
    if (!shiftId || !date) {
        ui.showInfoModal("Error: Could not get all necessary details to edit the shift."); return;
    }

    const targetDateObj = new Date(date + 'T00:00:00Z');
    const { cycleStart, weekNum } = utils.findCycleAndWeekForDatePrecise(targetDateObj, state.BASE_CYCLE_START_DATE);

    if (!cycleStart || !weekNum || !domElements.cycleStartDateSelect.querySelector(`option[value="${cycleStart}"]`)) {
        ui.showInfoModal("Error: Could not automatically set date controls. Please navigate manually."); return;
    }

    domElements.cycleStartDateSelect.value = cycleStart;
    domElements.weekInCycleSelect.value = String(weekNum);
    let dayOfWeekNum = targetDateObj.getUTCDay();
    state.setCurrentSelectedDayOfWeek(dayOfWeekNum);
    calculateAndUpdateCurrentDate(dayOfWeekNum);

    // Ensure lineup section is visible and scroll to it
    // Assuming ui.switchView is available and correctly handles these arguments
    // For now, this direct call might be problematic if switchView isn't imported or ui object doesn't have it.
    // switchViewToLineup is imported, so we use that.
    switchViewToLineup(
        domElements.employeeLineupSection, 
        domElements.employeeFormSection, 
        'lineupContent', // This was 'lineupContentId' before, ensure it's the correct ID or parameter for switchViewToLineup
        domElements.rosterListContainer,
        state.employeeRoster,
        state.activeSelectedDate,
        state.dailyShifts,
        state.JOB_POSITIONS_AVAILABLE
    );
    if (domElements.employeeLineupSection) { // Check if element exists
        domElements.employeeLineupSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    setTimeout(() => {
        // These variables `employeeId` and `positionContext` are not defined in this function's scope.
        // This is an existing issue from the original commented-out code.
        // They would need to be passed into handleEditShiftFromWeeklyReport or retrieved differently.
        // For now, leaving as is to reflect the original code structure.

        // Attempt to find the shift to get employeeId and positionContext
        let employeeIdToUse, positionContextToUse;
        const allShiftsForDate = state.dailyShifts[date];
        if (allShiftsForDate) {
            const shiftDetails = allShiftsForDate.find(s => s.id === shiftId);
            if (shiftDetails) {
                employeeIdToUse = shiftDetails.employeeId;
                positionContextToUse = shiftDetails.positionWorked;
            }
        }

        if (!employeeIdToUse || !positionContextToUse) {
            ui.showInfoModal("Error: Could not determine employee or position for the shift to edit.");
            return;
        }
        const rosterLiId = `roster-emp-${employeeIdToUse}-${positionContextToUse.replace(/\s+/g, '')}`;
        const targetLi = document.getElementById(rosterLiId);

        if (targetLi) {
            const toggleButton = targetLi.querySelector('.worked-today-toggle-btn');
            if (toggleButton) {
                const currentShiftInLineup = state.dailyShifts[state.activeSelectedDate]?.find(s => s.id === shiftId);
                const employeeData = state.employeeRoster.find(e => e.id === employeeIdToUse);
                 updateEmployeeLineupCard(targetLi, toggleButton, currentShiftInLineup, employeeData, positionContextToUse);
                
                if (toggleButton.dataset.action === "edit" && toggleButton.dataset.shiftId === shiftId) {
                     handleEditLoggedShiftSetup({target: toggleButton}); // handleEditLoggedShiftSetup is imported
                     setTimeout(() => targetLi.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                } else {
                    toggleButton.click(); 
                     setTimeout(() => {
                        if (toggleButton.dataset.action !== "edit" || toggleButton.dataset.shiftId !== shiftId) {
                             handleEditLoggedShiftSetup({target: toggleButton});
                        }
                         setTimeout(() => targetLi.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                    }, 150);
                }
            }
        } else {
            ui.showInfoModal("Error: Could not find the employee's entry in The Lineup to edit the shift.");
        }
    }, 350);
}

export {
    generateWeeklyReportContent,
    handleEditShiftFromWeeklyReport
};

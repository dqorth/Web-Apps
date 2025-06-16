import { domElements } from '../domElements.js';
import { formatDate, formatDisplayDate, sortEmployeesByName, formatTimeTo12Hour } from '../utils.js';
import { JOB_POSITIONS_AVAILABLE } from '../state.js';

export function renderDailyPayoutResults(payoutResultsContainer, processedShifts, activeDate, onRemoveShiftCallback) {
    if (!payoutResultsContainer) { console.error("UI_LOG: Payout results div not found!"); return; }
    if (!processedShifts || processedShifts.length === 0) {
        payoutResultsContainer.innerHTML = `<p>No shifts processed for ${formatDisplayDate(activeDate)}.</p>`;
        return;
    }

    let html = '';
    const groupedByPosition = processedShifts.reduce((acc, shift) => {
        const pos = shift.positionWorked;
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(shift);
        return acc;
    }, {});

    // Assuming JOB_POSITIONS_AVAILABLE is imported or passed
    const positionOrder = ["Server", "Busser", "Food Runner", "Shake Spinner", "Host", ...JOB_POSITIONS_AVAILABLE.filter(p => !["Server", "Busser", "Food Runner", "Shake Spinner", "Host"].includes(p))];

    positionOrder.forEach(posKey => {
        if (groupedByPosition[posKey] && groupedByPosition[posKey].length > 0) {
            html += `<h5 class=\"report-position-group-header\">${posKey}s:</h5>`;
            html += `<div class=\"data-table-container\" style=\"overflow-x:auto;\"><table class=\"data-results-table\"><thead><tr><th>Employee</th><th>Shift Time</th><th>Hrs</th><th>Wage</th><th>Sales</th><th>CC Tips</th><th>Cash Tips</th><th>Tip Out</th><th>Tip In</th><th>Take-Home Tips</th><th>Action</th></tr></thead><tbody>`;
            groupedByPosition[posKey].sort((a, b) => sortEmployeesByName(a, b, 'employeeName')).forEach((pShift, index) => {
                html += `<tr>
                             <td data-label=\"Employee\">${pShift.employeeName}</td>
                             <td data-label=\"Shift Time\">${formatTimeTo12Hour(pShift.timeIn)} - ${formatTimeTo12Hour(pShift.timeOut)}</td>
                             <td data-label=\"Hrs\">${pShift.hoursWorked.toFixed(2)}</td>
                             <td data-label=\"Wage\">$${pShift.shiftWage.toFixed(2)}</td>
                             <td data-label=\"Sales\">${pShift.positionWorked === "Server" ? `$${(pShift.totalSales || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label=\"CC Tips\">${pShift.positionWorked === "Server" ? `$${(pShift.ccTips || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label=\"Cash Tips\">${pShift.positionWorked === "Server" ? `$${(pShift.cashTips || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label=\"Tip Out\">${pShift.positionWorked === "Server" ? `$${(pShift.tipOutGiven || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label=\"Tip In\">${pShift.positionWorked !== "Server" ? `$${(pShift.tipInReceived || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label=\"Take-Home Tips\"><strong>$${(pShift.finalTakeHomeTips || 0).toFixed(2)}</strong></td>
                             <td data-label=\"Action\">
                                 <button class=\"button small-action-btn remove-shift-from-scoop-btn\"
                                         data-shift-id=\"${pShift.id}\"
                                         data-date=\"${pShift.date}\" 
                                         data-empid=\"${pShift.employeeId}\"
                                         data-positioncontext=\"${pShift.positionWorked}\"
                                         title=\"Remove this shift permanently\"
                                         style=\"background-color: #c62828; font-size: 0.8em; padding: 4px 8px; margin-top:0;\">
                                     Del
                                 </button>
                             </td>
                         </tr>`;

                if (pShift.positionWorked !== "Server" && pShift.detailedTipIns && pShift.detailedTipIns.length > 0) {
                    html += `<tr class=\"detailed-tip-in-row-daily ${index % 2 === 1 ? 'even-detail' : 'odd-detail'}\"><td colspan=\"11\">`;
                    html += '<ul class=\"support-tip-detail\" style=\"margin:2px 0 2px 30px;padding-left:5px;list-style-type:circle;\">';
                    pShift.detailedTipIns.forEach(detail => {
                        let fST = 'N/A'; if (detail.fromServerShiftTime && detail.fromServerShiftTime.includes('-')) { const [sIn, sOut] = detail.fromServerShiftTime.split('-'); fST = `${formatTimeTo12Hour(sIn)}-${formatTimeTo12Hour(sOut)}`; }
                        let supST = 'N/A'; if (detail.supportShiftTime && detail.supportShiftTime.includes('-')) { const [supIn, supOut] = detail.supportShiftTime.split('-'); supST = `${formatTimeTo12Hour(supIn)}-${formatTimeTo12Hour(supOut)}`; }
                        html += `<li>From ${detail.fromServerName} (Server ${fST}, ${detail.overlapMinutes.toFixed(0)}m overlap with your ${supST}): <strong>$${detail.amount.toFixed(2)}</strong></li>`;
                    });
                    html += '</ul></td></tr>';
                }
            });
            html += `</tbody></table></div>`;
        }
    });
    payoutResultsContainer.innerHTML = html;

    payoutResultsContainer.querySelectorAll('.remove-shift-from-scoop-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const shiftId = button.dataset.shiftId;
            const shiftDate = button.dataset.date;
            const empId = button.dataset.empid;
            const posCtx = button.dataset.positioncontext;
            if (onRemoveShiftCallback) {
                onRemoveShiftCallback(shiftId, shiftDate, empId, posCtx);
            }
        });
    });
}

export function generateWeeklyReportContentUI(reportOutputContainer, weeklyEmployeeSummaryData, dailyShiftsByDate, weekStartObj, jobPositions, onEditShiftCallback) {
    console.log("[LOG ui-data-reports.js] generateWeeklyReportContentUI entered. weekStartObj:", weekStartObj, 
                "Type:", typeof weekStartObj, 
                "IsDate:", weekStartObj instanceof Date, 
                "getUTCDate type:", typeof weekStartObj?.getUTCDate, 
                "Constructor name:", weekStartObj?.constructor?.name, 
                "Object.prototype.toString:", Object.prototype.toString.call(weekStartObj));

    if (!(weekStartObj instanceof Date) || isNaN(weekStartObj.getTime()) || typeof weekStartObj.getUTCDate !== 'function') {
        console.error("Invalid weekStartObj:", weekStartObj);
        reportOutputContainer.innerHTML = '<p style=\"color:red;\">Error: Invalid week start date.</p>';
        return;
    }

    reportOutputContainer.innerHTML = '';

    const employeeSummaryArray = Object.values(weeklyEmployeeSummaryData);
    employeeSummaryArray.sort((a, b) => sortEmployeesByName(a, b, 'employeeName'));

    let weeklyHTML = '';

    if (employeeSummaryArray.length > 0) {
        weeklyHTML += `<h4>Weekly Employee Totals:</h4>`;
        weeklyHTML += `<div class=\"data-table-container\" style=\"overflow-x:auto; margin-bottom: 25px;\"><table class=\"data-results-table\">
            <thead><tr><th>Employee</th><th>Total Wages</th><th>Tips for Taxes</th><th>Tips on Check</th><th>Total Payout on Check</th></tr></thead><tbody>`;
        employeeSummaryArray.forEach(empSummary => {
            const totalWeeklyWages = (typeof empSummary.totalWeeklyWages === 'number') ? empSummary.totalWeeklyWages.toFixed(2) : '0.00';
            const totalWeeklyTipsForTaxes = (typeof empSummary.totalWeeklyTipsForTaxes === 'number') ? empSummary.totalWeeklyTipsForTaxes.toFixed(2) : '0.00';
            const totalWeeklyTipsOnCheck = (typeof empSummary.totalWeeklyTipsOnCheck === 'number') ? empSummary.totalWeeklyTipsOnCheck.toFixed(2) : '0.00';
            const totalWeeklyPayoutOnCheck = (typeof empSummary.totalWeeklyPayoutOnCheck === 'number') ? empSummary.totalWeeklyPayoutOnCheck.toFixed(2) : '0.00';

            weeklyHTML += `<tr>
                <td data-label=\"Employee\">${empSummary.employeeName}</td>
                <td data-label=\"Total Wages\">$${totalWeeklyWages}</td>
                <td data-label=\"Tips for Taxes\">$${totalWeeklyTipsForTaxes}</td>
                <td data-label=\"Tips on Check\">$${totalWeeklyTipsOnCheck}</td>
                <td data-label=\"Total Payout\"><strong>$${totalWeeklyPayoutOnCheck}</strong></td>
            </tr>`;
        });
        weeklyHTML += `</tbody></table></div>`;
    } else {
        weeklyHTML += `<p><em>No employee activity recorded for this week to summarize.</em></p>`;
    }
    weeklyHTML += `<hr style=\"margin: 25px 0; border-top: 2px dashed var(--border-color);\">`;

    const daysOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let hasDailyData = false;

    for (let i = 0; i < 7; i++) {
        const currDayProc = new Date(weekStartObj);
        console.log("[LOG ui-data-reports.js] Loop iteration", i, "weekStartObj before getUTCDate:", weekStartObj, "Type:", typeof weekStartObj, "IsDate:", weekStartObj instanceof Date);
        currDayProc.setUTCDate(weekStartObj.getUTCDate() + i);
        const dStr = formatDate(currDayProc);
        const dayName = daysOfWeekNames[currDayProc.getUTCDay()];
        weeklyHTML += `<h4 class=\"report-day-header\">${dayName}, ${formatDisplayDate(dStr)}</h4>`;

        const procShiftsToday = dailyShiftsByDate[dStr] || [];
        procShiftsToday.sort((a, b) => sortEmployeesByName(a, b, 'employeeName'));

        if (procShiftsToday.length === 0) {
            weeklyHTML += "<p><em>No shifts logged.</em></p>";
            continue;
        }
        hasDailyData = true;

        weeklyHTML += `<div class=\"data-table-container\" style=\"overflow-x:auto;\"><table class=\"data-results-table\">
            <thead><tr>
                <th>Emp</th><th>Position</th><th>Shift Time</th><th>Hrs</th><th>Wage</th><th>Sales</th><th>CC Tips</th><th>Cash Tips</th><th>Tip Out</th><th>Tip In</th><th>Tips for Taxes</th><th>Action</th>
            </tr></thead><tbody>`;
        procShiftsToday.forEach(ps => {
            weeklyHTML += `<tr>
                <td data-label=\"Emp\" title=\"${ps.employeeName}\">${ps.employeeName.length > 18 ? ps.employeeName.substring(0, 16) + "..." : ps.employeeName}</td>
                <td data-label=\"Position\">${ps.positionWorked}</td>
                <td data-label=\"Shift Time\">${formatTimeTo12Hour(ps.timeIn)}-${formatTimeTo12Hour(ps.timeOut)}</td>
                <td data-label=\"Hrs\">${ps.hoursWorked.toFixed(2)}</td>
                <td data-label=\"Wage\">$${ps.shiftWage.toFixed(2)}</td>
                <td data-label=\"Sales\">${ps.positionWorked === "Server" ? `$${(ps.totalSales || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label=\"CC Tips\">${ps.positionWorked === "Server" ? `$${(ps.ccTips || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label=\"Cash Tips\">${ps.positionWorked === "Server" ? `$${(ps.cashTips || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label=\"Tip Out\">${ps.positionWorked === "Server" ? `$${(ps.tipOutGiven || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label=\"Tip In\">${ps.positionWorked !== "Server" ? `$${(ps.tipInReceived || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label=\"Tips for Taxes\">$${(ps.tipsForTaxes || 0).toFixed(2)}</td>
                <td data-label=\"Action\">
                    <button class=\"button small-action-btn edit-shift-from-weekly-btn\"
                            data-shift-id=\"${ps.id}\" data-date=\"${ps.date}\" data-empid=\"${ps.employeeId}\" data-positioncontext=\"${ps.positionWorked}\" 
                            style=\"font-size: 0.8em; padding: 4px 6px; margin-top:0; background-color: var(--accent-black);\" title=\"Edit this shift\">
                        Edit
                    </button>
                </td>
            </tr>`;
        });
        weeklyHTML += `</tbody></table></div>`;
    }
    reportOutputContainer.innerHTML = weeklyHTML;

    reportOutputContainer.querySelectorAll('.edit-shift-from-weekly-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const shiftId = button.dataset.shiftId;
            const shiftDate = button.dataset.date;
            const employeeId = button.dataset.empid;
            const positionContext = button.dataset.positioncontext;
            if (onEditShiftCallback) {
                onEditShiftCallback(shiftId, shiftDate, employeeId, positionContext);
            }
        });
    });
    return hasDailyData;
}

// Note: The following functions were listed in the plan but not found in the provided ui.js content:
// updateShiftTotalsDisplay
// updateDailyScoopTotals
// updateWeeklyReportDataView
// updateDataManagementUI
// renderTipPoolBreakdownTable
// renderServerSpecificBreakdownTable
// renderPayPeriodReportTable
// renderEmployeePaySummaryTable
// If these functions exist elsewhere or were intended to be new, they need to be defined.
// For now, only renderDailyPayoutResults and generateWeeklyReportContentUI are moved.

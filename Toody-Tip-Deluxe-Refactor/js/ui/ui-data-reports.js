import { domElements } from '../domElements.js';
import { formatDate, formatDisplayDate, sortEmployeesByName, formatTimeTo12Hour } from '../utils.js';
import * as state from '../state.js';

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
    const positionOrder = ["Server", "Busser", "Food Runner", "Shake Spinner", "Host", ...state.state.jobPositions.filter(p => !["Server", "Busser", "Food Runner", "Shake Spinner", "Host"].includes(p))];

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
    let hasDailyData = false;    for (let i = 0; i < 7; i++) {
        const currDayProc = new Date(weekStartObj);
        currDayProc.setUTCDate(weekStartObj.getUTCDate() + i);
        const dStr = formatDate(currDayProc);
        const dayName = daysOfWeekNames[currDayProc.getUTCDay()];          const procShiftsToday = dailyShiftsByDate[dStr] || [];
        procShiftsToday.sort((a, b) => sortEmployeesByName(a, b, 'employeeName'));        const hasShiftsToday = procShiftsToday.length > 0;
        const dayId = `day-${dStr}`;
        const dayContentId = `day-content-${dStr}`;
        const initiallyExpanded = hasShiftsToday; // Days with shifts start expanded
        
        console.log(`UI_LOG: Day ${dayName} (${dStr}): hasShifts=${hasShiftsToday}, shifts=${procShiftsToday.length}, initiallyExpanded=${initiallyExpanded}`);
          // Create collapsible day header
        weeklyHTML += `<h4 class="report-day-header collapsible-header" 
                           role="button" 
                           aria-expanded="${initiallyExpanded ? 'true' : 'false'}" 
                           aria-controls="${dayContentId}"
                           tabindex="0"
                           data-day-date="${dStr}">
                           ${dayName}, ${formatDisplayDate(dStr)}
                           <span class="collapse-indicator">${initiallyExpanded ? '-' : '+'}</span>
                       </h4>`;
        
        // Create collapsible day content
        weeklyHTML += `<div class="collapsible-content day-content" 
                           id="${dayContentId}" 
                           style="display: ${initiallyExpanded ? 'block' : 'none'};">`;

        console.log(`UI_LOG: Generated HTML for ${dayName}: aria-expanded="${initiallyExpanded ? 'true' : 'false'}", display: ${initiallyExpanded ? 'block' : 'none'}, indicator: ${initiallyExpanded ? '-' : '+'}`);

        if (procShiftsToday.length === 0) {
            weeklyHTML += "<p><em>No shifts logged.</em></p>";
        } else {
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
        
        weeklyHTML += `</div>`; // Close day content div
    }    reportOutputContainer.innerHTML = weeklyHTML;

    // Add event listeners for edit buttons
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
    });    // Use requestAnimationFrame for better DOM readiness and add retry mechanism
    requestAnimationFrame(() => {
        attachDayHeaderEventListeners(reportOutputContainer, 0);
    });

    return hasDailyData;
}

// Enhanced function to attach day header event listeners with retry mechanism
function attachDayHeaderEventListeners(container, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 100;
      // Add event listeners for collapsible day headers
    const dayHeaders = container.querySelectorAll('.report-day-header.collapsible-header');
    console.log(`UI_LOG: Found ${dayHeaders.length} collapsible day headers to attach listeners to (attempt ${retryCount + 1})`);
    
    // First, verify the initial state of all headers
    dayHeaders.forEach((header, index) => {
        const indicator = header.querySelector('.collapse-indicator');
        const contentId = header.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        const ariaExpanded = header.getAttribute('aria-expanded');
        
        console.log(`UI_LOG: Initial state check - Header ${index + 1}: aria-expanded="${ariaExpanded}", indicator="${indicator ? indicator.textContent : 'N/A'}", content.display="${content ? content.style.display : 'N/A'}"`);
    });
    
    // If no headers found and we haven't exceeded retry limit, try again
    if (dayHeaders.length === 0 && retryCount < maxRetries) {
        console.log(`UI_LOG: No day headers found, retrying in ${retryDelay}ms...`);
        setTimeout(() => {
            attachDayHeaderEventListeners(container, retryCount + 1);
        }, retryDelay);
        return;
    }      dayHeaders.forEach((header, index) => {
        // Check if listener is already attached to avoid duplicates
        if (header.hasAttribute('data-listener-attached')) {
            console.log(`UI_LOG: Listener already attached to day header ${index + 1}, skipping`);
            return;
        }
          console.log(`UI_LOG: Attaching listener to day header ${index + 1}:`, header.textContent.trim());
        
        // Mark this header as having a listener attached
        header.setAttribute('data-listener-attached', 'true');
          header.addEventListener('click', (event) => {
            const headerText = header.textContent.trim();
            const contentId = header.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            const indicator = header.querySelector('.collapse-indicator');
            
            console.log('UI_LOG: Day header clicked:', headerText);
            console.log('UI_LOG: Before toggle - aria-expanded:', header.getAttribute('aria-expanded'));
            console.log('UI_LOG: Before toggle - indicator text:', indicator ? indicator.textContent : 'N/A');
            console.log('UI_LOG: Before toggle - content display:', content ? content.style.display : 'N/A');
            
            event.preventDefault();
            event.stopPropagation();
            
            if (content) {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                const newExpanded = !isExpanded;
                
                console.log(`UI_LOG: Toggling from ${isExpanded} to ${newExpanded}`);
                
                header.setAttribute('aria-expanded', newExpanded.toString());
                content.style.display = newExpanded ? 'block' : 'none';
                if (indicator) {
                    indicator.textContent = newExpanded ? '-' : '+';
                }
                
                console.log('UI_LOG: After toggle - aria-expanded:', header.getAttribute('aria-expanded'));
                console.log('UI_LOG: After toggle - indicator text:', indicator ? indicator.textContent : 'N/A');
                console.log('UI_LOG: After toggle - content display:', content ? content.style.display : 'N/A');
                console.log('UI_LOG: Toggle complete');
            } else {
                console.error('UI_LOG: Content element not found for ID:', contentId);
            }
        });// Add keyboard support (Enter and Space)
        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                header.click();
            }
        });
    });
}

// Public function to ensure day header event listeners are attached
// This can be called externally to ensure listeners are working
export function ensureDayHeaderEventListeners() {
    const weeklyReportContainer = document.getElementById('reportOutput'); // Fixed: use 'reportOutput' not 'reportOutputDiv'
    if (weeklyReportContainer) {
        console.log('UI_LOG: ensureDayHeaderEventListeners called - attempting to attach listeners');
        requestAnimationFrame(() => {
            attachDayHeaderEventListeners(weeklyReportContainer, 0);
        });
    } else {
        console.log('UI_LOG: ensureDayHeaderEventListeners - reportOutput element not found');
    }
}

// Add a mutation observer to watch for changes in the Weekly Rewind content
function setupWeeklyRewindMutationObserver() {
    const weeklyReportContainer = document.getElementById('reportOutputDiv');
    if (weeklyReportContainer && !weeklyReportContainer.hasAttribute('data-observer-attached')) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.target === weeklyReportContainer) {
                    console.log('UI_LOG: Weekly Rewind content changed, ensuring day header event listeners');
                    // Delay to ensure DOM is fully updated
                    setTimeout(() => {
                        ensureDayHeaderEventListeners();
                    }, 50);
                }
            });
        });
        
        observer.observe(weeklyReportContainer, {
            childList: true,
            subtree: false
        });
        
        weeklyReportContainer.setAttribute('data-observer-attached', 'true');
        console.log('UI_LOG: Mutation observer attached to Weekly Rewind container');
    }
}

// Call this during initialization
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupWeeklyRewindMutationObserver, 1000);
    });
}

// Debug function to check current state of all day headers
window.debugDayHeaders = function() {
    const container = document.getElementById('reportOutput');
    if (!container) {
        console.log('DEBUG: reportOutput container not found');
        return;
    }
    
    const dayHeaders = container.querySelectorAll('.report-day-header.collapsible-header');
    console.log(`DEBUG: Found ${dayHeaders.length} day headers`);
    
    dayHeaders.forEach((header, index) => {
        const indicator = header.querySelector('.collapse-indicator');
        const contentId = header.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        const ariaExpanded = header.getAttribute('aria-expanded');
        const hasListener = header.hasAttribute('data-listener-attached');
        
        console.log(`DEBUG: Header ${index + 1} (${header.textContent.split(',')[0]}):`, {
            'aria-expanded': ariaExpanded,
            'indicator': indicator ? indicator.textContent : 'N/A',
            'content.display': content ? content.style.display : 'N/A',
            'content.computed': content ? window.getComputedStyle(content).display : 'N/A',
            'hasListener': hasListener
        });
    });
};

// Add attribute monitoring to detect when day headers are being modified
function monitorDayHeaderChanges() {
    const container = document.getElementById('reportOutput');
    if (!container) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.target.classList.contains('report-day-header') &&
                (mutation.attributeName === 'aria-expanded' || mutation.attributeName === 'data-listener-attached')) {
                console.log('UI_LOG: ATTRIBUTE CHANGE DETECTED on day header:', {
                    element: mutation.target.textContent.split(',')[0],
                    attribute: mutation.attributeName,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.getAttribute(mutation.attributeName)
                });
                
                // Also log the current state of indicator and content
                const indicator = mutation.target.querySelector('.collapse-indicator');
                const contentId = mutation.target.getAttribute('aria-controls');
                const content = document.getElementById(contentId);
                console.log('UI_LOG: Current state after attribute change:', {
                    indicator: indicator ? indicator.textContent : 'N/A',
                    contentDisplay: content ? content.style.display : 'N/A'
                });
            }
            
            if (mutation.type === 'childList' && 
                mutation.target.classList.contains('collapse-indicator')) {
                console.log('UI_LOG: INDICATOR TEXT CHANGE DETECTED:', {
                    element: mutation.target.parentElement.textContent.split(',')[0],
                    newText: mutation.target.textContent
                });
            }
        });
    });
    
    observer.observe(container, {
        attributes: true,
        attributeOldValue: true,
        childList: true,
        subtree: true,
        attributeFilter: ['aria-expanded', 'data-listener-attached']
    });
    
    console.log('UI_LOG: Mutation observer attached to monitor day header changes');
}

// Start monitoring after DOM is ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(monitorDayHeaderChanges, 500);
    });
}

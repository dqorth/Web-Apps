// js/reports.js
window.reports = (() => {
    let dom = {}; // To store DOM elements for reports section

    function cacheDom() {
        dom.reportTypeSelect = document.getElementById('reportTypeSelect');
        dom.reportDateSelect = document.getElementById('reportDateSelect'); // For weekly/specific date reports
        dom.reportStartDate = document.getElementById('reportStartDate'); // For custom range
        dom.reportEndDate = document.getElementById('reportEndDate');   // For custom range
        dom.generateReportButton = document.getElementById('generateReportButton');
        dom.exportReportButton = document.getElementById('exportReportButton');
        dom.reportOutput = document.getElementById('reportOutput');
        dom.reportContent = document.getElementById('reportContent'); // The actual table/data goes here
        dom.reportSummary = document.getElementById('reportSummary'); // Summary figures
        dom.payPeriodDisplay = document.getElementById('payPeriodDisplay'); // To show current pay period
        dom.weekSelectorContainer = document.getElementById('weekSelectorContainer');
        dom.customDateRangeContainer = document.getElementById('customDateRangeContainer');

        // console.log("[reports.js] DOM cached:", dom);
    }

    function bindEvents() {
        if (dom.generateReportButton) {
            dom.generateReportButton.addEventListener('click', generateReport);
        }
        if (dom.exportReportButton) {
            dom.exportReportButton.addEventListener('click', exportReportData);
        }
        if (dom.reportTypeSelect) {
            dom.reportTypeSelect.addEventListener('change', handleReportTypeChange);
        }
        if (dom.reportDateSelect) {
            // This might be dynamically populated or its change handled by generateReport
            // For now, direct generation is tied to the button.
        }
        // console.log("[reports.js] Events bound.");
    }

    function handleReportTypeChange() {
        const type = dom.reportTypeSelect ? dom.reportTypeSelect.value : 'weekly';
        if (dom.weekSelectorContainer) dom.weekSelectorContainer.style.display = type === 'weekly' ? 'block' : 'none';
        if (dom.customDateRangeContainer) dom.customDateRangeContainer.style.display = type === 'custom' ? 'block' : 'none';
        // Pay period reports don't need extra date pickers if pay period is predefined in settings
        // Or, they might need a selector if multiple pay periods are stored/selectable.
        // For now, assume pay period is from settings.
        if (dom.reportOutput) dom.reportOutput.style.display = 'none'; // Hide old report
        if (dom.reportContent) dom.reportContent.innerHTML = '';
        if (dom.reportSummary) dom.reportSummary.innerHTML = '';
    }

    function initializeReportDate() {
        if (dom.reportDateSelect) {
            dom.reportDateSelect.value = window.utils.formatDate(new Date());
        }
        if (dom.reportStartDate && dom.reportEndDate) {
            const today = window.utils.formatDate(new Date());
            dom.reportStartDate.value = today;
            dom.reportEndDate.value = today;
        }
        updatePayPeriodDisplay();
        handleReportTypeChange(); // Set initial visibility of date pickers
    }

    function updatePayPeriodDisplay() {
        const state = window.appState.getState();
        if (dom.payPeriodDisplay && state.settings.payPeriodStartDate && state.settings.payPeriodEndDate) {
            const start = window.utils.formatDate(state.settings.payPeriodStartDate);
            const end = window.utils.formatDate(state.settings.payPeriodEndDate);
            dom.payPeriodDisplay.textContent = `Current Pay Period: ${start} to ${end}`;
        } else if (dom.payPeriodDisplay) {
            dom.payPeriodDisplay.textContent = 'Pay period not set in settings.';
        }
    }

    function getEmployeeName(employeeId) {
        const state = window.appState.getState();
        const employee = state.employees.find(emp => emp.id === employeeId);
        return employee ? employee.name : 'Unknown Employee';
    }

    function generateReport() {
        if (!dom.reportTypeSelect) {
            console.error("[reports.js] Report type select not found.");
            window.utils.showCustomModal('Error: Report type selector not found.', 'error');
            return;
        }
        const reportType = dom.reportTypeSelect.value;
        const allShifts = window.appState.getState().shifts;
        let filteredShifts = [];
        let reportTitle = '';
        let dateRange = {};

        window.utils.showLoadingIndicator(true);

        // Ensure dates are parsed correctly for comparison
        const parseDateForComparison = (dateStr) => new Date(dateStr + 'T00:00:00'); // Ensure local timezone by avoiding Z

        try {
            switch (reportType) {
                case 'weekly':
                    if (!dom.reportDateSelect || !dom.reportDateSelect.value) {
                        window.utils.showCustomModal('Please select a date for the weekly report.', 'warning');
                        window.utils.showLoadingIndicator(false);
                        return;
                    }
                    const selectedDate = dom.reportDateSelect.value;
                    const weekInfo = window.utils.getWeekRangeFromDate(selectedDate);
                    if (!weekInfo) {
                        window.utils.showCustomModal('Invalid date for weekly report.', 'error');
                        window.utils.showLoadingIndicator(false);
                        return;
                    }
                    dateRange.start = parseDateForComparison(weekInfo.start);
                    dateRange.end = parseDateForComparison(weekInfo.end);
                    reportTitle = `Weekly Report (${weekInfo.start} - ${weekInfo.end}, Week ${weekInfo.week}, ${weekInfo.year})`;
                    break;
                case 'payPeriod':
                    const settings = window.appState.getState().settings;
                    if (!settings.payPeriodStartDate || !settings.payPeriodEndDate) {
                        window.utils.showCustomModal('Pay period start and end dates are not set in settings.', 'warning');
                        window.utils.showLoadingIndicator(false);
                        return;
                    }
                    dateRange.start = parseDateForComparison(settings.payPeriodStartDate);
                    dateRange.end = parseDateForComparison(settings.payPeriodEndDate);
                    reportTitle = `Pay Period Report (${window.utils.formatDate(dateRange.start)} - ${window.utils.formatDate(dateRange.end)})`;
                    break;
                case 'custom':
                    if (!dom.reportStartDate || !dom.reportStartDate.value || !dom.reportEndDate || !dom.reportEndDate.value) {
                        window.utils.showCustomModal('Please select a start and end date for the custom report.', 'warning');
                        window.utils.showLoadingIndicator(false);
                        return;
                    }
                    dateRange.start = parseDateForComparison(dom.reportStartDate.value);
                    dateRange.end = parseDateForComparison(dom.reportEndDate.value);
                    if (dateRange.end < dateRange.start) {
                        window.utils.showCustomModal('End date cannot be before start date for custom report.', 'warning');
                        window.utils.showLoadingIndicator(false);
                        return;
                    }
                    reportTitle = `Custom Report (${window.utils.formatDate(dateRange.start)} - ${window.utils.formatDate(dateRange.end)})`;
                    break;
                default:
                    window.utils.showCustomModal('Invalid report type selected.', 'error');
                    window.utils.showLoadingIndicator(false);
                    return;
            }

            // Filter shifts based on the determined date range
            // Ensure shift dates are also parsed correctly for comparison
            filteredShifts = allShifts.filter(shift => {
                const shiftDate = parseDateForComparison(shift.date);
                return shiftDate >= dateRange.start && shiftDate <= dateRange.end;
            });

            // console.log("[reports.js] Generating report:", reportType, "Date range:", dateRange, "All shifts:", allShifts.length, "Filtered shifts:", filteredShifts.length);

            displayReport(filteredShifts, reportTitle);
            if (dom.exportReportButton) dom.exportReportButton.style.display = filteredShifts.length > 0 ? 'inline-block' : 'none';

        } catch (error) {
            console.error("[reports.js] Error generating report:", error);
            window.utils.showCustomModal(`Error generating report: ${error.message}`, 'error');
        } finally {
            window.utils.showLoadingIndicator(false);
        }
    }

    function displayReport(shifts, title) {
        if (!dom.reportContent || !dom.reportSummary || !dom.reportOutput) {
            console.error("[reports.js] Report display elements not found.");
            return;
        }

        dom.reportContent.innerHTML = ''; // Clear previous report
        dom.reportSummary.innerHTML = '';

        const reportTitleElement = dom.reportOutput.querySelector('h3');
        if (reportTitleElement) {
            reportTitleElement.textContent = title;
        }

        if (shifts.length === 0) {
            dom.reportContent.innerHTML = '<p>No data available for the selected period.</p>';
            dom.reportOutput.style.display = 'block';
            return;
        }

        // Group shifts by employee for better readability
        const shiftsByEmployee = shifts.reduce((acc, shift) => {
            const empId = shift.employeeId;
            if (!acc[empId]) {
                acc[empId] = {
                    name: getEmployeeName(empId),
                    shifts: [],
                    totalHours: 0,
                    totalCashTips: 0,
                    totalCreditTips: 0,
                    totalTips: 0,
                    totalGrossPay: 0
                };
            }
            acc[empId].shifts.push(shift);
            acc[empId].totalHours += parseFloat(shift.hoursWorked) || 0;
            acc[empId].totalCashTips += parseFloat(shift.cashTips) || 0;
            acc[empId].totalCreditTips += parseFloat(shift.creditTips) || 0;
            acc[empId].totalTips += parseFloat(shift.totalTips) || 0;
            acc[empId].totalGrossPay += parseFloat(shift.totalPay) || 0;
            return acc;
        }, {});

        let grandTotalHours = 0;
        let grandTotalCashTips = 0;
        let grandTotalCreditTips = 0;
        let grandTotalTips = 0;
        let grandTotalGrossPay = 0;

        const table = document.createElement('table');
        table.className = 'report-table';
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const headers = ['Date', 'Employee', 'Position', 'Time In', 'Time Out', 'Hours', 'Cash Tips', 'Credit Tips', 'Total Tips', 'Pay Rate', 'Gross Pay', 'Paid?'];
        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();

        // Sort shifts by date before displaying
        shifts.sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime));

        shifts.forEach(shift => {
            const row = tbody.insertRow();
            row.insertCell().textContent = window.utils.formatDate(shift.date);
            row.insertCell().textContent = getEmployeeName(shift.employeeId);
            row.insertCell().textContent = shift.position;
            row.insertCell().textContent = window.utils.formatTimeTo12Hour(shift.startTime);
            row.insertCell().textContent = window.utils.formatTimeTo12Hour(shift.endTime);
            row.insertCell().textContent = (parseFloat(shift.hoursWorked) || 0).toFixed(2);
            row.insertCell().textContent = `$${(parseFloat(shift.cashTips) || 0).toFixed(2)}`;
            row.insertCell().textContent = `$${(parseFloat(shift.creditTips) || 0).toFixed(2)}`;
            row.insertCell().textContent = `$${(parseFloat(shift.totalTips) || 0).toFixed(2)}`;
            row.insertCell().textContent = `$${(parseFloat(shift.payRate) || 0).toFixed(2)}`;
            row.insertCell().textContent = `$${(parseFloat(shift.totalPay) || 0).toFixed(2)}`;
            row.insertCell().textContent = shift.isPaid ? 'Yes' : 'No';

            grandTotalHours += parseFloat(shift.hoursWorked) || 0;
            grandTotalCashTips += parseFloat(shift.cashTips) || 0;
            grandTotalCreditTips += parseFloat(shift.creditTips) || 0;
            grandTotalTips += parseFloat(shift.totalTips) || 0;
            grandTotalGrossPay += parseFloat(shift.totalPay) || 0;
        });

        dom.reportContent.appendChild(table);

        // Display Summary
        let summaryHTML = `<h4>Report Summary:</h4>
                           <p>Total Hours Worked: <strong>${grandTotalHours.toFixed(2)}</strong></p>
                           <p>Total Cash Tips: <strong>$${grandTotalCashTips.toFixed(2)}</strong></p>
                           <p>Total Credit Tips: <strong>$${grandTotalCreditTips.toFixed(2)}</strong></p>
                           <p>Total All Tips: <strong>$${grandTotalTips.toFixed(2)}</strong></p>
                           <p>Total Gross Pay (incl. tips): <strong>$${grandTotalGrossPay.toFixed(2)}</strong></p>`;
        
        summaryHTML += '<h4>Totals by Employee:</h4><ul class="employee-summary-list">';
        for (const empId in shiftsByEmployee) {
            const empData = shiftsByEmployee[empId];
            summaryHTML += `<li><strong>${empData.name}:</strong> 
                            Hours: ${empData.totalHours.toFixed(2)}, 
                            Tips: $${empData.totalTips.toFixed(2)}, 
                            Gross Pay: $${empData.totalGrossPay.toFixed(2)}
                          </li>`;
        }
        summaryHTML += '</ul>';

        dom.reportSummary.innerHTML = summaryHTML;
        dom.reportOutput.style.display = 'block';
    }

    function exportReportData() {
        if (!dom.reportContent || !dom.reportContent.querySelector('table')) {
            window.utils.showCustomModal('No report data to export.', 'info');
            return;
        }

        const reportTitleElement = dom.reportOutput.querySelector('h3');
        const reportName = reportTitleElement ? reportTitleElement.textContent.replace(/[^a-z0-9_\-]+/gi, '_') : 'Tip_Report';

        window.utils.showLoadingIndicator(true);
        try {
            const table = dom.reportContent.querySelector('table');
            const wb = XLSX.utils.table_to_book(table, { sheet: "ReportData" });
            
            // Add summary sheet if summary data exists
            if (dom.reportSummary && dom.reportSummary.children.length > 0) {
                const summaryData = [];
                summaryData.push([reportTitleElement ? reportTitleElement.textContent : 'Report Summary']); // Title for summary
                summaryData.push([]); // Empty row for spacing

                const summaryPs = dom.reportSummary.querySelectorAll('p');
                summaryPs.forEach(p => {
                    const parts = p.textContent.split(':');
                    if (parts.length === 2) {
                        summaryData.push([parts[0].trim(), parts[1].trim()]);
                    }
                });

                const employeeSummaries = dom.reportSummary.querySelectorAll('.employee-summary-list li');
                if (employeeSummaries.length > 0) {
                    summaryData.push([]); // Empty row
                    summaryData.push(['Employee Summaries']);
                    employeeSummaries.forEach(li => {
                        summaryData.push([li.textContent.trim()]); // Keep it simple, or parse further
                    });
                }

                const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws_summary, "ReportSummary");
            }

            XLSX.writeFile(wb, `${reportName}.xlsx`);
            window.utils.showCustomModal('Report exported successfully!', 'success');
        } catch (error) {
            console.error("[reports.js] Error exporting report data:", error);
            window.utils.showCustomModal(`Error exporting report: ${error.message}`, 'error');
        } finally {
            window.utils.showLoadingIndicator(false);
        }
    }

    function init() {
        // console.log("[reports.js] Initializing...");
        cacheDom();
        bindEvents();
        initializeReportDate();
        window.appState.subscribe((state, changes) => {
            if (changes.event === 'stateLoaded' || (changes.updated && changes.updated.includes('settings'))) {
                updatePayPeriodDisplay();
            }
            // Potentially auto-refresh report if relevant data changes and a report is currently displayed
            // For now, reports are manually generated.
        });
        // console.log("[reports.js] Initialization complete.");
    }

    // Public API
    return {
        init,
        generateReport, // Expose if needed to be called from elsewhere, though usually UI driven
        getEmployeeName // Helper, might be useful for other modules if they don't want to hit appState directly
    };
})();

// Initialize reports module when the DOM is ready
// document.addEventListener('DOMContentLoaded', window.reports.init);
// This will be called from main.js

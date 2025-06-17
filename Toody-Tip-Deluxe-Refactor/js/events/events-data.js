import { domElements } from '../domElements.js';
import { state, setEmployeeRoster, setDailyShifts } from '../state.js'; // Use unified state object
import { calculateAndUpdateCurrentDate } from './events-date-time.js'; // Added for UI refresh
import { runTipAndWageCalculationsForDay } from '../calculations.js'; // Import calculations
import { formatDate, formatTimeTo12Hour, sortEmployeesByName } from '../utils.js'; // Import utilities
// import * as ui from '../ui/ui-core.js'; // For ui.showInfoModal, if needed later

// --- File Export Handler (ExcelJS Implementation with Professional Styling) ---
function handleExportToXLSX(event) {
    console.log("APP_LOG: Starting ExcelJS export with professional styling... [VERSION 2025-06-16-21:00]");
    
    try {
        // Get current report data from state
        const currentReportWeekStartDate = state.currentReportWeekStartDate;
        const dailyShifts = state.dailyShifts;
        
        if (!currentReportWeekStartDate) {
            console.warn("No report week selected for export");
            // ui.showInfoModal("Please select a week to generate report before exporting.");
            return;
        }

        // Create workbook with ExcelJS
        const workbook = new ExcelJS.Workbook();
        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayValues = [1, 2, 3, 4, 5, 6, 0]; // Corresponding getUTCDay values for Mon-Sun

        // Professional styling definitions
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD32F2F' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'medium', color: { argb: 'FF000000' } },
                left: { style: 'medium', color: { argb: 'FF000000' } },
                bottom: { style: 'medium', color: { argb: 'FF000000' } },
                right: { style: 'medium', color: { argb: 'FF000000' } }
            }
        };

        const evenRowStyle = {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } },
            border: {
                top: { style: 'thin', color: { argb: 'FF808080' } },
                left: { style: 'thin', color: { argb: 'FF808080' } },
                bottom: { style: 'thin', color: { argb: 'FF808080' } },
                right: { style: 'thin', color: { argb: 'FF808080' } }
            }
        };

        const oddRowStyle = {
            border: {
                top: { style: 'thin', color: { argb: 'FF808080' } },
                left: { style: 'thin', color: { argb: 'FF808080' } },
                bottom: { style: 'thin', color: { argb: 'FF808080' } },
                right: { style: 'thin', color: { argb: 'FF808080' } }
            }
        };

        // 1. Create daily sheets (Mon-Sun)
        for (let i = 0; i < 7; i++) {
            const dayToProcess = new Date(currentReportWeekStartDate);
            dayToProcess.setUTCDate(currentReportWeekStartDate.getUTCDate() + i);
            const dayString = formatDate(dayToProcess);
            const sheetName = daysOrder[dayValues.indexOf(dayToProcess.getUTCDay())] || `Day ${i+1}`;

            const shiftsForDay = dailyShifts[dayString] || [];
            const worksheet = workbook.addWorksheet(sheetName);
            
            const dailyHeaders = ["Emp", "Position", "Shift Time", "Hrs", "Wage", "Total Sales", "CC Tips", "Cash Tips", "Tip Out", "Tip In", "Tips for Taxes"];
            
            // Add headers
            worksheet.addRow(dailyHeaders);
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.style = headerStyle;
            });

            let rowIndex = 2;
            if (shiftsForDay.length > 0) {
                const processedDailyShifts = runTipAndWageCalculationsForDay(shiftsForDay);
                processedDailyShifts.sort((a,b) => sortEmployeesByName(a,b,'employeeName'));
                
                processedDailyShifts.forEach(ps => {
                    const rowData = [
                        ps.employeeName,
                        ps.positionWorked,
                        `${formatTimeTo12Hour(ps.timeIn)}-${formatTimeTo12Hour(ps.timeOut)}`,
                        ps.hoursWorked,
                        ps.shiftWage,
                        ps.positionWorked === "Server" ? (ps.totalSales || 0) : '',
                        ps.positionWorked === "Server" ? (ps.ccTips || 0) : '',
                        ps.positionWorked === "Server" ? (ps.cashTips || 0) : '',
                        ps.positionWorked === "Server" ? (ps.tipOutGiven || 0) : '',
                        ps.positionWorked !== "Server" ? (ps.tipInReceived || 0) : '',
                        (ps.tipsForTaxes || 0)
                    ];
                    
                    worksheet.addRow(rowData);
                    const currentRow = worksheet.getRow(rowIndex);
                    
                    // Apply zebra striping and borders
                    const rowStyle = rowIndex % 2 === 0 ? evenRowStyle : oddRowStyle;
                    currentRow.eachCell((cell, colNumber) => {
                        cell.style = { ...rowStyle };
                        
                        // Apply number formatting for numeric columns
                        if (colNumber === 4) { // Hours
                            cell.numFmt = '0.00';
                        } else if (colNumber >= 5 && colNumber <= 11) { // Currency columns
                            cell.numFmt = '"$"#,##0.00';
                        }
                        
                        // Center alignment for specific columns
                        if (colNumber === 2 || colNumber === 3) { // Position, Shift Time
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        } else if (colNumber >= 4) { // Numeric columns
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                    });
                    
                    rowIndex++;
                });
            } else {
                worksheet.addRow(["No shifts logged for this day."]);
                const noDataRow = worksheet.getRow(2);
                noDataRow.getCell(1).style = oddRowStyle;
            }

            // Auto-fit columns
            worksheet.columns.forEach((column, index) => {
                let maxLength = dailyHeaders[index] ? dailyHeaders[index].length : 10;
                
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header
                        const cell = row.getCell(index + 1);
                        const cellValue = cell.value ? cell.value.toString() : '';
                        maxLength = Math.max(maxLength, cellValue.length);
                    }
                });
                
                column.width = Math.min(Math.max(maxLength + 2, 10), 20);
            });
        }

        // 2. Create weekly totals sheet
        const totalsWorksheet = workbook.addWorksheet("Week Totals");
        const weeklyTotalHeaders = ["Employee", "Total Wages", "Tips for Taxes", "Tips on Check", "Total Payout on Check"];        
        // Add headers to totals sheet
        totalsWorksheet.addRow(weeklyTotalHeaders);
        const totalsHeaderRow = totalsWorksheet.getRow(1);
        totalsHeaderRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // Calculate weekly summary data
        const weeklySummaryDataForExport = {};
        const weekStartForTotals = new Date(currentReportWeekStartDate);
        
        for (let i = 0; i < 7; i++) {
            const currentDayIter = new Date(weekStartForTotals);
            currentDayIter.setUTCDate(weekStartForTotals.getUTCDate() + i);
            const dayStr = formatDate(currentDayIter);
            const shiftsForThisDayRaw = dailyShifts[dayStr] || [];
            
            if (shiftsForThisDayRaw.length > 0) {
                const processedShiftsForDay = runTipAndWageCalculationsForDay(shiftsForThisDayRaw);
                processedShiftsForDay.forEach(pShift => {
                    if (!pShift.employeeId || !pShift.employeeName) { return; }
                    if (!weeklySummaryDataForExport[pShift.employeeId]) {
                        weeklySummaryDataForExport[pShift.employeeId] = {
                            employeeId: pShift.employeeId, 
                            employeeName: pShift.employeeName,
                            totalWeeklyWages: 0, 
                            totalWeeklyTipsForTaxes: 0,
                            totalWeeklyTipsOnCheck: 0, 
                            totalWeeklyPayoutOnCheck: 0
                        };
                    }
                    const summaryEntry = weeklySummaryDataForExport[pShift.employeeId];
                    summaryEntry.totalWeeklyWages += pShift.shiftWage;
                    summaryEntry.totalWeeklyTipsForTaxes += pShift.tipsForTaxes;
                    summaryEntry.totalWeeklyTipsOnCheck += pShift.tipsOnCheck;
                    summaryEntry.totalWeeklyPayoutOnCheck += pShift.totalPayoutOnCheck;
                });
            }
        }
        
        const employeeSummaryArrayForExport = Object.values(weeklySummaryDataForExport);
        employeeSummaryArrayForExport.sort((a, b) => sortEmployeesByName(a, b, 'employeeName'));

        let totalsRowIndex = 2;
        if (employeeSummaryArrayForExport.length > 0) {
            employeeSummaryArrayForExport.forEach(empSummary => {
                const rowData = [
                    empSummary.employeeName,
                    empSummary.totalWeeklyWages,
                    empSummary.totalWeeklyTipsForTaxes,
                    empSummary.totalWeeklyTipsOnCheck,
                    empSummary.totalWeeklyPayoutOnCheck
                ];
                
                totalsWorksheet.addRow(rowData);
                const currentRow = totalsWorksheet.getRow(totalsRowIndex);
                
                // Apply zebra striping and borders
                const rowStyle = totalsRowIndex % 2 === 0 ? evenRowStyle : oddRowStyle;
                currentRow.eachCell((cell, colNumber) => {
                    cell.style = { ...rowStyle };
                    
                    // Apply currency formatting for all numeric columns
                    if (colNumber >= 2 && colNumber <= 5) {
                        cell.numFmt = '"$"#,##0.00';
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    }
                });
                
                totalsRowIndex++;
            });
        } else {
            totalsWorksheet.addRow(["No data for this week."]);
            const noDataRow = totalsWorksheet.getRow(2);
            noDataRow.getCell(1).style = oddRowStyle;
        }

        // Auto-fit columns for totals sheet
        totalsWorksheet.columns.forEach((column, index) => {
            let maxLength = weeklyTotalHeaders[index] ? weeklyTotalHeaders[index].length : 10;
            
            totalsWorksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Skip header
                    const cell = row.getCell(index + 1);
                    const cellValue = cell.value ? cell.value.toString() : '';
                    maxLength = Math.max(maxLength, cellValue.length);
                }
            });
            
            column.width = Math.min(Math.max(maxLength + 2, 12), 25);
        });

        // Generate filename and trigger download
        const weekStartStrExport = formatDate(currentReportWeekStartDate);
        const filename = `WeeklyReport_${weekStartStrExport}.xlsx`;
        
        console.log(`APP_LOG: Downloading ExcelJS file: ${filename}`);
        
        // Write file and trigger download
        workbook.xlsx.writeBuffer().then(function(buffer) {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            
            console.log("APP_LOG: ExcelJS export completed successfully with professional styling");
            // ui.showInfoModal(`Weekly report exported successfully as ${filename}`);
        }).catch(function(error) {
            console.error("ERROR: Failed to generate Excel file buffer:", error);
            // ui.showInfoModal("Error occurred during export. Please try again.");
        });

    } catch (error) {
        console.error("ERROR: Failed to export to Excel:", error);
        // ui.showInfoModal("Error occurred during export. Please try again.");
    }
}

// --- State Download Handler ---
function handleDownloadState(event) {
    try {
        console.log("EVENT_LOG: [events-data.js] handleDownloadState called.");
        const stateToSave = {
            employeeRoster: state.employeeRoster,
            dailyShifts: state.dailyShifts
        };

        const jsonData = JSON.stringify(stateToSave, null, 2); // Pretty print JSON
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        a.download = `toody_tip_deluxe_data_${dateString}.json`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        console.log("EVENT_LOG: [events-data.js] State download successful.");
        // Optionally, show a success message to the user via ui.showInfoModal if available and desired
    } catch (error) {
        console.error("ERROR: [events-data.js] Error during state download:", error);
        // Optionally, show an error message to the user
    }
}

// --- State Load Handler ---
function handleLoadState(event) {
    console.log("EVENT_LOG: [events-data.js] handleLoadState called.");
    const file = event.target.files[0];
    if (!file) {
        console.warn("WARN: [events-data.js] No file selected for state load.");
        event.target.value = null; // Reset file input
        return;
    }

    if (file.type !== 'application/json') {
        console.error("ERROR: [events-data.js] Invalid file type. Please select a .json file.");
        alert("Invalid file type. Please select a .json file."); // Simple user feedback
        event.target.value = null; // Reset file input
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            const loadedData = JSON.parse(fileContent);

            // Validate the loaded state structure
            if (typeof loadedData === 'object' && loadedData !== null &&
                Array.isArray(loadedData.employeeRoster) &&
                typeof loadedData.dailyShifts === 'object' && loadedData.dailyShifts !== null) {

                // Update the application state
                setEmployeeRoster(loadedData.employeeRoster);
                setDailyShifts(loadedData.dailyShifts);

                console.log("EVENT_LOG: [events-data.js] State loaded and updated successfully.");
                alert("Application state loaded successfully!"); // Simple user feedback

                // Re-initialize or update UI based on the new state
                // calculateAndUpdateCurrentDate will refresh date-dependent parts of the UI
                // and trigger re-renders that use the new state.
                calculateAndUpdateCurrentDate();
                console.log("EVENT_LOG: [events-data.js] UI refresh triggered after state load.");

            } else {
                console.error("ERROR: [events-data.js] Invalid state file structure.", loadedData);
                alert("Error: Invalid state file structure. Could not load data.");
            }
        } catch (error) {
            console.error("ERROR: [events-data.js] Error parsing or processing state file:", error);
            alert("Error: Could not parse or process the state file. Ensure it is a valid JSON backup.");
        } finally {
            // Reset the file input to allow selecting the same file again if needed
            if (event.target) {
                event.target.value = null;
            }
        }
    };

    reader.onerror = function(error) {
        console.error("ERROR: [events-data.js] Error reading file:", error);
        alert("Error: Could not read the selected file.");
        if (event.target) {
            event.target.value = null; // Reset file input
        }
    };

    reader.readAsText(file);
}

export {
    handleExportToXLSX,
    handleDownloadState,
    handleLoadState
};

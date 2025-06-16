import { domElements } from '../domElements.js';
import { state, setEmployeeRoster, setDailyShifts } from '../state.js'; // Use unified state object
import { calculateAndUpdateCurrentDate } from './events-date-time.js'; // Added for UI refresh
// import * as ui from '../ui/ui-core.js'; // For ui.showInfoModal, if needed later
// import XLSX from 'xlsx'; // Future dependency for export

// --- File Export Handler (Placeholder) ---
function handleExportToXLSX(event) {
    console.warn("handleExportToXLSX is not yet implemented.");
    // TODO: Implement XLSX export logic
    // 1. Gather data for the report (e.g., weeklyEmployeeSummaryData, dailyShiftsByDate from state)
    // 2. Format data into a structure suitable for SheetJS (array of arrays or array of objects)
    // 3. Create a workbook and worksheet using SheetJS (XLSX.utils.aoa_to_sheet or XLSX.utils.json_to_sheet)
    // 4. Trigger download using XLSX.writeFile(workbook, 'filename.xlsx')
    // Ensure SheetJS library is available (e.g., via CDN or local import)
    // Example: ui.showInfoModal("Export functionality coming soon!");
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

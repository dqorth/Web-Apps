export let employeeRoster = [];
export let dailyShifts = {};

export const JOB_POSITIONS_AVAILABLE = ["Server", "Busser", "Shake Spinner", "Food Runner", "Host"];
export const BASE_CYCLE_START_DATE = new Date('2025-06-02T00:00:00Z');

export let currentReportWeekStartDate = null;
export let activeSelectedDate = null;
export let currentSelectedDayOfWeek = new Date().getUTCDay(); // 0 for Sunday, 1 for Monday, etc.

// --- TUTORIAL STATE (Potentially move to a tutorial module later) ---
export let currentTutorialSteps = [];
export let currentTutorialStepIndex = 0;
export let tutorialAnimationId = null;
export let currentTutorialTargetElement = null;

export const tutorials = {
    roster: [
        { element: '#toggleAddNewEmployeeFormBtn', title: 'Add a Hero', text: "Click here to open the form for adding a new employee to your crew." },
        { element: '#empName', title: 'Enter Name', text: "Enter the employee\'s full name here. This is how they\'ll appear in all reports." },
        { element: '#empPositionsContainer', title: 'Assign Roles', text: "Select one or more roles. An input for their hourly pay rate will appear for each role you select." },
        { element: '#addEmployeeBtn', title: 'Save New Hero', text: "Click here to save the new employee to the permanent roster." },
        { element: '#fullEmployeeRosterContainer', title: 'The Full Crew', text: "This list shows everyone currently on your roster. You can edit or remove them from here." },
        { element: '#fullEmployeeRosterContainer .edit-btn', fallbackElement: '#fullEmployeeRosterContainer', title: 'Edit a Hero', text: "Click 'Edit' to change an employee\'s name or update their roles and pay rates." },
        { element: '#fullEmployeeRosterContainer .remove-x-btn', fallbackElement: '#fullEmployeeRosterContainer', title: 'Remove a Hero', text: "Click the 'X' to permanently remove an employee and their shifts for the current day." },
        { element: '#importSectionWrapper', title: 'Import Roster', text: "You can also bulk-add employees by importing a specially formatted .txt file." },
        { element: '#goBackToLineupBtn', title: 'Back to Action', text: "When you\'re done managing the roster, click here to return to the daily shift logging view." },
    ],
    lineup: [
        { element: '.top-date-controls', title: 'Set the Date', text: "First, use these controls to select the correct payroll Cycle and Week you want to work on." },
        { element: '#lineupDayNavContainer', title: 'Select the Day', text: "Next, click a day of the week to view or log shifts for that specific date." },
        { element: '#rosterListContainer .employee-info strong', fallbackElement: '#rosterListContainer', title: 'Log a Shift', text: "Click an employee\'s name to open the form where you can log their shift details for the selected day." },
        { element: '.inline-shift-form-container', isDynamic: true, dynamicTrigger: '#rosterListContainer .employee-info strong', title: 'Enter Shift Details', text: "Enter the clock-in and clock-out times. For servers, also fill in their sales and tips." },
        { element: '.log-specific-shift-btn', isDynamic: true, dynamicTrigger: '#rosterListContainer .employee-info strong', title: 'Save the Shift', text: "Click here to save the shift. The employee\'s card will update with a summary, and the button will change to 'Edit Shift'." },
        { element: '#showAddEmployeeFormBtn', title: 'Manage Roster', text: "Need to add a new employee or edit an existing one? Click this button to jump to the Roster Management page." }
    ],
    scoop: [
        { element: '#scoopDayNavContainer', title: 'Select a Day', text: "Use these buttons to choose which day\'s results you want to see." },
        { element: '#payoutResults', title: 'Daily Payouts', text: "This table shows the calculated breakdown of wages, tips, and take-home pay for everyone who worked on the selected day." },
        { element: '.support-tip-detail', fallbackElement: '#payoutResults', title: 'Tip-In Details', text: "For support staff (like Bussers), you can see a detailed breakdown of which servers tipped them out and how much." },
        { element: '.remove-shift-from-scoop-btn', fallbackElement: '#payoutResults', title: 'Delete a Shift', text: "If a shift was logged by mistake, you can permanently remove it by clicking the 'Del' button in its row." }
    ],
    weekly: [
         { element: '.week-navigation', title: 'Navigate Weeks', text: "Use the 'Prev Week' and 'Next Week' buttons to browse through different weekly reports." },
         { element: '#reportOutput .data-table-container:first-of-type', fallbackElement: '#reportOutput', title: 'Weekly Totals', text: "This first table summarizes the total earnings (wages and tips) for each employee across the entire selected week." },
         { element: '#reportOutput .report-day-header', fallbackElement: '#reportOutput', title: 'Daily Breakdown', text: "Below the weekly summary, you\'ll find a detailed, day-by-day breakdown of all shifts that were logged." },
         { element: '.edit-shift-from-weekly-btn', fallbackElement: '#reportOutput', title: 'Quick Edit', text: "Made a mistake? Click 'Edit' on any shift in this report to instantly jump back to 'The Lineup' section with the correct form open, ready for you to make changes." },
         { element: '#exportWeeklyCSVBtn', title: 'Export to Excel', text: "Click here to download a beautifully formatted Excel file (.xlsx) of this week\'s report, complete with separate tabs for daily details and weekly totals." }
    ],
    data: [
        { element: '#downloadStateBtn', title: 'Backup Your Data', text: "Click this to save ALL your data—roster and every logged shift—to a single JSON file on your computer. It\'s a great idea to do this regularly as a backup!" },
        { element: '#loadStateFile', title: 'Restore Your Data', text: "If you need to restore your data from a backup, click here to select the `.json` file you previously saved. This will overwrite ALL current data in the app." }
    ]
};

// --- State Update Functions ---
export function setEmployeeRoster(newRoster) {
    employeeRoster = newRoster;
    saveStateToLocalStorage();
}

export function setDailyShifts(newShifts) {
    dailyShifts = newShifts;
    saveStateToLocalStorage();
}

export function updateEmployeeInRoster(updatedEmployee) {
    const index = employeeRoster.findIndex(emp => emp.id === updatedEmployee.id);
    if (index !== -1) {
        employeeRoster[index] = updatedEmployee;
        saveStateToLocalStorage();
    }
}

export function addEmployeeToRoster(newEmployee) {
    employeeRoster.push(newEmployee);
    saveStateToLocalStorage();
}

export function removeEmployeeFromRoster(employeeId) {
    employeeRoster = employeeRoster.filter(emp => emp.id !== employeeId);
    // Also remove their shifts for the active day if any
    if (activeSelectedDate && dailyShifts[activeSelectedDate]) {
        dailyShifts[activeSelectedDate] = dailyShifts[activeSelectedDate].filter(s => s.employeeId !== employeeId);
        if (dailyShifts[activeSelectedDate].length === 0) {
            delete dailyShifts[activeSelectedDate];
        }
    }
    saveStateToLocalStorage();
}

export function getEmployeeById(employeeId) {
    return employeeRoster.find(emp => emp.id === employeeId);
}

export function addOrUpdateShift(shiftData) {
    const { date, employeeId, positionWorked } = shiftData; // Added employeeId and positionWorked for new shift ID
    let { id } = shiftData; // id can be null for new shifts

    if (!dailyShifts[date]) {
        dailyShifts[date] = [];
    }

    // Generate a unique ID for new shifts
    if (!id) {
        id = `shift_${employeeId}_${positionWorked.replace(/\\s+/g, '')}_${new Date().getTime()}`;
        shiftData.id = id; // Add the new ID to the shiftData object
    }
    
    // Retrieve employee details for the shift
    const employee = employeeRoster.find(emp => emp.id === employeeId);
    if (employee) {
        shiftData.employeeName = employee.name;
        // Correctly access payRate from employee.payRates object
        if (employee.payRates && employee.payRates[positionWorked] !== undefined) {
            shiftData.shiftPayRate = employee.payRates[positionWorked];
        } else {
            console.warn(`Pay rate not found for ${employee.name} as ${positionWorked}. Defaulting to 0.`);
            shiftData.shiftPayRate = 0;
        }
    } else {
        console.warn(`Employee not found for ID ${employeeId}. Shift will lack name and pay rate.`);
        shiftData.employeeName = "Unknown Employee";
        shiftData.shiftPayRate = 0;
    }


    const existingShiftIndex = dailyShifts[date].findIndex(s => s.id === id);
    if (existingShiftIndex !== -1) {
        dailyShifts[date][existingShiftIndex] = { ...dailyShifts[date][existingShiftIndex], ...shiftData };
    } else {
        dailyShifts[date].push(shiftData);
    }
    saveStateToLocalStorage();
    // Return the modified (potentially with new ID, name, payrate) or original shiftData object
    return dailyShifts[date].find(s => s.id === id); 
}

export function removeShift(date, shiftId) {
    if (dailyShifts[date]) {
        dailyShifts[date] = dailyShifts[date].filter(s => s.id !== shiftId);
        if (dailyShifts[date].length === 0) {
            delete dailyShifts[date];
        }
        saveStateToLocalStorage();
    }
}

export function setActiveSelectedDate(newDate) {
    activeSelectedDate = newDate;
}

export function setCurrentSelectedDayOfWeek(newDayOfWeek) {
    currentSelectedDayOfWeek = newDayOfWeek;
}

export function setCurrentReportWeekStartDate(newDate) {
    currentReportWeekStartDate = newDate;
}

export function loadStateFromLocalStorage() {
    const storedRoster = localStorage.getItem('dinerTipSplit_employeeRosterV2');
    if (storedRoster) {
        employeeRoster = JSON.parse(storedRoster);
    }
    const storedShifts = localStorage.getItem('dinerTipSplit_dailyShiftsV2');
    if (storedShifts) {
        dailyShifts = JSON.parse(storedShifts);
    }
    console.log("APP_LOG: State loaded from Local Storage.");
}

export function saveStateToLocalStorage() {
    localStorage.setItem('dinerTipSplit_employeeRosterV2', JSON.stringify(employeeRoster));
    localStorage.setItem('dinerTipSplit_dailyShiftsV2', JSON.stringify(dailyShifts));
    console.log("APP_LOG: State saved to Local Storage.");
}

// Tutorial state setters
export function setCurrentTutorialSteps(steps) {
    currentTutorialSteps = steps;
}
export function setCurrentTutorialStepIndex(index) {
    currentTutorialStepIndex = index;
}
export function setTutorialAnimationId(id) {
    tutorialAnimationId = id;
}
export function setCurrentTutorialTargetElement(element) {
    currentTutorialTargetElement = element;
}

// Initial load
loadStateFromLocalStorage();
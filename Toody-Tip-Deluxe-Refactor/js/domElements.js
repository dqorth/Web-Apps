export const domElements = {
    // Main Navigation Tabs
    navLineup: document.getElementById('nav-lineup'),
    navScoop: document.getElementById('nav-scoop'),
    navWeekly: document.getElementById('nav-weekly'),
    navRoster: document.getElementById('nav-roster'),
    navData: document.getElementById('nav-data'),

    // Global Date Controls
    cycleStartDateSelect: document.getElementById('cycleStartDateSelect'),
    weekInCycleSelect: document.getElementById('weekInCycleSelect'),
    currentDateHiddenInput: document.getElementById('currentDateHidden'), // Corrected from currentDateHidden

    // Employee Management View
    employeeFormSection: document.getElementById('employeeFormSection'),
    actualFormContainer: document.getElementById('actualFormContainer'), // Added based on original_app.html
    goBackToLineupBtn: document.getElementById('goBackToLineupBtn'),
    toggleAddNewEmployeeFormBtn: document.getElementById('toggleAddNewEmployeeFormBtn'),
    addEmployeeFormWrapper: document.getElementById('addEmployeeFormWrapper'),
    empNameInput: document.getElementById('empName'),
    empPositionsContainer: document.getElementById('empPositionsContainer'),
    editingEmployeeIdInput: document.getElementById('editingEmployeeId'),
    addEmployeeBtn: document.getElementById('addEmployeeBtn'),
    updateEmployeeBtn: document.getElementById('updateEmployeeBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    employeeImportFileInput: document.getElementById('employeeImportFile'), // Corrected from employeeImportFile
    importFileName: document.getElementById('importFileName'),
    importStatusMessages: document.getElementById('importStatusMessages'),
    fullEmployeeRosterContainer: document.getElementById('fullEmployeeRosterContainer'),
    
    // Shift Logging View
    employeeLineupSection: document.getElementById('employeeLineupSection'),
    lineupDayNavContainer: document.getElementById('lineupDayNavContainer'),
    lineupDateDisplay: document.getElementById('lineupDateDisplay'),
    rosterListContainer: document.getElementById('rosterListContainer'),
    showAddEmployeeFormBtn: document.getElementById('showAddEmployeeFormBtn'),

    // Daily Report View (Payout Section)
    payoutSection: document.getElementById('payoutSection'),
    payoutContent: document.getElementById('payoutContent'), // Added
    scoopDayNavContainer: document.getElementById('scoopDayNavContainer'),
    scoopDateDisplay: document.getElementById('scoopDateDisplay'),
    payoutResultsDiv: document.getElementById('payoutResults'), // Corrected from payoutResults

    // Weekly Report View
    weeklyReportSection: document.getElementById('weeklyReportSection'),
    weeklyReportContent: document.getElementById('weeklyReportContent'), // Added
    prevWeekBtn: document.getElementById('prevWeekBtn'),
    nextWeekBtn: document.getElementById('nextWeekBtn'),
    currentlyViewedWeekDisplay: document.getElementById('currentlyViewedWeekDisplay'),
    exportWeeklyCSVBtn: document.getElementById('exportWeeklyCSVBtn'),
    reportOutputDiv: document.getElementById('reportOutput'), // Corrected from reportOutput    // Data Management View
    dataManagementSection: document.getElementById('dataManagementSection'),
    defaultPayRatesContainer: document.getElementById('defaultPayRatesContainer'),
    saveDefaultPayRatesBtn: document.getElementById('saveDefaultPayRatesBtn'),
    downloadStateBtn: document.getElementById('downloadStateBtn'),
    loadStateFileInput: document.getElementById('loadStateFile'), // Corrected from loadStateFile

    // Tutorial System
    tutorialOverlay: document.getElementById('tutorial-overlay'),
    tutorialHighlightBox: document.getElementById('tutorial-highlight-box'),
    tutorialTextBox: document.getElementById('tutorial-text-box'),
    tutorialTitle: document.getElementById('tutorial-title'),
    tutorialText: document.getElementById('tutorial-text'),
    tutorialPrevBtn: document.getElementById('tutorial-prev-btn'),
    tutorialStepCounter: document.getElementById('tutorial-step-counter'),
    tutorialNextBtn: document.getElementById('tutorial-next-btn'),
    tutorialCloseBtn: document.getElementById('tutorial-close-btn'),    // Confirmation Modal
    confirmRemoveModal: document.getElementById('confirmRemoveModal'),
    confirmRemoveMessage: document.getElementById('confirmRemoveMessage'),
    confirmRemoveBtn: document.getElementById('confirmRemoveBtn'),
    cancelRemoveBtn: document.getElementById('cancelRemoveBtn'),
    
    // Info Modal
    infoModal: document.getElementById('infoModal'),
    infoMessage: document.getElementById('infoMessage'),
    infoOkBtn: document.getElementById('infoOkBtn'),

    // Navigation Buttons (added for tutorial section visibility)
    navButtons: {
        lineup: document.getElementById('nav-lineup'),
        roster: document.getElementById('nav-roster'),
        scoop: document.getElementById('nav-scoop'),
        weekly: document.getElementById('nav-weekly'),
        data: document.getElementById('nav-data'),
        // settings: document.getElementById('nav-settings'), // Uncomment if a settings nav item exists
    },
};

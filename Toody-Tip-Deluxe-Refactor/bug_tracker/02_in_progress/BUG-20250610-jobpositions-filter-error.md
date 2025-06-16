<!-- filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\bug_tracker\01_open\BUG-20250610-jobpositions-filter-error.md -->
<!-- filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\bug_tracker\01_open\BUG-20250610-jobpositions-filter-error.md -->
---
id: BUG-20250610-jobpositions-filter-error
title: TypeError on jobPositions.filter in renderEmployeeRoster
status: Fixed
severity: high
date_reported: 2025-06-10
reporter: User
assigned_to: Unassigned
description: |
  When clicking the button to go back to the lineup view after creating a new employee, a TypeError occurs: `ui.js:113 Uncaught TypeError: jobPositions.filter is not a function or its return value is not iterable`. This happens in the `renderEmployeeRoster` function, called by `switchViewToLineup`, which is triggered by `handleGoBackToLineup`.
affected_files:
  - js/ui.js <!-- Original -->
  - js/events.js <!-- Original -->
  - js/state.js # Potentially, if jobPositions is sourced from state or appConfig
  - js/events/events-employee.js <!-- New location of handleGoBackToLineup -->
  - js/ui/ui-core.js <!-- New location of switchViewToLineup -->
  - js/ui/ui-roster.js <!-- New location of renderEmployeeRoster -->
steps_to_reproduce: |
  1. Navigate to the "Add New Employee" view.
  2. Create a new employee.
  3. Click the button to return to the lineup view (e.g., a "Go Back to Lineup" or similar button).
  4. Observe the console for the TypeError.
expected_behavior: |
  The application should return to the lineup view without errors, and the employee roster should render correctly.
actual_behavior: |
  A TypeError occurs, preventing the roster from rendering and likely breaking further UI updates.
related_issues:
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

**Attempt 1 (2025-06-10):**
*   **Action:** Modified `js/ui.js` in the `switchViewToLineup` function.
    *   Corrected the arguments passed to `renderEmployeeRoster`.
    *   Changed from: `renderEmployeeRoster(rosterContainer, employeeRosterData, activeDate, dailyShiftsData, onLogShiftClick, onEditShiftClick, jobPositions);`
    *   Changed to: `renderEmployeeRoster(rosterContainer, employeeRosterData, activeDate, dailyShiftsData, jobPositions);`
*   **Reasoning:** The original call was passing `onLogShiftClick` (a function) as the `jobPositions` argument and `onEditShiftClick` (a function) as an extra argument, while `jobPositions` (an array) was being passed as the last, unexpected argument. This caused `jobPositions.filter` to fail because `jobPositions` was a function within `renderEmployeeRoster`.
*   **Expected Outcome:** The `TypeError` should be resolved, and the employee roster should render correctly when returning to the lineup view.

**Attempt 2 (2025-06-13):**
*   **Action:** Modified `js/events.js` in the `handleGoBackToLineup` function.
    *   Corrected the arguments passed to `ui.switchViewToLineup`.
    *   Changed from: `ui.switchViewToLineup(domElements.employeeLineupSection, domElements.employeeFormSection, 'lineupContent', domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, handleRosterEmployeeClick, handleEditLoggedShiftSetup, state.JOB_POSITIONS_AVAILABLE);`
    *   Changed to: `ui.switchViewToLineup(domElements.employeeLineupSection, domElements.employeeFormSection, 'lineupContent', domElements.rosterListContainer, state.employeeRoster, state.activeSelectedDate, state.dailyShifts, state.JOB_POSITIONS_AVAILABLE);`
*   **Reasoning:** The previous attempt corrected the arguments in `ui.switchViewToLineup` but the actual incorrect arguments were being passed from `handleGoBackToLineup` in `js/events.js`. This attempt corrects the call site, ensuring that `state.JOB_POSITIONS_AVAILABLE` (an array) is passed as the `jobPositions` argument, not the callback functions `handleRosterEmployeeClick` and `handleEditLoggedShiftSetup`.
*   **Result:** Success
*   **Expected Outcome:** The `TypeError` should be resolved, and the employee roster should render correctly when returning to the lineup view.

### Post-Refactoring Update (2025-06-15)
This bug was fixed prior to the major refactoring of `js/ui.js` and `js/events.js`.
The relevant functions have since been moved to new modules:
- `handleGoBackToLineup` is now in `js/events/events-employee.js`.
- `switchViewToLineup` is now in `js/ui/ui-core.js`.
- `renderEmployeeRoster` is now in `js/ui/ui-roster.js`.

The fix remains valid in the new structure. No further action required for this bug regarding the refactor.
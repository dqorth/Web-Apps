---
id: BUG-20250618-TypeError-DailyShifts-Access
status: fixed
summary: "TypeError: Cannot read properties of undefined (reading 'undefined') at events-shift.js:57"
priority: high
assigned_to: AI
reported_by: System
date_reported: 2025-06-18
date_resolved: 2025-06-18
description: "When clicking the 'Close Shift Form' button on the employee roster, a TypeError occurs. The error is `Uncaught TypeError: Cannot read properties of undefined (reading 'undefined')` at `js/events/events-shift.js:57`."
reproduction_steps:
  1. Navigate to the employee roster view.
  2. Click on an employee to open the inline shift form (e.g., click "Log Shift").
  3. Click the "Close Shift Form" button.
  4. Observe the console for the TypeError.
expected_behavior: The shift form should close without errors, and the employee card should update correctly.
actual_behavior: A TypeError occurs, preventing the form from closing cleanly and potentially leaving the UI in an inconsistent state.
environment:
  browser: N/A
  os: N/A
  app_version: Refactor_State_Unification
notes: "The error occurs at line 57: `const existingShiftForCancel = state.dailyShifts[state.activeSelectedDate]?.find(...)`. This was due to incorrect access to `dailyShifts` and `activeSelectedDate`. They should be accessed via `state.state.dailyShifts` and `state.state.activeSelectedDate` respectively. Other state properties in the file also need checking."
resolution: "Update `js/events/events-shift.js` to correctly access `state.state.dailyShifts`, `state.state.activeSelectedDate`, and other relevant state properties. This was completed and verified."
---

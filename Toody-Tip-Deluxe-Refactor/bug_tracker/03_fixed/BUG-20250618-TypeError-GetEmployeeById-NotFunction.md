---
id: BUG-20250618-TypeError-GetEmployeeById-NotFunction
status: fixed
summary: "TypeError: state.state.getEmployeeById is not a function when logging shift"
priority: high
assigned_to: AI
reported_by: User
date_reported: 2025-06-18
date_resolved: 2025-06-18
description: "When attempting to log a new shift, a TypeError occurs because `getEmployeeById` is incorrectly called as `state.state.getEmployeeById` instead of `state.getEmployeeById`."
reproduction_steps:
  1. Navigate to the employee roster view.
  2. Click on an employee to open the inline shift form (e.g., click "Log Shift").
  3. Enter shift details (time in, time out).
  4. Click the "Log Shift" button within the inline form.
  5. Observe the console for the TypeError.
expected_behavior: The shift should be logged successfully, and the UI should update without errors.
actual_behavior: A TypeError `state.state.getEmployeeById is not a function` occurs, preventing the shift from being fully processed and the UI from updating correctly.
environment:
  browser: N/A
  os: N/A
  app_version: Refactor_State_Unification
notes: "The error was specifically at `js/events/events-shift.js:120`. The function `getEmployeeById` is a direct export from the `state.js` module and should be called as `state.getEmployeeById(employeeId)`."
resolution: "Modified `js/events/events-shift.js` at line 120 to change `state.state.getEmployeeById(employeeId)` to `state.getEmployeeById(employeeId)`. This was completed and verified."
---

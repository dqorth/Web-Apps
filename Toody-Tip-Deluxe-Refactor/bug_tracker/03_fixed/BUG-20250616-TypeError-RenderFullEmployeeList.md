---
id: BUG-20250616-TypeError-RenderFullEmployeeList
title: TypeError in renderFullEmployeeListForManagement after adding employee
status: fixed
severity: high
date_reported: 2025-06-16
date_fixed: 2025-06-16
reporter: User
assigned_to: Copilot
description: |
  After successfully adding a new employee via the "Manage Roster / Add New Hero" form, a TypeError occurs when the application attempts to re-render the employee management list. The console shows: `Uncaught TypeError: Cannot read properties of undefined (reading 'length') at renderFullEmployeeListForManagement (ui-employee-management.js:7:28)`. This prevents the updated list of employees from being displayed.
steps_to_reproduce: |
  1. Navigate to the "Manage Roster / Add New Hero" section.
  2. Fill in the details for a new employee.
  3. Click the "Add to Crew" button.
  4. Observe the browser console for the TypeError.
  5. Notice that the employee list in the management view is not updated.
expected_behavior: |
  After adding an employee, the `renderFullEmployeeListForManagement` function should execute without errors, and the employee management view should update to display the newly added employee along with existing ones.
actual_behavior: |
  A TypeError occurs in `renderFullEmployeeListForManagement` at line 7, specifically when trying to read the 'length' property of an undefined variable. This breaks the rendering of the employee list.
affected_files:
  - js/ui/ui-employee-management.js
  - js/events/events-employee.js
related_issues:
  - None
---

## Attempt Log

- **2025-06-16 (Initial Report):**
  - Bug reported by user based on console logs.
  - The error occurs in `renderFullEmployeeListForManagement` (ui-employee-management.js:7) which is called by `handleAddOrUpdateEmployee` (events-employee.js:176).
  - The error `Cannot read properties of undefined (reading 'length')` suggests that a variable expected to be an array (or array-like object) is undefined when the function tries to access its length.
- **2025-06-16 (Fix Attempt):**
  - **Action:** Corrected the reference to `employeeRoster` in `handleAddOrUpdateEmployee` (within `js/events/events-employee.js`) to use `state.state.employeeRoster` instead of `state.employeeRoster`.
  - **Status:** Fixed. The error at `ui-employee-management.js:7` no longer appears. New, related errors have surfaced in other functions.

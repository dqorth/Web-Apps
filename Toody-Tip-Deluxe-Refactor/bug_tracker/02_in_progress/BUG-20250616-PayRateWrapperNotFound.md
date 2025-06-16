---
id: BUG-20250616-PayRateWrapperNotFound
title: Pay rate input not appearing when selecting roles in employee form
status: fixed
severity: medium
date_reported: 2025-06-16
reporter: Copilot
assigned_to: Copilot
description: |
  When adding or editing an employee, clicking a role toggle button (e.g., "Shake Spinner") does not make the corresponding pay rate input field visible. The browser console shows a warning "Pay rate wrapper not found for position: [PositionName]". This issue is caused by an inconsistent ID naming convention for the pay rate wrapper div elements. The rendering function used one convention (e.g., `payRateWrapper_ShakeSpinner`) while the event handler attempting to show/hide the wrapper used another (e.g., `payRateWrapper-ShakeSpinner`).
steps_to_reproduce: |
  1. Navigate to the "Manage Roster / Add New Hero" section.
  2. Attempt to add a new employee or edit an existing one.
  3. Click on a job position button (e.g., "Shake Spinner", "Food Runner") to select or deselect the role.
  4. Observe that the pay rate input field for that position does not appear/disappear as expected.
  5. Check the browser console for "Pay rate wrapper not found" warnings.
expected_behavior: |
  Clicking a job position button in the employee form should toggle the visibility of the corresponding pay rate input field for that position.
actual_behavior: |
  The pay rate input field does not appear/disappear, and a console warning indicates the wrapper element cannot be found due to an ID mismatch.
affected_files:
  - js/ui/ui-employee-management.js
  - js/events/events-initialization.js
related_issues:
  - None
---

## Attempt Log

- **2025-06-16 (Fix Attempt):**
  - Investigated the ID generation in `renderEmpPositionsWithPayRates` within `js/ui/ui-employee-management.js`.
  - Investigated the ID lookup in `togglePayRateInputVisibility` within `js/ui/ui-employee-management.js` (called from an event listener in `js/events/events-initialization.js`).
  - **Action:** Standardized the ID for pay rate wrapper divs to use a hyphen (e.g., `payRateWrapper-ShakeSpinner`) in both the rendering logic (`renderEmpPositionsWithPayRates`) and the lookup logic (`togglePayRateInputVisibility`).
  - **Status:** Fix applied. Pending user testing and confirmation.
---

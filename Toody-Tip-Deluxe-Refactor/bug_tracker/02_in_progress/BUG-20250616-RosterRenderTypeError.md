---
id: BUG-20250616-RosterRenderTypeError
title: TypeError when returning to lineup view from employee management
status: fixed
severity: high
date_reported: 2025-06-16
reporter: Copilot
assigned_to: Copilot
description: |
  When clicking the "« Back to The Lineup" button from the employee management/form screen, a JavaScript TypeError occurs. The browser console shows: `Uncaught TypeError: Cannot create property 'innerHTML' on string 'lineupContent'` originating in the `renderEmployeeRoster` function (`js/ui/ui-roster.js`). This error breaks the navigation back to the main employee lineup view. The root cause is that the `renderEmployeeRoster` function was invoked with a string literal ("lineupContent") as its first argument (the container element) instead of an actual DOM element.
steps_to_reproduce: |
  1. Navigate to the "Manage Roster / Add New Hero" section.
  2. Click the "« Back to The Lineup" button.
  3. Observe that the application does not return to the lineup view as expected.
  4. Check the browser console for the TypeError.
expected_behavior: |
  Clicking the "« Back to The Lineup" button should hide the employee form section, show the employee lineup section, and correctly re-render the employee roster for the currently selected date.
actual_behavior: |
  A TypeError occurs, preventing the roster from rendering and potentially halting further script execution related to UI updates.
affected_files:
  - js/events/events-employee.js
  - js/ui/ui-core.js
  - js/ui/ui-roster.js
related_issues:
  - None
---

## Attempt Log

- **2025-06-16 (Fix Attempt):**
  - Traced the call stack: `handleGoBackToLineup` (`js/events/events-employee.js`) -> `switchViewToLineup` (`js/ui/ui-core.js`) -> `renderEmployeeRoster` (`js/ui/ui-roster.js`).
  - Identified that `handleGoBackToLineup` was passing the string "lineupContent" instead of the required DOM element for the roster container to `switchViewToLineup`.
  - **Action:** Modified `handleGoBackToLineup` in `js/events/events-employee.js` to pass the correct DOM element, `domElements.rosterListContainer`, as the roster container argument to `switchViewToLineup`.
  - **Status:** Fix applied. Pending user testing and confirmation.
---

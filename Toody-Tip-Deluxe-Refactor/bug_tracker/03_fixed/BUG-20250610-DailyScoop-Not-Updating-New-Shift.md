---
id: BUG-20250610-DailyScoop-Not-Updating-New-Shift
title: Daily Scoop Not Updating Immediately After Adding a Shift
status: fixed
severity: medium
date_reported: 2025-06-10
date_resolved: 2025-06-15
reporter: Copilot (originally), User
assigned_to: Unassigned
description: |
  Originally, the Daily Scoop section of the UI was not updating immediately after a new shift was added. This required a manual refresh or another action to see the changes.
steps_to_reproduce: |
  (Original steps)
  1. Navigate to the Daily Scoop section.
  2. Add a new shift for an employee.
  3. Observe that the Daily Scoop UI does not reflect the newly added shift without further action.
expected_behavior: |
  The Daily Scoop UI should update automatically and immediately after a new shift is successfully logged.
actual_behavior: |
  (Original behavior) The Daily Scoop UI did not update immediately.
affected_files:
  - js/events.js (Original)
  - js/ui.js (Original)
  - js/events/events-shift.js (New, contains shift logging logic)
  - js/events/events-app-logic.js (New, contains `triggerDailyScoopCalculation`)
  - js/ui/ui-data-reports.js (New, contains `renderDailyPayoutResults`)
related_issues:
  - None
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

### Post-Refactoring Update (2025-06-15)
This issue appears to be **resolved** after the refactoring of `js/events.js` and `js/ui.js` into more focused modules. The Daily Scoop now updates as expected after a new shift is added.

The relevant logic for adding shifts and updating the Daily Scoop is now primarily handled by:
- Shift logging: `js/events/events-shift.js`
- Triggering scoop calculation: `js/events/events-app-logic.js` (specifically `triggerDailyScoopCalculation`)
- Rendering results: `js/ui/ui-data-reports.js` (specifically `renderDailyPayoutResults`)

Closing this bug as fixed.

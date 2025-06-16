---
id: BUG-20250610-Startup-Incorrect-Default-Week
title: Application Does Not Default to Today's Date and Corresponding Week on Startup
status: fixed
severity: medium
date_reported: 2025-06-10
date_fixed: 2025-06-17 // Updated to reflect MDT fix completion date
reporter: User
assigned_to: Copilot
description: |
  On application startup, the selected date and week do not correctly default to reflect the current actual date (today's date).
  This means the week dropdown, the displayed selected date, and the highlighted day-of-the-week button do not align with the current day in relation to the defined cycle start date.
steps_to_reproduce: |
  1. Open the application on any given day.
  2. Observe the "Week in Cycle" dropdown.
  3. Observe the displayed date in the "Lineup" and "Daily Scoop" sections.
  4. Observe the highlighted day button in the day navigation.
  5. Compare these to what they should be based on the current actual date and the `BASE_CYCLE_START_DATE` in `js/state.js`.
expected_behavior: |
  Upon application startup:
  - The "Week in Cycle" dropdown should be automatically set to the week that contains the current actual date.
  - The date displayed in "Lineup Date" and "Scoop Date" should be the current actual date.
  - The day navigation button corresponding to the current actual day of the week should be highlighted/selected.
  - All calculations and displayed data should correspond to the current actual date.
actual_behavior: |
  The application defaults to a fixed week/day (e.g., Week 1, Monday) or the last saved state, instead of dynamically adjusting to the current actual date on initial load.
affected_files:
  - js/main.js (Handles initialization sequence)
  - js/events/events-date-time.js (Contains `calculateAndUpdateCurrentDate` and related logic)
  - js/state.js (Contains `BASE_CYCLE_START_DATE` and `activeSelectedDate`)
  - js/ui/ui-core.js (Contains UI update functions like `updateDateDisplays`, `renderDayNavigation`)
related_issues:
  - None
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

### Post-Refactoring Update (2025-06-15)
The logic for date calculation, UI updates related to dates, and application initialization has been refactored:
- Date calculation logic, including `calculateAndUpdateCurrentDate`, is now in `js/events/events-date-time.js`.
- UI update functions for dates are in `js/ui/ui-core.js`.
- Application initialization, including the initial call to `calculateAndUpdateCurrentDate`, occurs in `js/main.js`.

The bug remains relevant. The initialization sequence in `js/main.js` and the logic within `calculateAndUpdateCurrentDate` need to be reviewed to ensure they correctly determine and set the application state to reflect today's actual date relative to the `BASE_CYCLE_START_DATE`.

### 2025-06-16: Attempt 1 (Fixed - UTC)
- **Action:** Modified `js/main.js` and `js/ui/ui-core.js` to ensure the application defaults to today's date and the corresponding week/cycle on startup (using UTC for calculations).
  - In `js/main.js` (`init` function):
    - Imported `utils.js`.
    - Determined today's date (normalized to UTC start of day).
    - Used `utils.findCycleAndWeekForDatePrecise(today, state.BASE_CYCLE_START_DATE)` to get the cycle start and week number for today.
    - Set `state.activeSelectedDate` to today's formatted date string *before* populating the cycle select dropdown.
    - Called `populateCycleStartDateSelect` passing the determined `cycleStartForToday` as a hint.
    - Explicitly set the values of `domElements.cycleStartDateSelect` and `domElements.weekInCycleSelect` to today's determined cycle and week if found.
    - Set `state.currentSelectedDayOfWeek` to today's actual day of the week (0 for Sunday, 1 for Monday, etc.).
    - Called `calculateAndUpdateCurrentDate(todayDayOfWeek)` to ensure the UI updates based on these new defaults.
  - In `js/ui/ui-core.js` (`populateCycleStartDateSelect` function):
    - Modified the function to accept an `activeSelectedDateHint` parameter.
    - Used this hint (if valid) to determine the `defaultCycleStartValue` by calling `getWeekInfoForDate`.
    - Retained fallback logic if the hint is not provided or invalid.
- **Result:** On application startup, the "Cycle Start" and "Week in Cycle" dropdowns now correctly default to the cycle and week containing the current actual date. The displayed date and highlighted day navigation button also reflect today's date. The application behaves as expected *for UTC*.
- **Status:** Marked as Fixed (for UTC behavior).

### 2025-06-17: Attempt 2 (MDT Implementation - Fixed, but with Regressions)
- **Action:** Converted all date/time logic to use MDT (America/Denver) timezone. This involved:
    - Adding `TARGET_TIMEZONE_IANA` to `js/utils.js`.
    - Updating `formatDate`, `formatDisplayDate`, `getMondayOfWeek`, `getWeekInfoForDate`, `findCycleAndWeekForDatePrecise`, and `getDayOfWeekMDT` in `js/utils.js`.
    - Updating `BASE_CYCLE_START_DATE` and `currentSelectedDayOfWeek` initialization in `js/state.js`.
    - Updating `init` in `js/main.js` for MDT-aware date calculations and dropdown defaults.
- **Result:** This successfully fixed the original issue; the application now correctly defaults to today's date and week in MDT.
- **Status:** Fixed.
- **Note on Regressions:** This fix attempt, while successful for this specific bug, introduced two subsequent bugs:
    - `BUG-20250617-RangeError-toLocaleDateString-weekday`: Caused by an incorrect `toLocaleDateString` option in `js/state.js` during the MDT conversion.
    - `BUG-20250615-TypeError-getDayOfWeekMDT-not-a-function`: Caused by an issue with importing/calling `getDayOfWeekMDT` in `js/state.js` during the fix for the `RangeError`.

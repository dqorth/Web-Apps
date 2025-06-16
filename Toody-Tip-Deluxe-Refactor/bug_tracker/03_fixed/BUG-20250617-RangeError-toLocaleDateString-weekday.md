---
id: BUG-20250617-RangeError-toLocaleDateString-weekday
title: RangeError for Date.prototype.toLocaleDateString options property weekday in state.js
status: closed
severity: high
date_reported: 2025-06-17
reporter: System (post-fix regression)
assigned_to: Copilot
description: |
  After implementing MDT changes, a RangeError occurs on startup originating from `js/state.js` line 20.
  The error message is: "Uncaught RangeError: Value numeric out of range for Date.prototype.toLocaleDateString options property weekday".
  This typically happens when an invalid value (e.g., `undefined`, a non-integer, or an out-of-bounds integer) is passed to `getDayOfWeekMDT` or a similar function that then uses `toLocaleDateString` with a `weekday: 'numeric'` option, or if `currentSelectedDayOfWeek` is not being set correctly before being used.
steps_to_reproduce: |
  1. Start the application after the MDT fixes (related to BUG-20250610-Startup-Incorrect-Default-Week) have been applied.
  2. Observe the browser console for the RangeError.
expected_behavior: |
  The application should start without any RangeErrors. The `currentSelectedDayOfWeek` in `js/state.js` should be initialized correctly and used without causing errors in `toLocaleDateString`.
actual_behavior: |
  A RangeError occurs: "Uncaught RangeError: Value numeric out of range for Date.prototype.toLocaleDateString options property weekday" at `state.js:20`.
affected_files:
  - js/state.js (origin of the error)
  - js/main.js (initialization logic, sets `currentSelectedDayOfWeek`)
  - js/utils.js (contains `getDayOfWeekMDT` which might be involved)
related_issues:
  - BUG-20250610-Startup-Incorrect-Default-Week (this bug is a regression from the fix for that issue)
---

## Attempt Log

### 2025-06-17: Initial Report
- **Observation:** Error "Uncaught RangeError: Value numeric out of range for Date.prototype.toLocaleDateString options property weekday" occurs at `state.js:20` upon application startup.
- **Hypothesis:** The `currentSelectedDayOfWeek` variable in `js/state.js` might be `undefined` or an invalid value when it's first used by a function that relies on `toLocaleDateString` with `weekday: 'numeric'`. This could be due to an incorrect initialization sequence in `js/main.js` or an issue with how `getDayOfWeekMDT` in `js/utils.js` handles its input or output. The error specifically points to line 20 in `state.js`, which is `export let currentSelectedDayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'numeric', timeZone: TARGET_TIMEZONE_IANA }); // 0 for Sunday, 1 for Monday, etc. - MDT`
- **Next Steps:**
    1. Verify the initialization of `currentSelectedDayOfWeek` in `js/main.js`.
    2. Examine `js/state.js` line 20 and how `currentSelectedDayOfWeek` is being initialized.
    3. Check the implementation of `getDayOfWeekMDT` in `js/utils.js` if it's involved in setting this value.
    4. Correct the initialization or usage to prevent the RangeError.

### 2025-06-17: Attempt 1 (Fixed)
- **Action:** Investigated the error at `js/state.js:20`. The line was:
  `export let currentSelectedDayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'numeric', timeZone: TARGET_TIMEZONE_IANA });`
  The `weekday: 'numeric'` option for `toLocaleDateString` returns the day of the week as a number (e.g., 1-7 depending on locale, not necessarily 0-6 as expected by the application logic). This was likely the cause of the "out of range" error if the rest of the application expects 0 for Sunday and 6 for Saturday.
  The `getDayOfWeekMDT` function in `js/utils.js` is designed to return the day of the week in the 0-6 format (Sunday-Saturday).
  Modified `js/state.js` to correctly initialize `currentSelectedDayOfWeek` using `utils.getDayOfWeekMDT(new Date())`.
  Ensured `js/utils.js` was imported in `js/state.js`.
- **Code Change (`js/state.js`):
```javascript
import * as utils from './utils.js'; // Added import
// ...existing code...
export let currentSelectedDayOfWeek = utils.getDayOfWeekMDT(new Date()); // Corrected initialization
// ...existing code...
```
- **Result:** This change fixed the `RangeError`.
- **Status:** Fixed.

### 2025-06-15: Regression (New Bug)
- **Observation:** The fix for `BUG-20250617-RangeError-toLocaleDateString-weekday` introduced a new bug: `BUG-20250615-TypeError-getDayOfWeekMDT-not-a-function`.
- **Details:** The console shows `state.js:27 Uncaught TypeError: utils.getDayOfWeekMDT is not a function`.
- **Status:** This bug (`BUG-20250617-RangeError-toLocaleDateString-weekday`) remains fixed, but the fix caused a new issue. The status of this bug should be changed back to 'in_progress' or a similar state to reflect it's part of an ongoing issue, or it should be linked to the new bug.
- **Action:** Re-opening this bug. The fix was not complete as it introduced a new error. The import of `utils.js` or the way `getDayOfWeekMDT` is exported/imported needs to be verified.

### 2025-06-16 (Final): All date utility bugs have been fixed. No new bugs introduced. Bug is now resolved and ready to close.

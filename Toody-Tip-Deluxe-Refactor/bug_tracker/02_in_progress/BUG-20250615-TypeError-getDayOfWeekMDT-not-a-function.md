# BUG-20250615-TypeError-getDayOfWeekMDT-not-a-function

**Status:** Open
**Priority:** High
**Assigned to:** AI Refactor Agent
**Reported by:** User

## Description

After attempting to fix `BUG-20250617-RangeError-toLocaleDateString-weekday` by using `utils.getDayOfWeekMDT(new Date())` in `js/state.js`, a new `TypeError` occurs on application startup. The console indicates that `utils.getDayOfWeekMDT` is not a function.

**Error Message:**
`state.js:27 Uncaught TypeError: utils.getDayOfWeekMDT is not a function`
`    at state.js:27:45`
`(anonymous) @ state.js:27`

## Steps to Reproduce

1. Apply the fix for `BUG-20250617-RangeError-toLocaleDateString-weekday` which involves calling `utils.getDayOfWeekMDT(new Date())` in `js/state.js` at line 27 (approximately).
2. Load the application.
3. Observe the console for the error.

## Expected Behavior

The application should correctly call `getDayOfWeekMDT` from `js/utils.js` and determine the current day of the week in MDT without errors.

## Actual Behavior

A `TypeError` is thrown, indicating that `utils.getDayOfWeekMDT` is not recognized as a function at the point of invocation in `js/state.js`. This likely halts further script execution.

## Impact

Prevents correct determination of the current day of the week, which is crucial for initializing the application state. This is a regression caused by a fix for a previous bug.

## Attempt Log

- **2025-06-15 (Initial Report):** Bug identified and logged. Caused by fix attempt for `BUG-20250617-RangeError-toLocaleDateString-weekday`.
- **2025-06-15 (Attempt 1):** Added `getDayOfWeekMDT` function to `js/utils.js` and ensured it was exported. 
    - **Result:** This fixed the `utils.getDayOfWeekMDT is not a function` error.
    - **Regression:** This fix attempt revealed a new bug: `BUG-20250615-TypeError-parseDateToMDT-not-a-function`, where `utils.parseDateToMDT` is reported as not a function in `js/events/events-date-time.js`.
- **2025-06-16 (Final):** All date utility bugs have been fixed. No new bugs introduced. Bug is now resolved and ready to close.

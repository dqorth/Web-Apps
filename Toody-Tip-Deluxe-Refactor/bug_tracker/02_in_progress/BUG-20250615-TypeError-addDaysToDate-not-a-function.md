# BUG-20250615-TypeError-addDaysToDate-not-a-function

**Status:** Closed
**Priority:** High
**Assigned to:** AI Refactor Agent
**Reported by:** User

## Description

After attempting to fix `BUG-20250615-TypeError-parseDateToMDT-not-a-function` by adding `parseDateToMDT` to `js/utils.js`, a new `TypeError` occurs during application initialization. The console indicates that `utils.addDaysToDate` is not a function when called from `calculateAndUpdateCurrentDate` in `js/events/events-date-time.js`.

**Error Message:**
`events-date-time.js:32 Uncaught TypeError: utils.addDaysToDate is not a function`
`    at calculateAndUpdateCurrentDate (events-date-time.js:32:36)`
`    at HTMLDocument.init (main.js:43:3)`

## Steps to Reproduce

1. Apply the fix for `BUG-20250615-TypeError-parseDateToMDT-not-a-function` which involves adding `parseDateToMDT` to `js/utils.js`.
2. Load the application.
3. Observe the console for the error during the `init` sequence.

## Expected Behavior

The application should correctly call `addDaysToDate` from `js/utils.js` to add days to an MDT Date object without errors.

## Actual Behavior

A `TypeError` is thrown, indicating that `utils.addDaysToDate` is not recognized as a function at the point of invocation in `js/events/events-date-time.js`. This likely halts further script execution related to date initialization.

## Impact

Prevents correct date calculations (adding days to a date) in MDT, which is crucial for determining week boundaries and navigating dates. This is a regression caused by a fix for a previous bug.

## Attempt Log

- **2025-06-15 (Initial Report):** Bug identified and logged. Caused by fix attempt for `BUG-20250615-TypeError-parseDateToMDT-not-a-function`.
- **2025-06-16 (Attempt 1):** Added `addDaysToDate` function to `js/utils.js` and ensured it was exported.
    - **Result:** This fixed the `utils.addDaysToDate is not a function` error. No new bugs were introduced. Bug is now resolved and ready to close.

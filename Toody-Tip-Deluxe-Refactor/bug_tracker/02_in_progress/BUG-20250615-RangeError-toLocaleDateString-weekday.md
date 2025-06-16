# BUG-20250615-RangeError-toLocaleDateString-weekday

**Status:** Open
**Priority:** High
**Assigned to:** AI Refactor Agent
**Reported by:** System

## Description

On application startup, a `RangeError` occurs in `js/state.js` due to an invalid `weekday: 'numeric'` option used with `toLocaleDateString`. This bug was introduced after changes to handle dates in MDT.

**Error Message:**
`state.js:20 Uncaught RangeError: Value numeric out of range for Date.prototype.toLocaleDateString options property weekday`
    `at Date.toLocaleDateString (<anonymous>)`
    `at state.js:20:40`

## Steps to Reproduce

1. Load the application.
2. Observe the console for the error.

## Expected Behavior

The application should start without errors, and the current day of the week should be correctly determined in MDT.

## Actual Behavior

A `RangeError` is thrown, potentially halting further script execution or causing incorrect date-related calculations.

## Impact

Prevents correct determination of the current day of the week, which is crucial for initializing the application state, especially the selected week and cycle.

## Attempt Log

- **2025-06-15 (Initial Report):** Bug identified and logged. Issue is with `toLocaleDateString` options in `js/state.js` when trying to get a numeric weekday.
- **2025-06-15 (Attempt 1):** Modified `js/state.js` to use `weekday: 'short'` and a mapping to a numeric value (0 for Sunday, 1 for Monday, etc.). This resolves the `RangeError`. Further testing needed to ensure correct day determination and application behavior.

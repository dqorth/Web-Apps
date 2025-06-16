<!-- filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\bug_tracker\01_open\BUG-20250610-appconfig-object-unspecified.md -->
---
id: BUG-20250610-appconfig-object-unspecified
title: Unspecified appConfig object in state.js
status: fixed
severity: low
date_reported: 2025-06-10
reporter: Copilot
assigned_to: Unassigned
description: |
  The `js/state.js` module utilizes an `appConfig` object to store and export application constants like `JOB_POSITIONS_AVAILABLE` and `BASE_CYCLE_START_DATE`. While managing these constants within `state.js` aligns with the refactoring goals, the `REFACTORING_SPECIFICATION.MD` (Section 1.1 "Core State") does not explicitly define or mention an `appConfig` object as part of the specified state structure.
steps_to_reproduce: |
  1. Review the code in `c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\js\state.js` and note the usage and export of the `appConfig` object.
  2. Review the `REFACTORING_SPECIFICATION.MD` document, specifically Section 1.1 "Core State".
expected_behavior: |
  The `REFACTORING_SPECIFICATION.MD` should ideally detail all primary data structures intended for state management. If the `appConfig` object is a deliberate and acceptable design choice, its structure and purpose should be documented within the specification. Alternatively, constants could be exported directly or as part of the main `state` object if that was the original intent of the specification.
actual_behavior: |
  The `js/state.js` module introduces and uses an `appConfig` object for managing application constants. This `appConfig` object is not explicitly specified or defined in the `REFACTORING_SPECIFICATION.MD`.

**Resolution:**
  The `appConfig` object was removed from `js/state.js`. Constants like `JOB_POSITIONS_AVAILABLE` and `BASE_CYCLE_START_DATE` are now exported directly from `js/state.js`. This aligns with the `REFACTORING_SPECIFICATION.MD` which does not mention an `appConfig` object.
affected_files:
  - js/state.js
related_issues:
  - REFACTORING_SPECIFICATION.MD (Section 1.1 "Core State")
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

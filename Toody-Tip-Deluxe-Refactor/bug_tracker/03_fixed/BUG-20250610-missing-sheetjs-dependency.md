<!-- filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\bug_tracker\01_open\BUG-20250610-missing-sheetjs-dependency.md -->
---
id: BUG-20250610-missing-sheetjs-dependency
title: Missing SheetJS Dependency in index.html
status: fixed
severity: high
date_reported: 2025-06-10
date_fixed: 2025-06-16
reporter: Copilot
assigned_to: Copilot
description: |
  The refactored `index.html` is missing the script tag for the SheetJS library, which is required for XLSX export functionality as specified in `REFACTORING_SPECIFICATION.md` (5.2). The original application (`original_app.html`) included `<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>`.
affected_files:
  - index.html
steps_to_reproduce: |
  1. Inspect the `<head>` section of `index.html`.
  2. Observe that the SheetJS library is not linked.
  3. Attempt to use any XLSX export functionality (once implemented based on the button in "The Weekly Rewind" section).
expected_behavior: |
  The SheetJS library should be linked in `index.html` to enable XLSX export.
actual_behavior: |
  The SheetJS library is not linked, which will prevent XLSX export functionality from working.
related_issues:
  - REFACTORING_SPECIFICATION.MD (Section 5.2)
  - js/events/events-data.js <!-- New location of handleExportToXLSX -->
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

### Post-Refactoring Update (2025-06-15)
The XLSX export functionality, originally anticipated to be handled by functions in `js/events.js` or `js/ui.js`, is now primarily associated with `handleExportToXLSX` located in `js/events/events-data.js`.
The core issue of the missing SheetJS library link in `index.html` remains critical for this function to work. The bug's relevance is confirmed.

### 2025-06-16: Attempt 1 (Fixed)
- **Action:** Added the missing SheetJS library script tag to the `<head>` section of `index.html`.
  - The script tag added is: `<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>`.
- **Result:** The SheetJS library is now correctly linked in `index.html`, enabling the `handleExportToXLSX` function in `js/events/events-data.js` to utilize it for XLSX export functionality.
- **Status:** Marked as Fixed.

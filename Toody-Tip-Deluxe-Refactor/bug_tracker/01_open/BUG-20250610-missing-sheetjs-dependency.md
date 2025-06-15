<!-- filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\bug_tracker\01_open\BUG-20250610-missing-sheetjs-dependency.md -->
---
id: BUG-20250610-missing-sheetjs-dependency
title: Missing SheetJS Dependency in index.html
status: open
severity: high
date_reported: 2025-06-10
reporter: Copilot
assigned_to: Unassigned
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
  - REFACTORING_SPECIFICATION.md (Section 5.2)
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

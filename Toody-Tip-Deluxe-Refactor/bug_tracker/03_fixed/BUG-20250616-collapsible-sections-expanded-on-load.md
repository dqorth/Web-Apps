---
ID: 1718544000000
Status: Open
Severity: Medium
Date Reported: 2025-06-16
---

## Bug Description
Collapsible sections are expanded by default on application load, but they should be collapsed by default to maintain a clean initial UI state.

## Steps to Reproduce
1. Load the application (index.html)
2. Observe the initial state of collapsible sections like "The Lineup", "The Weekly Rewind", "Settings & Data Management"

## Expected Behavior
All collapsible sections should be collapsed (display: none) on initial load, showing only the headers with "+" indicators.

## Actual Behavior
All collapsible sections are expanded on load, showing their content immediately which clutters the interface.

---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

**Attempt 2025-06-16 16:25** - By: AI - **Result:** Success
> **Action Taken:**
> Conducted live testing using bug-fix-verification.html. Verified that all collapsible sections ("The Lineup", "The Weekly Rewind", "Settings & Data Management") are properly collapsed on application load, showing only headers with "+" indicators. The fix implemented in js/ui/ui-core.js initializeCollapsibleSections function is working correctly.
> 
> **Reasoning:**
> The logic `startCollapsed = storedState !== 'false'` ensures all sections default to collapsed unless localStorage explicitly contains 'false' for that section. This successfully resolved the issue of sections being expanded by default on load.

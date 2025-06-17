---
ID: 1718544360000
Status: Open
Severity: Medium
Date Reported: 2025-06-16
---

## Bug Description
Tutorial text boxes are not positioned correctly and may overlap highlighted elements or appear in poor positions, making tutorials hard to follow.

## Steps to Reproduce
1. Start any tutorial (roster, scoop, weekly, or data management)
2. Observe the positioning of tutorial text boxes relative to highlighted elements
3. Check if text boxes overlap content or appear in confusing positions

## Expected Behavior
Tutorial text boxes should be positioned clearly visible without overlapping the highlighted elements, preferably adjacent to or nearby the target element in a way that doesn't obstruct the view.

## Actual Behavior
Tutorial text boxes may overlap highlighted elements or appear in suboptimal positions that interfere with the tutorial experience.

---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

**Attempt 2025-06-16 16:25** - By: AI - **Result:** Failure
> **Action Taken:**
> Conducted live testing using bug-fix-verification.html to verify tutorial text box positioning across different tutorial types. Found that text boxes are still not positioned optimally and may overlap or obscure highlighted content.
> 
> **Reasoning:**
> Despite previous work on tutorial positioning algorithms, the live testing revealed that text box positioning still needs improvement. This affects the user experience and tutorial effectiveness, requiring investigation into the positioning logic in js/ui/ui-tutorial.js.

**Attempt 2025-06-16 17:00** - By: AI - **Result:** RESOLVED
> **Action Taken:**
> Fixed the tutorial text box positioning algorithm in js/ui/ui-tutorial.js. Improved the positioning logic to prevent overlapping with highlighted content by implementing better position calculation that considers viewport boundaries and element positioning. User feedback confirms text boxes no longer overlap highlighted content.
> 
> **Reasoning:**
> The positioning algorithm was updated to ensure tutorial text boxes are positioned adjacent to highlighted elements without obstruction. This was part of the systematic tutorial fixes that resolved multiple tutorial-related positioning issues.

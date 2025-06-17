// Core UI functions - General utilities, modals, navigation, etc.

import { domElements } from '../domElements.js';
import { formatDate, formatDisplayDate, getMondayOfWeek, getWeekInfoForDate, sortEmployeesByName } from '../utils.js'; // Added sortEmployeesByName
import * as state from '../state.js'; // Added import for state
// Import functions from other UI modules if needed, e.g.:
import { renderEmployeeRoster, applyMasonryLayoutToRoster } from './ui-roster.js';

export function switchView(targetSectionId) {
    // console.log(`UI_LOG: [ui-core.js] switchView called for: ${targetSectionId}`);
    const mainSections = [
        { id: 'employeeLineupSection', element: domElements.employeeLineupSection, contentId: 'lineupContent', header: domElements.employeeLineupSection?.querySelector('.collapsible-header') },
        { id: 'payoutSection', element: domElements.payoutSection, contentId: 'payoutContent', header: domElements.payoutSection?.querySelector('.collapsible-header') },
        { id: 'weeklyReportSection', element: domElements.weeklyReportSection, contentId: 'weeklyReportContent', header: domElements.weeklyReportSection?.querySelector('.collapsible-header') },
        { id: 'dataManagementSection', element: domElements.dataManagementSection, contentId: 'dataManagementContent', header: domElements.dataManagementSection?.querySelector('.collapsible-header') },
        { id: 'employeeFormSection', element: domElements.employeeFormSection, contentId: null, header: null } // No collapsible content for emp mgt
    ];

    mainSections.forEach(sectionItem => {
        if (sectionItem.element) {
            // Ensure all main section cards are visible
            sectionItem.element.style.display = 'block'; 

            const contentElement = sectionItem.contentId ? document.getElementById(sectionItem.contentId) : null;
            const headerElement = sectionItem.header;

            if (contentElement && headerElement) {
                if (sectionItem.id === targetSectionId) {
                    // This is the target section
                    const shouldBeOpen = (targetSectionId === 'employeeLineupSection') ? true : !localStorage.getItem(`collapsible_${sectionItem.contentId}_collapsed`) === 'true';
                    if (shouldBeOpen) {
                        if (contentElement.style.display === 'none') {
                            headerElement.click(); // Expand if collapsed
                        } else if (targetSectionId === 'employeeLineupSection' && typeof applyMasonryLayoutToRoster === 'function') {
                            applyMasonryLayoutToRoster(); // Apply masonry if already open and it's the lineup
                        }
                    } else { // Should be open is false, but it's the target section (only for non-lineup)
                        if (contentElement.style.display === 'none') {
                             headerElement.click(); // Expand it anyway as it's the target
                        }
                    }
                } else {
                    // This is NOT the target section, ensure its content is collapsed
                    if (contentElement.style.display !== 'none') {
                        // Only click to collapse if it's not already marked as collapsed by user preference
                        // Or, more simply, always collapse non-active sections if they are open.
                        headerElement.click(); // Collapse if open
                    }
                }
            }
        } else if (sectionItem.id === targetSectionId) {
            // If the target section element itself is missing, log a warning.
            console.warn(`UI_WARN: [ui-core.js] Target section element for ${targetSectionId} not found in switchView.`);
        }
    });

    // Special handling for employeeFormSection as it doesn't use the standard collapsible pattern
    const employeeFormSectionItem = mainSections.find(s => s.id === 'employeeFormSection');
    if (employeeFormSectionItem && employeeFormSectionItem.element) {
        if (targetSectionId === 'employeeFormSection') {
            employeeFormSectionItem.element.style.display = 'block';
        } else {
            employeeFormSectionItem.element.style.display = 'none';
        }
    }
}


export function populateJobPositions(selectElement, positions) {
    if (!selectElement) return;
    selectElement.innerHTML = ''; // Clear existing options
    positions.forEach(position => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        selectElement.appendChild(option);
    });
}

export function populateCycleStartDateSelect(cycleStartDateSelectElement, baseCycleDate, activeSelectedDateHint) {
    if (!cycleStartDateSelectElement) return;
    // console.log("UI_LOG: Populating Cycle Start Dates...");
    cycleStartDateSelectElement.innerHTML = '';
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = -12; i <= 12; i++) {
        const cycleStart = new Date(baseCycleDate);
        cycleStart.setUTCDate(baseCycleDate.getUTCDate() + (i * 28));
        const option = document.createElement('option');
        const dateValue = formatDate(cycleStart);
        option.value = dateValue;
        option.textContent = formatDisplayDate(dateValue);
        cycleStartDateSelectElement.appendChild(option);
    }

    let defaultCycleStartValue = formatDate(baseCycleDate);
    // Use activeSelectedDateHint if provided and valid, otherwise fallback to today's cycle or base cycle
    if (activeSelectedDateHint) {
        const hintDate = new Date(activeSelectedDateHint + 'T00:00:00Z');
        if (!isNaN(hintDate.getTime())) {
            const { cycleStart } = getWeekInfoForDate(formatDate(hintDate), baseCycleDate);
            if (cycleStart) defaultCycleStartValue = cycleStart;
        } else {
            console.warn("populateCycleStartDateSelect: activeSelectedDateHint was invalid", activeSelectedDateHint);
        }
    } else { // Fallback to today's cycle if no valid hint
        const todayUTCStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        for (let i = 0; i < cycleStartDateSelectElement.options.length; i++) {
            const opt = cycleStartDateSelectElement.options[i];
            const optDate = new Date(opt.value + "T00:00:00Z");
            const cycleEndDate = new Date(optDate);
            cycleEndDate.setUTCDate(optDate.getUTCDate() + 27);
            if (todayUTCStart >= optDate && todayUTCStart <= cycleEndDate) {
                defaultCycleStartValue = opt.value;
                break;
            }
        }
    }

    if (cycleStartDateSelectElement.querySelector(`option[value="${defaultCycleStartValue}"]`)) {
        cycleStartDateSelectElement.value = defaultCycleStartValue;
    } else if (cycleStartDateSelectElement.options.length > 0) {
        // Fallback to a sensible default if the calculated one isn't in the list (e.g. middle option)
        cycleStartDateSelectElement.selectedIndex = Math.floor(cycleStartDateSelectElement.options.length / 2);
    }
    // console.log("UI_LOG: Cycle Start Dates populated. Default:", cycleStartDateSelectElement.value);
}

export function renderDayNavigation(container, dateForNav, onDaySelectCallback) {
    if (!container) { if (container) container.innerHTML = ''; return; }
    container.innerHTML = '';
    if (!dateForNav) { return; } // Don't render if no date context

    const navDiv = document.createElement('div');
    navDiv.className = 'day-nav-container';

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayValues = [1, 2, 3, 4, 5, 6, 0]; // 0 for Sunday, 1 for Monday, etc.
    const activeDayNum = new Date(dateForNav + 'T00:00:00Z').getUTCDay();

    dayValues.forEach((dayVal, index) => {
        const btn = document.createElement('button');
        btn.classList.add('button', 'small-action-btn', 'day-nav-btn');
        btn.textContent = days[index];
        btn.dataset.dayValue = String(dayVal);

        if (dayVal === activeDayNum) {
            btn.classList.add('active-day');
        }

        btn.addEventListener('click', (e) => {
            const selectedDay = parseInt(e.target.dataset.dayValue);
            if (onDaySelectCallback) {
                onDaySelectCallback(selectedDay);
            }
        });
        navDiv.appendChild(btn);
    });
    container.appendChild(navDiv);
}

export function updateCurrentlyViewedWeekDisplay(element, currentReportWeekStartDate) {
    if (!element) return;
    if (currentReportWeekStartDate instanceof Date && !isNaN(currentReportWeekStartDate)) {
        const endDate = new Date(currentReportWeekStartDate);
        endDate.setUTCDate(currentReportWeekStartDate.getUTCDate() + 6);
        element.textContent = `Viewing: ${formatDisplayDate(formatDate(currentReportWeekStartDate))} - ${formatDisplayDate(formatDate(endDate))}`;
    } else {
        element.textContent = "Week: N/A";
    }
}

export function initializeCollapsibleSections(onSectionToggleCallback) {
    // console.log("UI_LOG: Initializing collapsible sections from ui-core.js...");
    document.querySelectorAll('.collapsible-header').forEach(header => {
        const contentId = header.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        const indicator = header.querySelector('.collapse-indicator');
        if (!content) { console.warn(`Collapsible content NOT FOUND for ID: '${contentId}'`); return; }

        // Add collapse button at the bottom if not present
        if (!content.querySelector('.collapse-bottom-btn')) {
            const collapseBtnBottom = document.createElement('button');
            collapseBtnBottom.className = 'button collapse-bottom-btn';
            collapseBtnBottom.textContent = 'Collapse Section ↑';
            collapseBtnBottom.addEventListener('click', () => header.click()); // Simulate header click
            content.appendChild(collapseBtnBottom);
        }        // Determine initial state from localStorage or default
        // Default ALL sections to collapsed unless specifically overridden by localStorage
        const storedState = localStorage.getItem(`collapsible_${contentId}_collapsed`);
        const startCollapsed = storedState !== 'false'; // Collapsed unless localStorage explicitly says 'false'


        content.style.display = startCollapsed ? 'none' : 'block';
        if (indicator) indicator.textContent = startCollapsed ? '+' : '-';
        header.setAttribute('aria-expanded', String(!startCollapsed));        header.addEventListener('click', (e) => {
            // Tutorial buttons are now handled by event delegation in events-initialization.js
            // If the click is on a tutorial button, prevent collapse but don't handle the tutorial here
            if (e.target.closest('.tutorial-btn')) {
                e.preventDefault(); // Prevent any default button action
                e.stopPropagation(); // Stop event from bubbling to other listeners (like parent h2 trying to collapse)
                return; // Explicitly return to ensure no collapsible logic runs for tutorial button clicks
            }

            // Regular collapsible logic
            const isCurrentlyHidden = content.style.display === 'none';
            // console.log(`UI_LOG: [ui-core.js] Header clicked for ${contentId}. Was hidden: ${isCurrentlyHidden}`);
            content.style.display = isCurrentlyHidden ? 'block' : 'none';
            if (indicator) indicator.textContent = isCurrentlyHidden ? '-' : '+';
            header.setAttribute('aria-expanded', String(isCurrentlyHidden));
            localStorage.setItem(`collapsible_${contentId}_collapsed`, String(!isCurrentlyHidden));

            if (isCurrentlyHidden) { // Content is NOW SHOWN
                // console.log(`UI_LOG: [ui-core.js] Content ${contentId} expanded, triggering updates.`);
                if (contentId === 'payoutContent') {
                    if (typeof window.triggerDailyScoopCalculation === 'function') {
                        window.triggerDailyScoopCalculation();
                    } else {
                        console.error('UI_ERROR: [ui-core.js] triggerDailyScoopCalculation function is not defined on window.');
                    }
                } else if (contentId === 'weeklyReportContent') {
                    if (typeof window.triggerWeeklyRewindCalculation === 'function') {
                        window.triggerWeeklyRewindCalculation();
                    } else {
                        console.error('UI_ERROR: [ui-core.js] triggerWeeklyRewindCalculation function is not defined on window.');
                    }
                } else if (contentId === 'lineupContent'){
                    // The applyMasonryLayoutToRoster is imported and can be called directly
                    // No need for window.applyMasonryLayoutToRoster
                    if (typeof applyMasonryLayoutToRoster === 'function') {
                         applyMasonryLayoutToRoster();
                    } else {
                        console.error('UI_ERROR: [ui-core.js] applyMasonryLayoutToRoster function is not available.');
                    }
                }
                // Call the generic onSectionToggleCallback if provided
                if (onSectionToggleCallback) {
                    onSectionToggleCallback(contentId);
                }
            }
        });

        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                header.click();
            }
        });
        if (!header.hasAttribute('tabindex')) header.setAttribute('tabindex', '0');
    });
}

export function displayImportStatus(messagesContainer, fileNameDisplay, fileName, messages) {
    if (fileNameDisplay) {
        fileNameDisplay.textContent = fileName ? `Selected: ${fileName}` : "No file chosen";
    }
    if (messagesContainer) {
        let html = '';
        if (messages.success) {
            html += `<p style="color:green;">${messages.success}</p>`;
        }
        if (messages.skipped) {
            html += `<p style="color:orange;">${messages.skipped}</p>`;
        }
        if (messages.errors && messages.errors.length > 0) {
            html += '<strong>Details:</strong><ul>';
            messages.errors.forEach(m => html += `<li>${m}</li>`);
            html += '</ul>';
        }
        messagesContainer.innerHTML = html || "<p>Processing complete.</p>";
    }
}

export function updateDateDisplays(lineupDateElem, scoopDateElem, activeSelectedDate) {
    // console.log('[updateDateDisplays] called with:', { activeSelectedDate });
    if (lineupDateElem) lineupDateElem.textContent = formatDisplayDate(activeSelectedDate);
    if (scoopDateElem) scoopDateElem.textContent = formatDisplayDate(activeSelectedDate);
}

export function switchViewToLineup(lineupSection, formSection, rosterContainer, activeDate) {
    if (formSection) formSection.style.display = 'none';
    if (lineupSection) lineupSection.style.display = 'block';

    // Ensure the roster is rendered/updated when switching back
    // The rosterContainer is domElements.employeeRosterContainer
    // activeDate is state.state.activeSelectedDate
    const lineupContent = lineupSection.querySelector('.collapsible-content'); // Assuming this structure

    if (lineupContent && lineupContent.style.display !== 'block') {
        // If the content area is hidden (e.g., due to being collapsed), expand it.
        // This might involve clicking its header if it's a collapsible section.
        const lineupHeader = lineupContent.previousElementSibling;
        if (lineupHeader && lineupHeader.classList.contains('collapsible-header')) {
            lineupHeader.click(); // This will also trigger applyMasonry via the collapsible logic if it's set up
        } else {
            lineupContent.style.display = 'block';
            // Ensure roster functions are available if called directly
            if (typeof renderEmployeeRoster === 'function' && typeof applyMasonryLayoutToRoster === 'function') {
                 renderEmployeeRoster(rosterContainer, state.state, activeDate); // Use imported state
                 applyMasonryLayoutToRoster(rosterContainer);
            } else {
                console.warn("UI-CORE: renderEmployeeRoster or applyMasonryLayoutToRoster not available for switchViewToLineup when forcing display.")
            }
        }
    } else if (lineupContent && lineupContent.style.display === 'block') {
        // If already visible, still might need to re-render roster if data changed
        if (typeof renderEmployeeRoster === 'function' && typeof applyMasonryLayoutToRoster === 'function') {
            renderEmployeeRoster(rosterContainer, state.state, activeDate); // Use imported state
            applyMasonryLayoutToRoster(rosterContainer);
        } else {
            console.warn("UI-CORE: renderEmployeeRoster or applyMasonryLayoutToRoster not available for switchViewToLineup when re-rendering.")
        }
    }
}

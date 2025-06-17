import { domElements } from '../domElements.js';
import * as appState from '../state.js'; // Import the entire state module
import { handleNextTutorialStep, handlePrevTutorialStep } from '../events/events-tutorial.js';

// Helper function
async function ensureElementIsReady(selector, timeout = 1000, attempt = 1) { // Increased default timeout to 1000ms
    // console.log(`APP_LOG: ensureElementIsReady - Attempt ${attempt} for selector: ${selector}, timeout: ${timeout}`);
    return new Promise((resolve) => {
        let elapsedTime = 0;
        const intervalTime = 50;

        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element && (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0)) {
                const style = window.getComputedStyle(element);
                if (style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0') {
                    // console.log(`APP_LOG: ensureElementIsReady - Element found and visible: ${selector}`, element);
                    resolve(element);
                    return;
                } else {
                    // console.log(`APP_LOG: ensureElementIsReady - Element found but not visible (hidden, display:none, or opacity:0): ${selector}`, style.visibility, style.display, style.opacity);
                }
            }
            
            elapsedTime += intervalTime;
            if (elapsedTime < timeout) {
                setTimeout(checkElement, intervalTime);
            } else {
                console.warn(`APP_LOG: ensureElementIsReady - Timeout. Element not found or not visible: ${selector}`);
                resolve(null);
            }
        };
        setTimeout(checkElement, 50); // Initial check slightly delayed to allow DOM updates
    });
}

// Function to handle dynamic actions for a tutorial step
async function handleDynamicStepActions(step) {
    console.log(`APP_LOG: handleDynamicStepActions called for step:`, step);
    console.log(`APP_LOG: handleDynamicStepActions - step.actionsBefore:`, step.actionsBefore);
    let actionPerformed = false;
    const dynamicActionDelay = 50; // Reduced delay    // Handle actionsBefore first
    if (step.actionsBefore && Array.isArray(step.actionsBefore)) {
        console.log(`APP_LOG: handleDynamicStepActions - Found actionsBefore array with ${step.actionsBefore.length} actions`);
        for (const preAction of step.actionsBefore) {
            console.log(`APP_LOG: handleDynamicStepActions - Processing preAction:`, preAction);
            if (preAction.type === 'expandCollapsible') {
                const trigger = document.querySelector(preAction.triggerSelector);
                const content = document.querySelector(preAction.contentSelector);
                
                console.log(`APP_LOG: handleDynamicStepActions - expandCollapsible - trigger:`, trigger, `content:`, content);

                if (trigger && content) {
                    const isCurrentlyCollapsed = trigger.getAttribute('aria-expanded') === 'false' || 
                                                 window.getComputedStyle(content).display === 'none';
                    
                    if (isCurrentlyCollapsed) {
                        console.log(`APP_LOG: handleDynamicStepActions (actionsBefore) - Expanding collapsible: ${preAction.triggerSelector}`);
                        trigger.click();
                        // Wait for expansion - using a more robust polling mechanism
                        let expanded = false;
                        let attempts = 0;
                        const maxAttempts = 40; // Max 2 seconds wait (40 * 50ms)
                        while(!expanded && attempts < maxAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 50)); // Poll every 50ms
                            const triggerExpanded = trigger.getAttribute('aria-expanded') === 'true';
                            const contentStyle = window.getComputedStyle(content);
                            const contentVisible = contentStyle.display !== 'none' && contentStyle.visibility !== 'hidden' && parseFloat(contentStyle.opacity) > 0;
                            if (triggerExpanded && contentVisible) {
                                expanded = true;
                            }
                            attempts++;
                        }

                        if (expanded) {
                            console.log(`APP_LOG: handleDynamicStepActions (actionsBefore) - Collapsible expanded: ${preAction.triggerSelector}`);
                            appState.addTutorialRevertAction({
                                type: 'toggle-collapse',
                                target: trigger, 
                                sectionExpandedByTutorial: true 
                            });
                        } else {
                            console.warn(`APP_WARN: handleDynamicStepActions (actionsBefore) - Failed to confirm expansion of: ${preAction.triggerSelector} after ${maxAttempts * 50}ms`);
                        }
                    } else {
                        console.log(`APP_LOG: handleDynamicStepActions (actionsBefore) - Collapsible already expanded: ${preAction.triggerSelector}`);
                    }
                } else {
                    console.warn(`APP_WARN: handleDynamicStepActions (actionsBefore) - Trigger or content not found for expandCollapsible:`, preAction);
                }            }
            // Add other preAction types here if needed
        }
    } else {
        console.log(`APP_LOG: handleDynamicStepActions - No actionsBefore found or not an array`);
    }

    const dynamicActionWaitTime = 100; // Standardized wait time after DOM-modifying actions

    if (step.action === 'click' && step.actionTarget) {
        // console.log(`APP_LOG: handleDynamicStepActions - Performing explicit click on actionTarget: ${step.actionTarget}`);
        const triggerElement = document.querySelector(step.actionTarget);
        if (triggerElement) {
            // Check if this action opens a shift form
            if (step.actionTarget === '#addShiftButton' || 
                (step.actionTarget.includes('.employee-info strong') && document.querySelector(step.actionTarget)) ||
                (step.actionTarget.includes('.edit-shift-btn') && document.querySelector(step.actionTarget)) ) {
                // Check if the form is NOT already open before adding revert action
                const inlineFormContainer = document.querySelector('.inline-shift-form-container');
                if (!inlineFormContainer || (inlineFormContainer.style.display === 'none' || inlineFormContainer.offsetParent === null)) {
                    appState.addTutorialRevertAction({
                        type: 'close-shift-form',
                        openedByTutorial: true // Flag that tutorial opened it
                    });
                }
            }
            appState.addTutorialRevertAction({ type: 'click', target: triggerElement, originalState: null });
            triggerElement.click();
            await new Promise(resolve => setTimeout(resolve, dynamicActionWaitTime)); 
            actionPerformed = true;
        } else {
            console.warn(`APP_LOG: handleDynamicStepActions - actionTarget element not found: ${step.actionTarget}`);
        }
    } else if (step.isDynamic && step.dynamicTrigger && !actionPerformed) {
        // console.log(`APP_LOG: handleDynamicStepActions - Performing click on dynamicTrigger: ${step.dynamicTrigger}`);
        const triggerElement = document.querySelector(step.dynamicTrigger);
        if (triggerElement) {
            // Check if this action opens a shift form
            if (step.dynamicTrigger.includes('#addShiftButton') || 
                step.dynamicTrigger.includes('.edit-shift-btn') || 
                step.dynamicTrigger.includes('.employee-info strong')) {
                // Check if the form is NOT already open before adding revert action
                const inlineFormContainer = document.querySelector('.inline-shift-form-container');
                if (!inlineFormContainer || (inlineFormContainer.style.display === 'none' || inlineFormContainer.offsetParent === null)) {
                    appState.addTutorialRevertAction({
                        type: 'close-shift-form',
                        openedByTutorial: true // Flag that tutorial opened it
                    });
                }
            }
            appState.addTutorialRevertAction({ type: 'click', target: triggerElement, originalState: null }); 
            triggerElement.click();

            // If this dynamic trigger is known to open a shift form, wait for the form to be ready
            if (step.dynamicTrigger.includes('#addShiftButton') || 
                step.dynamicTrigger.includes('.edit-shift-btn') || 
                step.dynamicTrigger.includes('.employee-info strong')) {
                
                const formElement = await ensureElementIsReady('.inline-shift-form-container', 1500); // Wait up to 1.5s for form
                if (formElement) {
                    console.log("APP_LOG: handleDynamicStepActions - Inline shift form confirmed ready after dynamic trigger.");
                } else {
                    console.warn("APP_WARN: handleDynamicStepActions - Inline shift form NOT found/ready after dynamic trigger:", step.dynamicTrigger);
                    // Fallback to a small fixed delay if ensureElementIsReady fails, to prevent hanging indefinitely
                    // but this indicates a potential issue if the form doesn't appear as expected.
                    await new Promise(resolve => setTimeout(resolve, dynamicActionWaitTime)); 
                }
            } else {
                // For other dynamic actions, use the standard wait time
                await new Promise(resolve => setTimeout(resolve, dynamicActionWaitTime));
            }
            actionPerformed = true;
        } else {
            console.warn(`APP_LOG: handleDynamicStepActions - dynamicTrigger element not found: ${step.dynamicTrigger}`);
        }
    }

    if (step.sectionToExpand && !actionPerformed) {
        // console.log(`APP_LOG: handleDynamicStepActions - Expanding section: ${step.sectionToExpand}`);
        const section = document.querySelector(step.sectionToExpand);
        const collapsibleParent = section ? section.closest('.collapsible-section') : null; // Fictional class
        const trigger = collapsibleParent ? collapsibleParent.querySelector('.collapse-trigger') : null; // Fictional class

        if (section && trigger && collapsibleParent && collapsibleParent.classList.contains('collapsed')) { 
            appState.addTutorialRevertAction({ 
                type: 'toggle-collapse', 
                target: trigger, // The element to click to revert
                sectionTarget: section, // The section whose state we might check
                initialCollapsedState: true 
            });
            trigger.click();
            await new Promise(resolve => setTimeout(resolve, dynamicActionDelay)); 
        } else if (section && !trigger && section.classList.contains('collapsed')) { 
             appState.addTutorialRevertAction({ 
                type: 'toggle-class', 
                target: section, 
                className: 'collapsed', 
                shouldHaveClass: true // It was collapsed, so revert should add it back
            });
            section.classList.remove('collapsed'); 
            await new Promise(resolve => setTimeout(resolve, dynamicActionDelay));
        }
    }
    if (step.tabToFocus) { 
        // console.log(`APP_LOG: handleDynamicStepActions - Focusing tab: ${step.tabToFocus}`);
        const tabButton = document.querySelector(step.tabToFocus);
        if (tabButton) {
            const tabContainer = tabButton.closest('.tab-container'); // Fictional
            const currentlyActiveTabButton = tabContainer ? tabContainer.querySelector('.tab-button.active') : null;
            if (currentlyActiveTabButton && currentlyActiveTabButton !== tabButton) {
                 appState.addTutorialRevertAction({ 
                    type: 'click', // Revert by clicking the original tab
                    target: currentlyActiveTabButton 
                });
            }
            tabButton.click();
            await new Promise(resolve => setTimeout(resolve, dynamicActionDelay)); 
        } else {
            console.warn(`APP_LOG: handleDynamicStepActions - tabToFocus element not found: ${step.tabToFocus}`);
        }
    }
}


export async function showTutorialStep(stepIndex, tutorialData) {
    // console.log(`APP_LOG: showTutorialStep called for stepIndex: ${stepIndex}`);
    if (!tutorialData || stepIndex < 0 || stepIndex >= tutorialData.length) {
        console.error("APP_LOG: Invalid tutorial data or step index.", tutorialData, stepIndex);
        closeTutorial();
        return;
    }

    // Prevent body scrolling when tutorial step is shown
    document.body.style.overflow = 'hidden';

    const step = tutorialData[stepIndex];
    // console.log("APP_LOG: Current tutorial step data:", step);

    if (!domElements || !domElements.tutorialOverlay || !domElements.tutorialHighlightBox || !domElements.tutorialTextBox) {
        console.error("APP_LOG: Tutorial DOM elements not found. Aborting.", domElements);
        return;
    }

    const textBox = domElements.tutorialTextBox;
    const highlightBox = domElements.tutorialHighlightBox;
    const overlay = domElements.tutorialOverlay;

    // Determine if the textbox was hidden before this step
    // It's hidden if overlay was display:none, or textbox itself was display:none or opacity ~0
    const textBoxWasEffectivelyHidden = overlay.style.display === 'none' || 
                                      textBox.style.display === 'none' ||
                                      parseFloat(window.getComputedStyle(textBox).opacity) < 0.1;

    if (textBoxWasEffectivelyHidden) {
        textBox.style.opacity = '0'; // Prepare for fade-in if it was hidden
    }

    // Clean up previous scroll/resize listener if any
    if (appState.state.tutorialScrollResizeHandler) {
        window.removeEventListener('scroll', appState.state.tutorialScrollResizeHandler, true);
        window.removeEventListener('resize', appState.state.tutorialScrollResizeHandler);
        appState.setTutorialAnimationId(null); 
        // console.log("APP_LOG: Removed previous scroll/resize listeners.");
    }
    appState.setCurrentTutorialTargetElement(null); 

    appState.clearTutorialRevertActions();    if (step.isDynamic || step.action || step.sectionToExpand || step.tabToFocus || step.actionsBefore) {
        console.log("APP_LOG: Step has dynamic actions. Attempting to handle them.", step);
        await handleDynamicStepActions(step);
    }

    let actualTargetElement = null;
    const primarySelector = step.element;
    const fallbackSelector = step.fallbackElement;

    if (primarySelector) {
        // console.log("APP_LOG: Attempting to find primary target with selector:", primarySelector);
        actualTargetElement = await ensureElementIsReady(primarySelector, 1000); // Using increased default timeout
    }
    if (!actualTargetElement && fallbackSelector) {
        // console.log("APP_LOG: Primary target not found or undefined, trying fallback with selector:", fallbackSelector);
        actualTargetElement = await ensureElementIsReady(fallbackSelector, 1000); // Using increased default timeout
    }
    
    appState.setCurrentTutorialTargetElement(actualTargetElement); 

    if (actualTargetElement && (actualTargetElement.offsetWidth > 0 || actualTargetElement.offsetHeight > 0 || actualTargetElement.getClientRects().length > 0)) {
        // console.log("APP_LOG: Target element confirmed visible after ensureElementIsReady:", actualTargetElement);
    } else {
        console.warn("APP_LOG: Target element NOT visible or found after ensureElementIsReady. Selector:", primarySelector || fallbackSelector);
        actualTargetElement = null;
        appState.setCurrentTutorialTargetElement(null);
    }

    const stepTitle = step.title || "Tutorial Tip";
    const stepText = step.text || "No text for this step.";

    if (domElements.tutorialTitle) domElements.tutorialTitle.textContent = stepTitle;
    if (domElements.tutorialText) domElements.tutorialText.textContent = stepText;    const repositionElements = () => {
        const currentTarget = appState.state.currentTutorialTargetElement; // Get fresh target from state
        if (currentTarget && domElements.tutorialHighlightBox && domElements.tutorialTextBox) {
            positionHighlightBox(domElements.tutorialHighlightBox, currentTarget);
            
            // Use the actual target element's rect for positioning calculations
            // This ensures we're avoiding overlap with the real content, not just the highlight box
            const targetRect = currentTarget.getBoundingClientRect();

            if (domElements.tutorialTextBox && step && targetRect) {                 positionTextBox(domElements.tutorialTextBox, step, targetRect);
            } else {
                 console.warn("APP_WARN: repositionElements - Missing elements for textbox positioning. Positioning generically.");
                 // Generic positioning for the text box if highlight failed or rect not available
                const textBox = domElements.tutorialTextBox;
                textBox.style.position = 'fixed'; 
                textBox.style.top = '20%';
                textBox.style.left = '50%';
                textBox.style.transform = 'translateX(-50%)';
                textBox.style.zIndex = '10001';
                textBox.style.opacity = '1';
                textBox.style.backgroundColor = 'white'; 
                textBox.style.color = 'black'; 
                textBox.style.padding = '1em';
                textBox.style.border = '2px solid black';
                textBox.style.right = 'auto';
                textBox.style.bottom = 'auto';
            }
        } else if (!currentTarget && domElements.tutorialTextBox) { // No target, but textbox exists
            // Generic positioning for the text box
            const textBox = domElements.tutorialTextBox;
            textBox.style.position = 'fixed'; 
            textBox.style.top = '20%';
            textBox.style.left = '50%';
            textBox.style.transform = 'translateX(-50%)';
            // ... other generic styles from original else block ...
            textBox.style.zIndex = '10001';
            textBox.style.opacity = '1';
            textBox.style.backgroundColor = 'white'; 
            textBox.style.color = 'black'; 
            textBox.style.padding = '1em';
            textBox.style.border = '2px solid black';
            textBox.style.right = 'auto';
            textBox.style.bottom = 'auto';

            if (domElements.tutorialHighlightBox) {
                domElements.tutorialHighlightBox.style.display = 'none';
                domElements.tutorialHighlightBox.style.boxShadow = 'none';
            }
            if (domElements.tutorialOverlay) {
                 domElements.tutorialOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            }
        }
    };


    if (actualTargetElement) {
        // Scroll to the element first
        actualTargetElement.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });

        // Wait for scroll to complete and DOM to settle before positioning
        await new Promise(resolve => setTimeout(resolve, 100)); // Increased delay after scroll

        domElements.tutorialOverlay.style.display = 'block';
        domElements.tutorialOverlay.style.backgroundColor = 'transparent';
        domElements.tutorialTextBox.style.display = 'block';

        // Force reflow for target and textbox before initial positioning attempt
        if (actualTargetElement) actualTargetElement.offsetHeight; 
        // if (domElements.tutorialTextBox) domElements.tutorialTextBox.offsetHeight; // textBox.offsetHeight

    requestAnimationFrame(() => {
        repositionElements(); // Initial positioning

        if (textBoxWasEffectivelyHidden) {
            // Delay opacity transition to ensure new positions are applied
            // and the fade-in happens at the new spot.
            requestAnimationFrame(() => {
                textBox.style.opacity = '1';
            });
        } else {
            // If it was already visible, ensure opacity is 1 (it should be, but for safety)
            // This won't trigger a new transition if opacity is already 1.
            textBox.style.opacity = '1';
        }

        // Store and set up new scroll/resize listener
        const newScrollResizeHandler = () => {
            // Debounce or throttle if performance becomes an issue
            if (appState.state.tutorialAnimationId) cancelAnimationFrame(appState.state.tutorialAnimationId);
            const animId = requestAnimationFrame(repositionElements);
            appState.setTutorialAnimationId(animId);
        };
        appState.state.tutorialScrollResizeHandler = newScrollResizeHandler; // Store raw for removal
        window.addEventListener('scroll', newScrollResizeHandler, true); 
        window.addEventListener('resize', newScrollResizeHandler);
        // console.log("APP_LOG: Added scroll/resize listeners for target element.");
    });

    } else { // No target element
        console.warn(`APP_LOG: No valid target element for step: '${step.title}'. Positioning text box generically.`);
        domElements.tutorialOverlay.style.display = 'block';
        domElements.tutorialOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        if (domElements.tutorialHighlightBox) {
            domElements.tutorialHighlightBox.style.display = 'none';
            domElements.tutorialHighlightBox.style.boxShadow = 'none';
        }
        const textBox = domElements.tutorialTextBox;
        textBox.style.display = 'block';
        // ... (generic positioning as in repositionElements's else if) ...
        textBox.style.position = 'fixed'; 
        textBox.style.top = '20%';
        textBox.style.left = '50%';
        textBox.style.transform = 'translateX(-50%)';
        textBox.style.zIndex = '10001'; 
        textBox.style.opacity = '1';
        textBox.style.backgroundColor = 'white'; 
        textBox.style.color = 'black'; 
        textBox.style.padding = '1em';
        textBox.style.border = '2px solid black';
        textBox.style.right = 'auto';
        textBox.style.bottom = 'auto';

        // Ensure no listeners are active if there's no target
        if (appState.state.tutorialScrollResizeHandler) {
            window.removeEventListener('scroll', appState.state.tutorialScrollResizeHandler, true);
            window.removeEventListener('resize', appState.state.tutorialScrollResizeHandler);
            appState.state.tutorialScrollResizeHandler = null;
            // console.log("APP_LOG: Removed scroll/resize listeners as there's no target.");
        }
    }

    if (domElements.tutorialStepCounter) {
        domElements.tutorialStepCounter.textContent = `Step ${stepIndex + 1} of ${tutorialData.length}`;
    }

    // If this step had a 'revertNext' flag from the *previous* step, execute reverts now.
    // This logic is a bit tricky. It's better to revert *before* showing the next step,
    // or at the end of the current step if the user clicks "Next".
    // Let's adjust to revert actions from the *previous* step when "Next" or "Prev" is clicked.
    // This function (showTutorialStep) is about setting up the *current* step.
    // Revert actions should be tied to navigation events.
}

export function positionHighlightBox(highlightBox, targetElement) {
    if (!highlightBox || !targetElement) {
        console.warn("APP_WARN: positionHighlightBox called with null highlightBox or targetElement");
        if (domElements.tutorialHighlightBox) {
            domElements.tutorialHighlightBox.style.display = 'none';
            domElements.tutorialHighlightBox.style.boxShadow = 'none';
        }
        return;
    }

    const rect = targetElement.getBoundingClientRect();
    
    // Only set positioning styles, let CSS handle transitions
    highlightBox.style.position = 'absolute';
    highlightBox.style.display = 'block';
    highlightBox.style.border = 'none'; 
    highlightBox.style.backgroundColor = 'transparent'; 
    highlightBox.style.zIndex = '10000'; 
    highlightBox.style.pointerEvents = 'none'; 
    highlightBox.style.boxSizing = 'border-box';
    highlightBox.style.margin = '0'; 
    highlightBox.style.padding = '0'; 
    
    // Don't override the CSS transition - let it handle the animation
    // highlightBox.style.transition = 'top 0.3s ease-in-out, left 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, box-shadow 0.3s ease-in-out';

    // Set dimensions and position - these will animate via CSS transitions
    highlightBox.style.width = rect.width + 'px';
    highlightBox.style.height = rect.height + 'px';
    highlightBox.style.top = rect.top + 'px';
    highlightBox.style.left = rect.left + 'px';

    const shadowSpread = Math.max(window.innerWidth, window.innerHeight, 500) * 2; 
    highlightBox.style.boxShadow = `0 0 0 ${shadowSpread}px rgba(0, 0, 0, 0.7)`;
    
    console.log(`APP_LOG: positionHighlightBox - Positioned at {top: ${rect.top}, left: ${rect.left}, width: ${rect.width}, height: ${rect.height}}`);
}

export function positionTextBox(textBox, step, highlightRect) { // Removed isFirstOrHidden parameter
    if (!textBox || !step || !highlightRect) {
        console.warn("APP_WARN: positionTextBox called with null arguments", { textBox:!!textBox, step:!!step, highlightRect:!!highlightRect });
        if(textBox) textBox.style.display = 'none';
        return;
    }

    // Set basic styling properties (preserve CSS transitions)
    textBox.style.display = 'block'; 
    textBox.style.position = 'absolute'; 
    textBox.style.zIndex = '10001'; 
    // Don't override CSS transitions - let CSS handle the animation
    textBox.style.backgroundColor = 'white'; 
    textBox.style.color = 'black'; 
    textBox.style.padding = '1em';
    textBox.style.border = '2px solid black';
    textBox.style.boxSizing = 'border-box';
    textBox.style.margin = '0';
    textBox.style.maxWidth = '400px';
    textBox.style.width = 'auto'; 
    textBox.style.height = 'auto'; 
    textBox.style.overflowY = 'visible';
    textBox.style.transform = 'none'; // Reset any previous transforms
    
    // Don't clear positioning properties - this breaks CSS transitions!
    // Instead, just set new values directly to allow smooth animation

    // Force reflow to get accurate dimensions for textBox
    textBox.getBoundingClientRect();

    let textBoxRect = textBox.getBoundingClientRect(); 
    let newTop, newLeft;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;    const options = {
        verticalMargin: 40, // Increased from 30px for more space
        horizontalMargin: 40, // Increased from 30px for more space  
        overlapBuffer: 20, // Increased from 10px for clearer separation
        minDistanceFromHighlight: 50, // Minimum distance from any edge of highlighted element
    };

    // Helper function to check for overlap between two rects with buffer
    function doesOverlap(r1, r2, buffer = options.overlapBuffer) {
        return !(
            r1.left + r1.width + buffer < r2.left || // r1 is to the left of r2
            r1.left > r2.left + r2.width + buffer || // r1 is to the right of r2
            r1.top + r1.height + buffer < r2.top || // r1 is above r2
            r1.top > r2.top + r2.height + buffer    // r1 is below r2
        );
    }

    let determinedPosition = '';
    let positionFound = false;    // Define potential positions and their calculation logic
    // Order defines preference: above, below, right, left
    const positionCalculators = {
        above: () => ({
            top: highlightRect.top - textBoxRect.height - options.minDistanceFromHighlight,
            left: highlightRect.left + (highlightRect.width / 2) - (textBoxRect.width / 2),
        }),
        below: () => ({
            top: highlightRect.bottom + options.minDistanceFromHighlight,
            left: highlightRect.left + (highlightRect.width / 2) - (textBoxRect.width / 2),
        }),
        right: () => ({
            top: highlightRect.top + (highlightRect.height / 2) - (textBoxRect.height / 2),
            left: highlightRect.right + options.minDistanceFromHighlight,
        }),
        left: () => ({
            top: highlightRect.top + (highlightRect.height / 2) - (textBoxRect.height / 2),
            left: highlightRect.left - textBoxRect.width - options.minDistanceFromHighlight,
        }),
        // Additional corner positions for when standard positions don't work
        topLeft: () => ({
            top: highlightRect.top - textBoxRect.height - options.minDistanceFromHighlight,
            left: highlightRect.left - textBoxRect.width - options.minDistanceFromHighlight,
        }),
        topRight: () => ({
            top: highlightRect.top - textBoxRect.height - options.minDistanceFromHighlight,
            left: highlightRect.right + options.minDistanceFromHighlight,
        }),
        bottomLeft: () => ({
            top: highlightRect.bottom + options.minDistanceFromHighlight,
            left: highlightRect.left - textBoxRect.width - options.minDistanceFromHighlight,
        }),
        bottomRight: () => ({
            top: highlightRect.bottom + options.minDistanceFromHighlight,
            left: highlightRect.right + options.minDistanceFromHighlight,
        }),
    };const positionPreferences = [];
    
    // Smart position preference based on highlighted element location
    const highlightCenterX = highlightRect.left + highlightRect.width / 2;
    const highlightCenterY = highlightRect.top + highlightRect.height / 2;
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;
    
    // Prefer side positioning if element is in center area of screen
    const isInHorizontalCenter = Math.abs(highlightCenterX - viewportCenterX) < viewportWidth * 0.25;
    const isInVerticalCenter = Math.abs(highlightCenterY - viewportCenterY) < viewportHeight * 0.25;
      if (isInVerticalCenter) {
        // Element is vertically centered, prefer side positioning
        if (highlightCenterX < viewportCenterX) {
            positionPreferences.push('right', 'left', 'above', 'below', 'topRight', 'bottomRight', 'topLeft', 'bottomLeft');
        } else {
            positionPreferences.push('left', 'right', 'above', 'below', 'topLeft', 'bottomLeft', 'topRight', 'bottomRight');
        }
    } else if (isInHorizontalCenter) {
        // Element is horizontally centered, prefer top/bottom positioning
        if (highlightCenterY < viewportCenterY) {
            positionPreferences.push('below', 'above', 'right', 'left', 'bottomRight', 'bottomLeft', 'topRight', 'topLeft');
        } else {
            positionPreferences.push('above', 'below', 'right', 'left', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft');
        }
    } else {
        // Default preference order with corner fallbacks
        positionPreferences.push('above', 'below', 'right', 'left', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft');
    }
    
    // Add preferred position from step if specified and not already first
    if (step.preferredPosition && positionCalculators[step.preferredPosition]) {
        const preferredIndex = positionPreferences.indexOf(step.preferredPosition);
        if (preferredIndex > 0) {
            positionPreferences.splice(preferredIndex, 1);
            positionPreferences.unshift(step.preferredPosition);
        } else if (preferredIndex === -1) {
            positionPreferences.unshift(step.preferredPosition);
        }
    }    for (const posName of positionPreferences) {
        const pos = positionCalculators[posName]();
        const candidateRect = {
            top: pos.top,
            left: pos.left,
            width: textBoxRect.width,
            height: textBoxRect.height,
        };        // Check if it fits in viewport with additional safety margin
        const fitsViewport = 
            candidateRect.top >= options.verticalMargin &&
            candidateRect.left >= options.horizontalMargin &&
            candidateRect.top + candidateRect.height <= viewportHeight - options.verticalMargin &&
            candidateRect.left + candidateRect.width <= viewportWidth - options.horizontalMargin;

        if (fitsViewport && !doesOverlap(candidateRect, highlightRect)) {
            newTop = candidateRect.top;
            newLeft = candidateRect.left;
            determinedPosition = `non-overlap-${posName}`;
            positionFound = true;
            console.log(`APP_LOG: positionTextBox - Found non-overlapping position: ${determinedPosition}`);
            break;
        }
    }    // --- Fallback positioning strategy if no non-overlapping position is found ---
    if (!positionFound) {
        console.warn("APP_WARN: positionTextBox - No non-overlapping position found. Using safe edge positioning.");
        
        // Try positioning at viewport edges, away from the highlighted element
        const safePositions = [];
        
        // Top edge positioning
        if (highlightRect.top > viewportHeight * 0.4) { // Highlight is in lower portion
            safePositions.push({
                top: options.verticalMargin,
                left: (viewportWidth / 2) - (textBoxRect.width / 2),
                name: 'safe-top-edge'
            });
        }
        
        // Bottom edge positioning  
        if (highlightRect.bottom < viewportHeight * 0.6) { // Highlight is in upper portion
            safePositions.push({
                top: viewportHeight - textBoxRect.height - options.verticalMargin,
                left: (viewportWidth / 2) - (textBoxRect.width / 2),
                name: 'safe-bottom-edge'
            });
        }
        
        // Left edge positioning
        if (highlightRect.left > viewportWidth * 0.4) { // Highlight is on right side
            safePositions.push({
                top: (viewportHeight / 2) - (textBoxRect.height / 2),
                left: options.horizontalMargin,
                name: 'safe-left-edge'
            });
        }
        
        // Right edge positioning
        if (highlightRect.right < viewportWidth * 0.6) { // Highlight is on left side
            safePositions.push({
                top: (viewportHeight / 2) - (textBoxRect.height / 2),
                left: viewportWidth - textBoxRect.width - options.horizontalMargin,
                name: 'safe-right-edge'
            });
        }
        
        // Find the first safe position that doesn't overlap
        let safePositionFound = false;
        for (const safePos of safePositions) {
            const candidateRect = {
                top: safePos.top,
                left: safePos.left,
                width: textBoxRect.width,
                height: textBoxRect.height,
            };
            
            if (!doesOverlap(candidateRect, highlightRect)) {
                newTop = safePos.top;
                newLeft = safePos.left;
                determinedPosition = safePos.name;
                safePositionFound = true;
                console.log(`APP_LOG: positionTextBox - Found safe edge position: ${determinedPosition}`);
                break;
            }
        }
        
        // Final fallback: Use the furthest corner from highlight center
        if (!safePositionFound) {
            const highlightCenterX = highlightRect.left + highlightRect.width / 2;
            const highlightCenterY = highlightRect.top + highlightRect.height / 2;
            
            const corners = [
                { top: options.verticalMargin, left: options.horizontalMargin, name: 'top-left-corner' },
                { top: options.verticalMargin, left: viewportWidth - textBoxRect.width - options.horizontalMargin, name: 'top-right-corner' },
                { top: viewportHeight - textBoxRect.height - options.verticalMargin, left: options.horizontalMargin, name: 'bottom-left-corner' },
                { top: viewportHeight - textBoxRect.height - options.verticalMargin, left: viewportWidth - textBoxRect.width - options.horizontalMargin, name: 'bottom-right-corner' }
            ];
            
            // Calculate distance from highlight center to each corner and pick the furthest
            let maxDistance = -1;
            let bestCorner = corners[0];
            
            for (const corner of corners) {
                const cornerCenterX = corner.left + textBoxRect.width / 2;
                const cornerCenterY = corner.top + textBoxRect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(cornerCenterX - highlightCenterX, 2) + 
                    Math.pow(cornerCenterY - highlightCenterY, 2)
                );
                
                if (distance > maxDistance) {
                    maxDistance = distance;
                    bestCorner = corner;
                }
            }
            
            newTop = bestCorner.top;
            newLeft = bestCorner.left;
            determinedPosition = `fallback-${bestCorner.name}`;
            console.log(`APP_LOG: positionTextBox - Using furthest corner fallback: ${determinedPosition}`);
        }
    }

    // --- Clamp Horizontal Position (newLeft) ---
    // This applies to all positions (above, below, left, right, center)
    if (newLeft < options.horizontalMargin) {
        newLeft = options.horizontalMargin;
        determinedPosition += '-clamped-left-edge';
    }
    if (newLeft + textBoxRect.width > viewportWidth - options.horizontalMargin) {
        newLeft = viewportWidth - textBoxRect.width - options.horizontalMargin;
        determinedPosition += '-clamped-right-edge';
        if (newLeft < options.horizontalMargin) { // If it's still too wide after trying to fit
             newLeft = options.horizontalMargin;
             textBox.style.width = (viewportWidth - 2 * options.horizontalMargin) + 'px';
             textBoxRect = textBox.getBoundingClientRect(); // Re-measure, height might change
             determinedPosition += '-width-constrained';
             // If centered horizontally, re-center after width constraint
             if (determinedPosition.includes('fallback-center-viewport') || 
                 determinedPosition.includes('-above') || determinedPosition.includes('-below')) {
                newLeft = highlightRect.left + (highlightRect.width / 2) - (textBoxRect.width / 2);
                // Re-clamp after re-centering with new width
                if (newLeft < options.horizontalMargin) newLeft = options.horizontalMargin;
                if (newLeft + textBoxRect.width > viewportWidth - options.horizontalMargin) {
                    newLeft = viewportWidth - textBoxRect.width - options.horizontalMargin;
                }
             }
        }
    }

    // --- Clamp Vertical Position (newTop) and Handle Overflow ---
    // This applies to all positions
    textBox.style.height = 'auto'; // Reset height before vertical clamping
    textBox.style.overflowY = 'visible';
    textBoxRect = textBox.getBoundingClientRect(); // Re-measure with auto height

    if (newTop < options.verticalMargin) {
        newTop = options.verticalMargin;
        determinedPosition += '-clamped-top-edge';
    }
    if (newTop + textBoxRect.height > viewportHeight - options.verticalMargin) {
        // Try to fit by pushing it up, but not above top margin
        newTop = viewportHeight - textBoxRect.height - options.verticalMargin;
        determinedPosition += '-clamped-bottom-edge';
        if (newTop < options.verticalMargin) { // If it's taller than viewport minus margins
            newTop = options.verticalMargin;
            textBox.style.height = (viewportHeight - 2 * options.verticalMargin) + 'px';
            textBox.style.overflowY = 'auto';
            textBoxRect = textBox.getBoundingClientRect(); // Update rect with new constrained height
            determinedPosition += '-height-constrained-overflow';
        }
    }
    
    // Final check for horizontal positions if height was constrained
    if (determinedPosition.includes('-height-constrained-overflow') && 
        (determinedPosition.includes('-left') || determinedPosition.includes('-right'))) {
        // Re-center vertically if it was a side placement and height got constrained
        newTop = highlightRect.top + (highlightRect.height / 2) - (textBoxRect.height / 2);
        // And re-clamp this new vertical position
        if (newTop < options.verticalMargin) newTop = options.verticalMargin;
        if (newTop + textBoxRect.height > viewportHeight - options.verticalMargin) {
             newTop = viewportHeight - textBoxRect.height - options.verticalMargin;
             if (newTop < options.verticalMargin) newTop = options.verticalMargin; // Should not happen if height is constrained
        }
    }

    // console.log(`APP_LOG: positionTextBox - Determined position: ${determinedPosition}`, {newTop, newLeft, textBoxWidth: textBoxRect.width, textBoxHeight: textBoxRect.height});    textBox.style.top = newTop + 'px';
    textBox.style.left = newLeft + 'px';
    // Opacity is handled by showTutorialStep for initial fade-in, or remains 1 for moves.
}

export function closeTutorial() {
    console.log("APP_LOG: closeTutorial called.");
    appState.executeAndClearTutorialRevertActions();


    // Clean up scroll/resize listener
    if (appState.state.tutorialScrollResizeHandler) {
        window.removeEventListener('scroll', appState.state.tutorialScrollResizeHandler, true);
        window.removeEventListener('resize', appState.state.tutorialScrollResizeHandler);
        appState.state.tutorialScrollResizeHandler = null;
        if (appState.state.tutorialAnimationId) {
            cancelAnimationFrame(appState.state.tutorialAnimationId);
            appState.setTutorialAnimationId(null);
        }
        // console.log("APP_LOG: Removed scroll/resize listeners on closeTutorial.");
    }

    if (domElements.tutorialOverlay) {
        domElements.tutorialOverlay.style.display = 'none';
    }
    if (domElements.tutorialHighlightBox) {
        domElements.tutorialHighlightBox.style.display = 'none';
        domElements.tutorialHighlightBox.style.boxShadow = 'none'; 
    }
    if (domElements.tutorialTextBox) {
        domElements.tutorialTextBox.style.display = 'none';
        domElements.tutorialTextBox.style.opacity = '0'; // Ensure it's hidden and ready for next show
    }

    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

export function hideTutorial() {
    console.log("APP_LOG: hideTutorial executed.");
    closeTutorial(); // Consolidate cleanup logic

    // Reset current tutorial state in appState
    // This is handled by events-tutorial.js calling state.clearCurrentTutorial()
}

export function initTutorialUI() {
    if (!domElements.tutorialOverlay || !domElements.tutorialHighlightBox || !domElements.tutorialTextBox) {
        console.error("APP_ERROR: initTutorialUI - One or more core tutorial DOM elements are missing from domElements.");
        return;
    }

    const overlay = domElements.tutorialOverlay;
    const highlightBox = domElements.tutorialHighlightBox;
    const textBox = domElements.tutorialTextBox;

    if (!document.body.contains(overlay)) {
        document.body.appendChild(overlay);
    }    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw'; // Use vw/vh for full viewport coverage reliably
    overlay.style.height = '100vh';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'auto'; // CHANGED: Ensure overlay catches clicks
    overlay.style.display = 'none'; // Start hidden, will be shown when tutorial starts
    // When tutorial is active, prevent body scrolling
    // document.body.style.overflow = 'hidden'; // This will be set when tutorial starts

    if (highlightBox.parentNode !== overlay) {
        overlay.appendChild(highlightBox);
    }    // highlightBox styles are set in positionHighlightBox, ensure it's 'absolute' for positioning within fixed overlay
    highlightBox.style.position = 'absolute'; 
    highlightBox.style.display = 'none'; // Start hidden
    
    if (textBox.parentNode !== overlay) {
        overlay.appendChild(textBox);
    }
    // textBox styles are set in positionTextBox, ensure it's 'absolute' for positioning within fixed overlay
    textBox.style.position = 'absolute';
    textBox.style.display = 'none'; // Start hidden

    requestAnimationFrame(() => {
        // console.log("APP_LOG: initTutorialUI (rAF) - Checking offsetParents after DOM updates:");
        // console.log("APP_LOG: initTutorialUI (rAF) - Overlay offsetParent:", overlay.offsetParent, "Computed Display:", window.getComputedStyle(overlay).display);
        // console.log("APP_LOG: initTutorialUI (rAF) - HighlightBox offsetParent:", highlightBox.offsetParent, "Computed Display:", window.getComputedStyle(highlightBox).display);
        // console.log("APP_LOG: initTutorialUI (rAF) - TextBox offsetParent:", textBox.offsetParent, "Computed Display:", window.getComputedStyle(textBox).display);
        
        overlay.style.display = 'none'; // Hide after setup
        // console.log("APP_LOG: initTutorialUI (rAF) - Overlay display set to none.");

        // Event listeners for tutorial navigation buttons are handled by main.js
        // Only set up the close button listener here since it calls the local hideTutorial function
        if (domElements.tutorialCloseButton) {
            domElements.tutorialCloseButton.removeEventListener('click', hideTutorial);
            domElements.tutorialCloseButton.addEventListener('click', hideTutorial);
        }
        // console.log("APP_LOG: initTutorialUI (rAF) - Close button event listener attached.");
    });

    // console.log("APP_LOG: initTutorialUI - Synchronous part complete, rAF scheduled.");
}

// Remove the placeholder UI-specific handlers as we now import directly from events-tutorial.js
/*
async function handleNextTutorialStep_UI() {
    // This function would ideally be `handleNextTutorialStep` from `events-tutorial.js`
    // but to avoid import cycles if events-tutorial also imports ui-tutorial,
    // we'd need a central place to wire them or use a mediator/event bus.
    // For now, assume events-tutorial.js functions are globally available or passed.
    if (window.handleNextTutorialStep) window.handleNextTutorialStep();
    else console.warn("APP_WARN: window.handleNextTutorialStep not found for UI button.");
}

async function handlePrevTutorialStep_UI() {
    if (window.handlePrevTutorialStep) window.handlePrevTutorialStep();
    else console.warn("APP_WARN: window.handlePrevTutorialStep not found for UI button.");
}
*/

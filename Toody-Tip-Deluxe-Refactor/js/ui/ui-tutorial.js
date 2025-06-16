import { domElements } from '../domElements.js';
// import { someUtilFunction } from '../utils.js'; // Example if needed

// Helper function (potentially to be moved to a shared utils.js if more broadly used)
async function ensureElementIsReady(selector, timeout = 500, attempt = 1) {
    console.log(`APP_LOG: ensureElementIsReady - Attempt ${attempt} for selector: ${selector}, timeout: ${timeout}`);
    return new Promise((resolve) => {
        let elapsedTime = 0;
        const intervalTime = 50; // Check more frequently initially

        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element && (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0)) {
                const style = window.getComputedStyle(element);
                if (style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0') {
                     console.log(`APP_LOG: ensureElementIsReady - Element found and visible: ${selector}`, element);
                    resolve(element);
                    return;
                } else {
                    console.log(`APP_LOG: ensureElementIsReady - Element found but not visible (hidden, display:none, or opacity:0): ${selector}`, style.visibility, style.display, style.opacity);
                }
            }
            
            elapsedTime += intervalTime;
            if (elapsedTime < timeout) {
                setTimeout(checkElement, intervalTime);
            } else {
                console.warn(`APP_LOG: ensureElementIsReady - Timeout. Element not found or not visible: ${selector}`);
                resolve(null); // Timeout
            }
        };
        setTimeout(checkElement, 50); // Initial delay
    });
}

export async function showTutorialStep(stepIndex, tutorialData, domElementsInstance) {
    // Note: domElementsInstance is passed in, assuming it's already initialized
    // If domElements is globally available via its own module, direct import is also an option.
    // For this refactor, we'll assume domElements is passed if it was passed to the original ui.js functions.
    // If it was imported directly in ui.js, the new module should also import it directly.
    // Based on ui.js structure, it seems domElements is imported, so we'll use that.

    console.log(`APP_LOG: showTutorialStep called for stepIndex: ${stepIndex}`);
    if (!tutorialData || stepIndex < 0 || stepIndex >= tutorialData.length) {
        console.error("APP_LOG: Invalid tutorial data or step index.", tutorialData, stepIndex);
        closeTutorial(domElements); // Assumes domElements is available via import
        return;
    }

    const step = tutorialData[stepIndex];
    console.log("APP_LOG: Current tutorial step data:", step);

    if (!domElements || !domElements.tutorialOverlay || !domElements.tutorialHighlightBox || !domElements.tutorialTextBox) {
        console.error("APP_LOG: Tutorial DOM elements not found. Aborting.", domElements);
        return;
    }

    domElements.tutorialOverlay.style.display = 'block';
    domElements.tutorialTextBox.style.display = 'block';

    let actualTargetElement = null;
    const primarySelector = step.target;
    const fallbackSelector = step.fallbackTarget;

    if (step.targetSection && domElements.navTabs && domElements.mainSections) {
        const navTabId = step.targetSection.navTabId;
        const sectionId = step.targetSection.sectionId;
        const targetNavTab = domElements.navTabs[navTabId];
        const targetMainSection = domElements.mainSections[sectionId];

        if (targetNavTab && targetMainSection) {
            const isSectionVisible = window.getComputedStyle(targetMainSection).display !== 'none';
            const isTabActive = targetNavTab.classList.contains('active-nav-btn') || (targetNavTab.parentElement && targetNavTab.parentElement.classList.contains('active'));

            if (!isSectionVisible || !isTabActive) {
                console.log(`APP_LOG: Switching to section: ${sectionId} by clicking tab: ${navTabId}`);
                targetNavTab.click();
                await ensureElementIsReady(`#${sectionId}`, 1000);
                await new Promise(resolve => setTimeout(resolve, 150));
            } else {
                console.log(`APP_LOG: Target section ${sectionId} is already visible and tab ${navTabId} is active.`);
            }
        } else {
            console.warn(`APP_LOG: Nav tab (${navTabId}) or main section (${sectionId}) not found in domElements for section switching.`);
        }
    }

    if (primarySelector) {
        actualTargetElement = await ensureElementIsReady(primarySelector, 500);
    }
    if (!actualTargetElement && fallbackSelector) {
        console.log("APP_LOG: Primary target not found, trying fallback:", fallbackSelector);
        actualTargetElement = await ensureElementIsReady(fallbackSelector, 500);
    }

    if (actualTargetElement) {
        console.log("APP_LOG: Found target element (before expansion checks):", actualTargetElement, "Selector:", primarySelector || fallbackSelector);
        actualTargetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        await new Promise(resolve => setTimeout(resolve, 300));

        let parent = actualTargetElement.parentElement;
        const elementsToExpand = [];
        while (parent) {
            if (parent.tagName === 'DETAILS' && !parent.open) {
                elementsToExpand.unshift(parent);
            }
            if (parent.classList.contains('collapsible-trigger') && parent.getAttribute('aria-expanded') === 'false') {
                 elementsToExpand.unshift(parent);
            } else if (parent.classList.contains('collapsible-section') && !parent.classList.contains('expanded')) {
                const trigger = document.querySelector(`[aria-controls="${parent.id}"], [data-bs-target="#${parent.id}"]`);
                if (trigger && trigger.getAttribute('aria-expanded') === 'false') {
                    elementsToExpand.unshift(trigger);
                }
            }
            parent = parent.parentElement;
        }

        if (elementsToExpand.length > 0) {
            console.log("APP_LOG: Need to expand parent elements:", elementsToExpand);
            for (const elToExpand of elementsToExpand) {
                if (elToExpand.tagName === 'DETAILS') {
                    elToExpand.open = true;
                    console.log("APP_LOG: Opened <details> element:", elToExpand);
                } else if (elToExpand.classList.contains('collapsible-trigger')) {
                    elToExpand.click();
                    console.log("APP_LOG: Clicked collapsible trigger:", elToExpand);
                }
                await new Promise(resolve => setTimeout(resolve, 250));
            }
            actualTargetElement = await ensureElementIsReady(primarySelector || fallbackSelector, 500);
            if (actualTargetElement) {
                 actualTargetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                 await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        if (actualTargetElement && (actualTargetElement.offsetWidth > 0 || actualTargetElement.offsetHeight > 0 || actualTargetElement.getClientRects().length > 0)) {
            console.log("APP_LOG: Target element confirmed visible after expansions/scroll:", actualTargetElement);
        } else {
            console.warn("APP_LOG: Target element NOT visible or found after expansions/scroll. Selector:", primarySelector || fallbackSelector);
            if (domElements.tutorialHighlightBox) domElements.tutorialHighlightBox.style.display = 'none';
            actualTargetElement = null;
        }
    } else {
        console.warn(`APP_LOG: Target element (or fallback) not found for step:`, step, `Selector: '${primarySelector || fallbackSelector || 'N/A'}'`);
        if (domElements.tutorialHighlightBox) domElements.tutorialHighlightBox.style.display = 'none';
    }

    const stepTitle = step.title || "Tutorial Tip";
    const stepText = step.text || "No text for this step.";

    if (domElements.tutorialTitle) {
        domElements.tutorialTitle.textContent = stepTitle;
    } else {
        console.warn('APP_LOG: domElements.tutorialTitle not found.');
    }

    if (domElements.tutorialText) {
        domElements.tutorialText.textContent = stepText;
    } else {
        console.warn('APP_LOG: domElements.tutorialText not found.');
    }

    if (actualTargetElement) {
        positionHighlightBox(actualTargetElement, domElements);
        const rect = actualTargetElement.getBoundingClientRect();
        const highlightRect = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
        positionTextBox(highlightRect, domElements);
    } else {
        console.warn(`APP_LOG: No valid target element to highlight for step: '${step.title}'. Positioning text box generically.`);
        if (domElements.tutorialHighlightBox) {
            domElements.tutorialHighlightBox.style.display = 'none';
        }
        const genericRect = {
            top: window.innerHeight * 0.15, left: window.innerWidth * 0.5,
            width: window.innerWidth * 0.6, height: 'auto'
         };
        positionTextBox(genericRect, domElements);
    }

    if (domElements.tutorialStepCounter) {
        domElements.tutorialStepCounter.textContent = `Step ${stepIndex + 1} of ${tutorialData.length}`;
    } else {
        console.warn("APP_LOG: domElements.tutorialStepCounter not found.");
    }
}

export function positionHighlightBox(targetElement, domElementsInstance) {
    // Using domElements via import
    if (!domElements || !domElements.tutorialHighlightBox || !targetElement) {
        if(domElements && domElements.tutorialHighlightBox) domElements.tutorialHighlightBox.style.display = 'none';
        return;
    }
    const rect = targetElement.getBoundingClientRect();
    const style = window.getComputedStyle(targetElement);

    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
        domElements.tutorialHighlightBox.style.display = 'none';
        return;
    }
    
    Object.assign(domElements.tutorialHighlightBox.style, {
        position: 'absolute',
        top: `${rect.top + window.scrollY - 5}px`, 
        left: `${rect.left + window.scrollX - 5}px`,
        width: `${rect.width + 10}px`, 
        height: `${rect.height + 10}px`,
        display: 'block',
        zIndex: '9999',
        border: '3px solid #007bff',
        borderRadius: '5px',
        boxShadow: '0 0 15px rgba(0,123,255,0.5)',
        transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out'
    });
}

export function positionTextBox(highlightRect, domElementsInstance) {
    // Using domElements via import
    if (!domElements || !domElements.tutorialTextBox) {
        if(domElements && domElements.tutorialTextBox) domElements.tutorialTextBox.style.display = 'none';
        return;
    }

    const textBox = domElements.tutorialTextBox;
    textBox.style.display = 'block'; 
    textBox.style.position = 'absolute'; 
    textBox.style.zIndex = '10001'; 
    textBox.style.transition = 'top 0.3s ease-in-out, left 0.3s ease-in-out, opacity 0.3s ease-in-out';
    textBox.style.opacity = '0';

    requestAnimationFrame(() => {
        const textBoxRect = textBox.getBoundingClientRect();
        let top, left;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;

        if (highlightRect && highlightRect.width > 0 && highlightRect.height > 0) {
            top = highlightRect.top + highlightRect.height + 15;
            left = highlightRect.left + (highlightRect.width / 2) - (textBoxRect.width / 2);

            if (left < 10) left = 10; 
            if (left + textBoxRect.width > viewportWidth - 10) {
                left = viewportWidth - textBoxRect.width - 10; 
            }
            if (top + textBoxRect.height > scrollY + viewportHeight - 10) { 
                top = highlightRect.top - textBoxRect.height - 15;
            }
            if (top < scrollY + 10) { 
                top = scrollY + 10; 
                if (highlightRect.top - textBoxRect.height - 15 < scrollY + 10) {
                    if (highlightRect.left + highlightRect.width + textBoxRect.width + 20 < viewportWidth) {
                        left = highlightRect.left + highlightRect.width + 15;
                        top = highlightRect.top + (highlightRect.height / 2) - (textBoxRect.height / 2);
                    } else if (highlightRect.left - textBoxRect.width - 20 > 0) {
                        left = highlightRect.left - textBoxRect.width - 15;
                        top = highlightRect.top + (highlightRect.height / 2) - (textBoxRect.height / 2);
                    } else {
                        top = scrollY + viewportHeight / 2 - textBoxRect.height / 2;
                        left = viewportWidth / 2 - textBoxRect.width / 2;
                    }
                    if (top < scrollY + 10) top = scrollY + 10;
                    if (top + textBoxRect.height > scrollY + viewportHeight - 10) top = scrollY + viewportHeight - textBoxRect.height - 10;
                }
            }
        } else { 
            top = scrollY + viewportHeight / 2 - textBoxRect.height / 2;
            left = viewportWidth / 2 - textBoxRect.width / 2;
        }
        
        textBox.style.top = `${top}px`;
        textBox.style.left = `${left}px`;
        textBox.style.opacity = '1';
    });
}

export function closeTutorial(domElementsInstance) {
    // Using domElements via import
    console.log("APP_LOG: closeTutorial called.");
    if (domElements.tutorialOverlay) domElements.tutorialOverlay.style.display = 'none';
    if (domElements.tutorialHighlightBox) domElements.tutorialHighlightBox.style.display = 'none';
    if (domElements.tutorialTextBox) domElements.tutorialTextBox.style.display = 'none';
}

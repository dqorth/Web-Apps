import * as state from '../state.js';
import * as uiTutorial from '../ui/ui-tutorial.js';
import { domElements } from '../domElements.js';

// --- Tutorial Event Handlers ---
async function handleStartTutorial(tutorialKey) {
    console.log("APP_LOG: [js/events/events-tutorial.js] handleStartTutorial called with key:", tutorialKey);
    const tutorialData = state.getTutorialData(tutorialKey);
    console.log("APP_LOG: [js/events/events-tutorial.js] tutorialData received:", tutorialData);
    if (!tutorialData || !tutorialData.steps || tutorialData.steps.length === 0) {
        console.warn("APP_LOG: No tutorial data found or steps empty for key:", tutorialKey);
        return;
    }

    console.log("APP_LOG: [js/events/events-tutorial.js] First step:", tutorialData.steps[0]);
    state.setCurrentTutorial(tutorialKey, 0);
    // showTutorialStep no longer takes domElements as it imports it directly
    await uiTutorial.showTutorialStep(0, tutorialData.steps);
}

async function handleNextTutorialStep() {
    const currentTutorial = state.getCurrentTutorial();
    if (!currentTutorial || !currentTutorial.steps) {
        console.warn("APP_WARN: handleNextTutorialStep - No current tutorial or steps found.");
        uiTutorial.closeTutorial(); // This will also execute reverts
        state.clearCurrentTutorial();
        return;
    }

    // Don't execute revert actions between steps - only when tutorial ends
    // state.executeAndClearTutorialRevertActions(); // REMOVED

    const nextStepIndex = currentTutorial.currentStepIndex + 1;
    if (nextStepIndex < currentTutorial.steps.length) {
        state.setCurrentTutorialStepIndex(nextStepIndex); // Only update index, key remains
        await uiTutorial.showTutorialStep(nextStepIndex, currentTutorial.steps);
    } else {
        uiTutorial.closeTutorial(); // This will execute reverts when tutorial actually ends
        state.clearCurrentTutorial();
    }
}

async function handlePrevTutorialStep() {
    const currentTutorial = state.getCurrentTutorial();
    if (!currentTutorial || !currentTutorial.steps) {
        console.warn("APP_WARN: handlePrevTutorialStep - No current tutorial or steps found.");
        uiTutorial.closeTutorial(); // This will also execute reverts
        state.clearCurrentTutorial();
        return;
    }    // Don't execute revert actions between steps - only when tutorial ends
    // state.executeAndClearTutorialRevertActions(); // REMOVED

    const prevStepIndex = currentTutorial.currentStepIndex - 1;
    if (prevStepIndex >= 0) {
        state.setCurrentTutorialStepIndex(prevStepIndex); // Only update index, key remains
        await uiTutorial.showTutorialStep(prevStepIndex, currentTutorial.steps);
    } else {
        console.log("APP_LOG: Already on the first tutorial step.");
    }
}

// Export handlers for main.js to attach to buttons
export {
    handleStartTutorial,
    handleNextTutorialStep,
    handlePrevTutorialStep
};

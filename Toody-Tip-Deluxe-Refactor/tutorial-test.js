// Tutorial System Test Script
// This script tests the tutorial functionality

console.log("=== TUTORIAL SYSTEM DIAGNOSTIC TEST ===");

// Test 1: Check if DOM elements exist
console.log("\n1. CHECKING TUTORIAL DOM ELEMENTS:");
const tutorialElements = [
    'tutorial-overlay',
    'tutorial-highlight-box', 
    'tutorial-text-box',
    'tutorial-title',
    'tutorial-text',
    'tutorial-step-counter',
    'tutorial-next-btn',
    'tutorial-prev-btn',
    'tutorial-close-btn'
];

let missingElements = [];
tutorialElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`✓ ${id} found`);
    } else {
        console.log(`✗ ${id} MISSING`);
        missingElements.push(id);
    }
});

// Test 2: Check tutorial buttons
console.log("\n2. CHECKING TUTORIAL TRIGGER BUTTONS:");
const tutorialButtons = document.querySelectorAll('.tutorial-btn');
console.log(`Found ${tutorialButtons.length} tutorial buttons`);
tutorialButtons.forEach((btn, index) => {
    const tutorialFor = btn.getAttribute('data-tutorial-for');
    console.log(`  Button ${index + 1}: data-tutorial-for="${tutorialFor}"`);
});

// Test 3: Check if global function exists
console.log("\n3. CHECKING GLOBAL FUNCTIONS:");
if (typeof window.handleStartTutorial === 'function') {
    console.log("✓ window.handleStartTutorial is available");
} else {
    console.log("✗ window.handleStartTutorial is NOT available");
}

// Test 4: Check if modules are loaded
console.log("\n4. CHECKING MODULE AVAILABILITY:");
// These should be available if modules loaded correctly
const moduleTests = [
    { name: 'triggerDailyScoopCalculation', available: typeof window.triggerDailyScoopCalculation === 'function' }
];

moduleTests.forEach(test => {
    if (test.available) {
        console.log(`✓ ${test.name} is available`);
    } else {
        console.log(`✗ ${test.name} is NOT available`);
    }
});

// Test 5: Try to manually start a tutorial
console.log("\n5. TESTING TUTORIAL START:");
if (typeof window.handleStartTutorial === 'function') {
    try {
        console.log("Attempting to start 'roster' tutorial...");
        window.handleStartTutorial('roster');
        
        // Check if overlay becomes visible
        setTimeout(() => {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay && overlay.style.display === 'block') {
                console.log("✓ Tutorial overlay is now visible - SUCCESS!");
                
                // Try to close it
                setTimeout(() => {
                    const closeBtn = document.getElementById('tutorial-close-btn');
                    if (closeBtn) {
                        closeBtn.click();
                        console.log("✓ Attempted to close tutorial");
                    }
                }, 2000);
            } else {
                console.log("✗ Tutorial overlay is not visible - FAILED");
                console.log("Overlay display style:", overlay ? overlay.style.display : 'element not found');
            }
        }, 1000);
        
    } catch (error) {
        console.log("✗ Error starting tutorial:", error.message);
    }
} else {
    console.log("Cannot test tutorial start - function not available");
}

// Test 6: Check for JavaScript errors
console.log("\n6. CHECKING FOR ERRORS:");
window.addEventListener('error', (event) => {
    console.log("✗ JavaScript Error:", event.error.message, "at", event.filename + ":" + event.lineno);
});

console.log("\n=== END TUTORIAL DIAGNOSTIC TEST ===");
console.log("Check the console output above for any issues.");

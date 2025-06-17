import { domElements } from '../domElements.js';
import * as state from '../state.js';

export function renderDefaultPayRatesUI() {
    console.log("UI_LOG: renderDefaultPayRatesUI called");
    console.log("UI_LOG: domElements.defaultPayRatesContainer:", domElements.defaultPayRatesContainer);
    
    if (!domElements.defaultPayRatesContainer) {
        console.error('Default pay rates container not found');
        // Try to find it manually
        const manualContainer = document.getElementById('defaultPayRatesContainer');
        console.log("UI_LOG: Manual search for container:", manualContainer);
        return;
    }

    const container = domElements.defaultPayRatesContainer;
    console.log("UI_LOG: Container found, clearing innerHTML");
    container.innerHTML = '';    const defaultRates = state.getDefaultPayRates();
    const jobPositions = state.state.jobPositions;
    console.log("UI_LOG: Default rates:", defaultRates);
    console.log("UI_LOG: Job positions:", jobPositions);

    if (!jobPositions || jobPositions.length === 0) {
        console.error("UI_LOG: No job positions found!");
        container.innerHTML = '<p style="color: red;">No job positions configured. Please check the state.</p>';
        return;
    }

    console.log("UI_LOG: About to create", jobPositions.length, "pay rate inputs");

    jobPositions.forEach((position, index) => {
        console.log(`UI_LOG: Creating input ${index + 1} for position: ${position}`);
        
        const payRateItem = document.createElement('div');
        payRateItem.className = 'default-pay-rate-item';

        const label = document.createElement('label');
        label.htmlFor = `defaultRate_${position.replace(/\s+/g, '')}`;
        label.textContent = `${position} ($/hr):`;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `defaultRate_${position.replace(/\s+/g, '')}`;
        input.dataset.position = position;
        input.step = '0.01';
        input.min = '0';
        input.placeholder = '0.00';
        input.value = defaultRates[position] || '';

        payRateItem.appendChild(label);
        payRateItem.appendChild(input);
        container.appendChild(payRateItem);
        
        console.log(`UI_LOG: Created and appended input for ${position}`);
    });
    
    console.log("UI_LOG: Finished creating all pay rate inputs");
}

export function collectDefaultPayRatesFromUI() {
    if (!domElements.defaultPayRatesContainer) {
        console.error('Default pay rates container not found');
        return null;
    }

    const inputs = domElements.defaultPayRatesContainer.querySelectorAll('input[data-position]');
    const rates = {};
    let isValid = true;

    inputs.forEach(input => {
        const position = input.dataset.position;
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value < 0) {
            isValid = false;
            input.style.borderColor = '#e53935';
            console.error(`Invalid pay rate for ${position}: ${input.value}`);
        } else {
            input.style.borderColor = '';
            rates[position] = value;
        }
    });

    return isValid ? rates : null;
}

export function saveDefaultPayRates() {
    const rates = collectDefaultPayRatesFromUI();
    
    if (rates) {
        const success = state.updateDefaultPayRates(rates);
        if (success) {
            // Show success feedback
            const button = domElements.saveDefaultPayRatesBtn;
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Saved!';
                button.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                }, 2000);
            }
            
            return true;
        }
    } else {
        // Show error feedback
        alert('Please correct the invalid pay rates before saving.');
        return false;
    }
}

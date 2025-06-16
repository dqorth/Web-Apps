import { sortEmployeesByName, formatTimeTo12Hour, calculateHoursWorked } from '../utils.js';
// import { domElements } from '../domElements.js'; // Add if direct DOM element access from domElements.js is needed

export function renderEmployeeRoster(rosterContainer, state, activeDate) {
    const { employeeRoster, dailyShifts } = state;
    // Defensive: avoid JSON.parse on undefined
    let dailyShiftsLog;
    try {
        dailyShiftsLog = dailyShifts ? JSON.parse(JSON.stringify(dailyShifts)) : '{}';
    } catch (e) {
        dailyShiftsLog = '[unserializable]';
    }
    // console.log('[ui-roster.js] renderEmployeeRoster - ActiveDate:', activeDate, 'DailyShiftsData for this date:', dailyShiftsLog); // Diagnostic
    if (!rosterContainer) { console.error("UI_LOG: Roster list container not found!"); return; }
    rosterContainer.innerHTML = '';
    if (!activeDate) {
        rosterContainer.innerHTML = '<p>Please select a date to see the roster.</p>';
        return;
    }

    // Defensive: ensure jobPositions exists
    const jobPositions = state.jobPositions || ["Server", "Busser", "Shake Spinner", "Food Runner", "Host"];
    const positionDisplayOrder = ["Server", "Busser", "Food Runner", "Shake Spinner", "Host", ...jobPositions.filter(p => !["Server", "Busser", "Food Runner", "Shake Spinner", "Host"].includes(p))];

    positionDisplayOrder.forEach(posKey => {
        const employeesInThisPosition = employeeRoster.filter(emp => emp.positions.includes(posKey));
        if (employeesInThisPosition.length > 0) {
            const positionGroupDiv = document.createElement('div');
            positionGroupDiv.className = 'roster-position-group';

            const groupHeader = document.createElement('h5');
            groupHeader.className = 'position-group-header-roster';
            groupHeader.textContent = posKey + 's';
            positionGroupDiv.appendChild(groupHeader);

            const ul = document.createElement('ul');
            ul.className = 'item-list roster-lineup-selectable';

            employeesInThisPosition.sort((a, b) => sortEmployeesByName(a, b, 'name')).forEach(emp => {
                const li = document.createElement('li');
                li.id = `roster-emp-${emp.id}-${posKey.replace(/\s+/g, '')}`;

                const mainInfoDiv = document.createElement('div'); mainInfoDiv.className = 'roster-item-main-info';
                const empInfoDiv = document.createElement('div'); empInfoDiv.className = 'employee-info';
                const nameStrong = document.createElement('strong');
                nameStrong.dataset.empid = emp.id; nameStrong.dataset.positioncontext = posKey;
                nameStrong.title = `Click to log/edit shift for ${emp.name} as ${posKey}`; nameStrong.textContent = emp.name;
                empInfoDiv.appendChild(nameStrong);
                mainInfoDiv.appendChild(empInfoDiv);

                const actionsDiv = document.createElement('div'); actionsDiv.className = 'employee-actions';
                const toggleWorkedBtn = document.createElement('button');
                toggleWorkedBtn.classList.add('button', 'worked-today-toggle-btn');
                toggleWorkedBtn.dataset.empid = emp.id;
                toggleWorkedBtn.dataset.positioncontext = posKey;

                actionsDiv.appendChild(toggleWorkedBtn);
                mainInfoDiv.appendChild(actionsDiv);
                li.appendChild(mainInfoDiv);

                const inlineFormDiv = document.createElement('div');
                inlineFormDiv.id = `inline-form-${emp.id}-${posKey.replace(/\s+/g, '')}`;
                inlineFormDiv.className = 'inline-shift-form-container';
                inlineFormDiv.style.display = 'none';
                li.appendChild(inlineFormDiv);
                ul.appendChild(li);

                let existingShift = null;
                const shiftsForDay = dailyShifts[activeDate];
                if (shiftsForDay) {
                    existingShift = shiftsForDay.find(s => s.employeeId === emp.id && s.positionWorked === posKey);
                }
                // let shiftToLog = existingShift ? JSON.parse(JSON.stringify(existingShift)) : null;
                // console.log('[ui-roster.js] renderEmployeeRoster - Employee:', emp.name, 'posKey:', posKey, 'Found existingShift (pre-update call):', shiftToLog, 'ID specifically:', existingShift ? existingShift.id : 'undefined');
                updateEmployeeLineupCard(li, toggleWorkedBtn, existingShift, emp, posKey);
            });
            positionGroupDiv.appendChild(ul);
            rosterContainer.appendChild(positionGroupDiv);
        }
    });
    applyMasonryLayoutToRoster(rosterContainer);
}

export function updateEmployeeLineupCard(liElement, buttonElement, shiftData, employee, positionContext) {
    // let shiftDataForLog = shiftData ? JSON.parse(JSON.stringify(shiftData)) : null;
    // console.log('[ui-roster.js] updateEmployeeLineupCard - START - Args:', { employeeName: employee ? employee.name : 'N/A', pos: positionContext, shiftData: shiftDataForLog });
    if (!liElement || !buttonElement) {
        console.error('[ui-roster.js] updateEmployeeLineupCard - ERROR: liElement or buttonElement is null.', { liElement, buttonElement });
        return;
    }

    const employeeInfoDiv = liElement.querySelector('.employee-info');
    if (!employeeInfoDiv) {
        console.error('[ui-roster.js] updateEmployeeLineupCard - ERROR: employeeInfoDiv not found in liElement:', liElement);
    }
    let shiftSummaryDiv = liElement.querySelector('.shift-summary-display');
    
    if (shiftSummaryDiv) {
        // console.log('[ui-roster.js] updateEmployeeLineupCard - Removing existing shiftSummaryDiv.');
        shiftSummaryDiv.remove();
    }

    buttonElement.classList.remove('is-not-working', 'is-working', 'is-editing-shift');
    delete buttonElement.dataset.shiftId;

    const hasValidShiftId = shiftData && typeof shiftData.id === 'string' && shiftData.id.trim() !== '';
    // console.log(`[ui-roster.js] updateEmployeeLineupCard - Valid Shift ID check: ${hasValidShiftId}, shiftData.id: ${shiftData ? shiftData.id : 'N/A'}`);

    if (hasValidShiftId) {
        // console.log('[ui-roster.js] updateEmployeeLineupCard - Condition MET: shiftData is present with a valid ID.');
        buttonElement.textContent = `Edit Shift (${formatTimeTo12Hour(shiftData.timeIn)})`;
        buttonElement.dataset.action = "edit";
        buttonElement.dataset.shiftId = shiftData.id;
        buttonElement.classList.add('is-editing-shift');
        buttonElement.setAttribute('aria-pressed', 'true');
        // console.log('[ui-roster.js] updateEmployeeLineupCard - Button updated for "Edit Shift":', buttonElement.outerHTML);

        if (employeeInfoDiv) {
            shiftSummaryDiv = document.createElement('div');
            shiftSummaryDiv.className = 'shift-summary-display';
            let summaryText = `${formatTimeTo12Hour(shiftData.timeIn)} - ${formatTimeTo12Hour(shiftData.timeOut)} (${calculateHoursWorked(shiftData.timeIn, shiftData.timeOut).toFixed(2)} hrs)`;
            if (shiftData.positionWorked === "Server") {
                summaryText += ` | Sales: $${(shiftData.totalSales || 0).toFixed(2)}`;
                summaryText += ` | Tips: $${((shiftData.ccTips || 0) + (shiftData.cashTips || 0)).toFixed(2)}`;
            }
            shiftSummaryDiv.textContent = summaryText;
            employeeInfoDiv.appendChild(shiftSummaryDiv);
            // console.log('[ui-roster.js] updateEmployeeLineupCard - Shift summary created and appended:', shiftSummaryDiv.outerHTML);
            shiftSummaryDiv.style.display = 'block'; 
            // console.log('[ui-roster.js] updateEmployeeLineupCard - shiftSummaryDiv display style set to block.');

        } else {
            console.warn('[ui-roster.js] updateEmployeeLineupCard - employeeInfoDiv was null, cannot append shift summary.');
        }
    } else {
        // console.log('[ui-roster.js] updateEmployeeLineupCard - Condition NOT MET: No valid shiftData or shiftData.id. Setting button to "Log Shift".');
        buttonElement.textContent = "Log Shift";
        buttonElement.dataset.action = "log";
        buttonElement.classList.add('is-not-working');
        buttonElement.setAttribute('aria-pressed', 'false');
        // console.log('[ui-roster.js] updateEmployeeLineupCard - Button updated for "Log Shift":', buttonElement.outerHTML);
        if (shiftSummaryDiv) {
            // console.log('[ui-roster.js] updateEmployeeLineupCard - Hiding shiftSummaryDiv as there is no shift data.');
            shiftSummaryDiv.style.display = 'none';
        }
    }
    // console.log('[ui-roster.js] updateEmployeeLineupCard - END - Employee:', employee ? employee.name : 'N/A');
}

export function applyMasonryLayoutToRoster(rosterListContainer) {
    if (!rosterListContainer || window.innerWidth <= 768) {
        if (rosterListContainer) {
            rosterListContainer.querySelectorAll('.roster-position-group').forEach(item => {
                item.style.gridRowEnd = '';
            });
            rosterListContainer.style.display = (window.innerWidth <= 768) ? 'block' : 'grid';
        }
        return;
    }

    const items = rosterListContainer.querySelectorAll('.roster-position-group');
    if (!items.length) return;

    rosterListContainer.style.display = 'grid';
    const gridRowGap = parseInt(window.getComputedStyle(rosterListContainer).getPropertyValue('grid-row-gap')) || 20;
    const gridAutoRows = 10; 

    items.forEach(item => {
        item.style.gridRowEnd = ""; 
        const contentHeight = item.scrollHeight;
        const rowSpan = Math.ceil((contentHeight + gridRowGap) / (gridAutoRows + gridRowGap));
        item.style.gridRowEnd = `span ${rowSpan}`;
    });
}

export function renderInlineShiftForm(containerElement, employee, positionWorkedContext, activeDate, existingShiftData, onSaveShift, onDeleteShift, onCancel, originView = null) {
    if (!containerElement || !employee || !positionWorkedContext || !activeDate) {
        console.error("renderInlineShiftForm: Missing required parameters.", { containerElement, employee, positionWorkedContext, activeDate });
        if(containerElement) containerElement.innerHTML = '<p style="color:red;">Error loading form.</p>';
        return;
    }
    containerElement.innerHTML = '';
    containerElement.style.display = 'block';

    const formDiv = document.createElement('div');
    formDiv.dataset.shiftFormFor = employee.id;
    formDiv.dataset.shiftPosition = positionWorkedContext;

    const posDisplay = document.createElement('p');
    posDisplay.innerHTML = `Logging shift as: <strong>${positionWorkedContext}</strong> for ${employee.name}`;
    formDiv.appendChild(posDisplay);

    const timeInputsGroup = document.createElement('div');
    timeInputsGroup.className = 'time-inputs-group';

    const timeInContainer = document.createElement('div');
    const timeInLabel = document.createElement('label'); timeInLabel.textContent = 'Clock In:'; timeInLabel.htmlFor = `timeIn_${employee.id}_${positionWorkedContext}`;
    const timeInInline = document.createElement('input'); timeInInline.type = 'time'; timeInInline.step = '60'; timeInInline.className = 'inline-shift-timein'; timeInInline.id = `timeIn_${employee.id}_${positionWorkedContext}`;
    timeInContainer.append(timeInLabel, timeInInline);
    timeInputsGroup.appendChild(timeInContainer);

    const timeOutContainer = document.createElement('div');
    const timeOutLabel = document.createElement('label'); timeOutLabel.textContent = 'Clock Out:'; timeOutLabel.htmlFor = `timeOut_${employee.id}_${positionWorkedContext}`;
    const timeOutInline = document.createElement('input'); timeOutInline.type = 'time'; timeOutInline.step = '60'; timeOutInline.className = 'inline-shift-timeout'; timeOutInline.id = `timeOut_${employee.id}_${positionWorkedContext}`;
    timeOutContainer.append(timeOutLabel, timeOutInline);
    timeInputsGroup.appendChild(timeOutContainer);
    formDiv.appendChild(timeInputsGroup);

    const serverTipsDiv = document.createElement('div');
    serverTipsDiv.className = 'inline-server-tips';
    serverTipsDiv.style.display = (positionWorkedContext === "Server") ? 'block' : 'none';

    const tipInputsGroup = document.createElement('div'); tipInputsGroup.className = 'tip-inputs-group';

    const salesContainer = document.createElement('div');
    const salesLabel = document.createElement('label'); salesLabel.textContent = 'Total Sales ($):'; salesLabel.htmlFor = `sales_${employee.id}_${positionWorkedContext}`;
    const salesInput = document.createElement('input'); salesInput.type = 'number'; salesInput.placeholder = '0.00'; salesInput.step = '0.01'; salesInput.className = 'inline-shift-sales'; salesInput.id = `sales_${employee.id}_${positionWorkedContext}`;
    salesContainer.append(salesLabel, salesInput);
    tipInputsGroup.appendChild(salesContainer);

    const ccTipContainer = document.createElement('div');
    const ccLabel = document.createElement('label'); ccLabel.textContent = 'CC Tips ($):'; ccLabel.htmlFor = `cctips_${employee.id}_${positionWorkedContext}`;
    const ccInput = document.createElement('input'); ccInput.type = 'number'; ccInput.placeholder = '0.00'; ccInput.step = '0.01'; ccInput.className = 'inline-shift-cctips'; ccInput.id = `cctips_${employee.id}_${positionWorkedContext}`;
    ccTipContainer.append(ccLabel, ccInput);
    tipInputsGroup.appendChild(ccTipContainer);

    const cashTipContainer = document.createElement('div');
    const cashLabel = document.createElement('label'); cashLabel.textContent = 'Cash Tips ($):'; cashLabel.htmlFor = `cashtips_${employee.id}_${positionWorkedContext}`;
    const cashInput = document.createElement('input'); cashInput.type = 'number'; cashInput.placeholder = '0.00'; cashInput.step = '0.01'; cashInput.className = 'inline-shift-cashtips'; cashInput.id = `cashtips_${employee.id}_${positionWorkedContext}`;
    cashTipContainer.append(cashLabel, cashInput);
    tipInputsGroup.appendChild(cashTipContainer);

    serverTipsDiv.appendChild(tipInputsGroup);
    formDiv.appendChild(serverTipsDiv);

    if (existingShiftData) {
        timeInInline.value = existingShiftData.timeIn || '';
        timeOutInline.value = existingShiftData.timeOut || '';
        if (positionWorkedContext === "Server") {
            salesInput.value = existingShiftData.totalSales || '';
            ccInput.value = existingShiftData.ccTips || '';
            cashInput.value = existingShiftData.cashTips || '';
        }
    }

    const formActionsDiv = document.createElement('div');
    formActionsDiv.className = 'inline-form-actions';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = existingShiftData ? 'Update Shift' : 'Log Shift';
    saveBtn.classList.add('button', 'small-action-btn', 'log-specific-shift-btn');
    saveBtn.dataset.employeeId = employee.id;
    saveBtn.dataset.positionContext = positionWorkedContext;
    if (existingShiftData) {
        saveBtn.dataset.editingShiftId = existingShiftData.id;
    }
    saveBtn.addEventListener('click', (event) => {
        const shiftDetails = {
            date: activeDate,
            employeeId: employee.id,
            employeeName: employee.name, 
            positionWorked: positionWorkedContext,
            shiftPayRate: (employee.payRates && employee.payRates[positionWorkedContext] !== undefined) ? parseFloat(employee.payRates[positionWorkedContext]) : 0,
            timeIn: timeInInline.value,
            timeOut: timeOutInline.value,
            id: existingShiftData ? existingShiftData.id : undefined
        };
        if (positionWorkedContext === "Server") {
            shiftDetails.totalSales = parseFloat(salesInput.value) || 0;
            shiftDetails.ccTips = parseFloat(ccInput.value) || 0;
            shiftDetails.cashTips = parseFloat(cashInput.value) || 0;
        }
        onSaveShift(event, originView); // Pass originView
    });
    formActionsDiv.appendChild(saveBtn);

    if (existingShiftData && onDeleteShift) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Shift';
        deleteBtn.classList.add('button', 'small-action-btn', 'delete-shift-btn');
        deleteBtn.style.backgroundColor = '#AA0000';
        deleteBtn.addEventListener('click', () => onDeleteShift(existingShiftData.id, activeDate, employee.id, positionWorkedContext, containerElement.closest('li'), originView)); // Pass originView
        formActionsDiv.appendChild(deleteBtn);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.classList.add('button', 'small-action-btn', 'cancel-edit-inline-btn');
    cancelBtn.style.backgroundColor = '#BDBDBD';
    cancelBtn.addEventListener('click', () => {
        console.log("[ui-roster.js] Cancel button clicked. Calling onCancel with:", employee.id, positionWorkedContext, existingShiftData, originView);
        onCancel(employee.id, positionWorkedContext, existingShiftData, originView); // Pass originView
    });
    formActionsDiv.appendChild(cancelBtn);

    formDiv.appendChild(formActionsDiv);
    containerElement.appendChild(formDiv);

    timeInInline.focus();
}

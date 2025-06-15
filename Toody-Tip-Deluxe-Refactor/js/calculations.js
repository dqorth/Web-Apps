import { 
    timeToMinutes, 
    calculateHoursWorked, 
    roundToNearest15Minutes, 
    roundToNearestHalfDollar,
    calculateOverlapDurationMinutes
} from './utils.js';

// This file will contain calculation-related functions.

// Migrated from original_app.html
// function timeToMinutes(tStr){if(!tStr||!tStr.includes(':')) return 0;const[h,m]=tStr.split(':').map(Number);return h*60+m;}
// function calculateOverlapDurationMinutes(serverShift, supportShift) { const sStart = timeToMinutes(serverShift.timeIn); const sEnd = timeToMinutes(serverShift.timeOut); const supStart = timeToMinutes(supportShift.timeIn); const supEnd = timeToMinutes(supportShift.timeOut); return Math.max(0, Math.min(sEnd, supEnd) - Math.max(sStart, supStart)); }
// function calculateHoursWorked(tiStr,toStr){if(!tiStr||!toStr) return 0;const mi=timeToMinutes(tiStr),mo=timeToMinutes(toStr);if(mo<=mi) return 0;return(mo-mi)/60;}
// function roundToNearest15Minutes(tStr){if(!tStr||!tStr.includes(':')) return tStr;const[h,m]=tStr.split(':').map(Number);let tm=h*60+m;let rtm=Math.round(tm/15)*15;let rh=Math.floor(rtm/60);let rmin=rtm%60;if(rh>=24) rh=rh%24;return`${String(rh).padStart(2,'0')}:${String(rmin).padStart(2,'0')}`; }
// function roundToNearestHalfDollar(amount) { return Math.round(amount * 2) / 2; }
export function runTipAndWageCalculationsForDay(shiftsForDay) {
    let processedShifts = shiftsForDay.map(s => {
        const exactHours = calculateHoursWorked(s.timeIn, s.timeOut); 
        const wage = exactHours * (s.shiftPayRate || 0);
        let tipDetails = {
            ccTips: 0, cashTips: 0, totalSales: 0, tipOutGiven: 0, tipInReceived: 0,
            detailedTipIns: [], tipsForTaxes: 0, tipsOnCheck: 0, totalPayoutOnCheck: 0 
        };
        if (s.positionWorked === "Server") {
            tipDetails.ccTips = s.ccTips || 0;
            tipDetails.cashTips = s.cashTips || 0;
            tipDetails.totalSales = s.totalSales || 0;
        }
        return {
            ...s, 
            hoursWorked: exactHours, 
            shiftWage: wage,       
            roundedTimeInForTips: roundToNearest15Minutes(s.timeIn),
            roundedTimeOutForTips: roundToNearest15Minutes(s.timeOut),
            ...tipDetails
        };
    });

    const serverShifts = processedShifts.filter(s => s.positionWorked === "Server");
    const supportStaffByType = {
        Busser: processedShifts.filter(s => s.positionWorked === "Busser"),
        FoodRunner: processedShifts.filter(s => s.positionWorked === "Food Runner"),
        ShakeSpinner: processedShifts.filter(s => s.positionWorked === "Shake Spinner"),
        Host: processedShifts.filter(s => s.positionWorked === "Host")
    };

    serverShifts.forEach(serverShift => {
        const serverRoundedStartMinutes = timeToMinutes(serverShift.roundedTimeInForTips);
        const serverRoundedEndMinutes = timeToMinutes(serverShift.roundedTimeOutForTips);
        const serverShiftDurationMinutesForTips = Math.max(0, serverRoundedEndMinutes - serverRoundedStartMinutes);

        if (serverShiftDurationMinutesForTips <= 0) return; 
        const serverSalesForTipOutBase = serverShift.totalSales;

        Object.entries({ Busser: 0.015, FoodRunner: 0.010, ShakeSpinner: 0.010 }).forEach(([supportRole, rate]) => {
            (supportStaffByType[supportRole] || []).forEach(supportShift => {
                const tempServerShiftForTipOverlap = { timeIn: serverShift.roundedTimeInForTips, timeOut: serverShift.roundedTimeOutForTips };
                const tempSupportShiftForTipOverlap = { timeIn: supportShift.roundedTimeInForTips, timeOut: supportShift.roundedTimeOutForTips };
                const overlapMinutes = calculateOverlapDurationMinutes(tempServerShiftForTipOverlap, tempSupportShiftForTipOverlap);
                if (overlapMinutes > 0) {
                    const proportionOfServerShiftCoveredBySupport = serverShiftDurationMinutesForTips > 0 ? (overlapMinutes / serverShiftDurationMinutesForTips) : 0;
                    let tipOutAmount = serverSalesForTipOutBase * rate * proportionOfServerShiftCoveredBySupport;
                    tipOutAmount = roundToNearestHalfDollar(tipOutAmount);
                    
                    serverShift.tipOutGiven += tipOutAmount;
                    supportShift.tipInReceived += tipOutAmount;
                    supportShift.detailedTipIns.push({ fromServerName: serverShift.employeeName, fromServerShiftTime: `${serverShift.timeIn}-${serverShift.timeOut}`, overlapMinutes: overlapMinutes, amount: tipOutAmount, supportShiftTime: `${supportShift.timeIn}-${supportShift.timeOut}` });
                }
            });
        });

        (supportStaffByType.Host || []).forEach(hostShift => {
            const tempServerShiftForTipOverlap = { timeIn: serverShift.roundedTimeInForTips, timeOut: serverShift.roundedTimeOutForTips };
            const tempSupportShiftForTipOverlap = { timeIn: hostShift.roundedTimeInForTips, timeOut: hostShift.roundedTimeOutForTips };
            const overlapMinutes = calculateOverlapDurationMinutes(tempServerShiftForTipOverlap, tempSupportShiftForTipOverlap);
            if (overlapMinutes > 0) {
                let hostTipOutAmount = 5.00; 
                hostTipOutAmount = roundToNearestHalfDollar(hostTipOutAmount); 
                
                serverShift.tipOutGiven += hostTipOutAmount;
                hostShift.tipInReceived += hostTipOutAmount;
                hostShift.detailedTipIns.push({ fromServerName: serverShift.employeeName, fromServerShiftTime: `${serverShift.timeIn}-${serverShift.timeOut}`, overlapMinutes: overlapMinutes, amount: hostTipOutAmount, supportShiftTime: `${hostShift.timeIn}-${hostShift.timeOut}` });
            }
        });
    });
    
    processedShifts.forEach(shift => {
        shift.tipsForTaxes = (shift.ccTips || 0) + (shift.cashTips || 0) + (shift.tipInReceived || 0) - (shift.tipOutGiven || 0);
        shift.tipsOnCheck = (shift.ccTips || 0) + (shift.tipInReceived || 0) - (shift.tipOutGiven || 0);
        shift.totalPayoutOnCheck = shift.shiftWage + shift.tipsOnCheck;
        
         if (shift.positionWorked === "Server") { 
             shift.finalTakeHomeTips = (shift.ccTips || 0) + (shift.cashTips || 0) - (shift.tipOutGiven || 0); 
         } else { 
             shift.finalTakeHomeTips = shift.tipInReceived || 0;
        }
    });
    return processedShifts;
}

// js/utils.js
window.utils = (() => {
    const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Short names
    const DAYS_OF_WEEK_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // Long names
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    /**
     * Generates a unique ID.
     * @returns {string} A unique ID string.
     */
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Formats a Date object or date string into YYYY-MM-DD format.
     * @param {Date|string} date - The date to format.
     * @returns {string} Formatted date string.
     */
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.warn("[utils.js] formatDate: Invalid date provided", date);
            return '';
        }
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    /**
     * Formats a Date object into HH:MM (24-hour) format.
     * @param {Date} date - The date object to format.
     * @returns {string} Formatted time string.
     */
    function formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.warn("[utils.js] formatTime: Invalid date provided", date);
            return '';
        }
        let hours = '' + d.getHours();
        let minutes = '' + d.getMinutes();

        if (hours.length < 2) hours = '0' + hours;
        if (minutes.length < 2) minutes = '0' + minutes;

        return [hours, minutes].join(':');
    }

    /**
     * Converts a 24-hour time string (HH:MM) to 12-hour format (h:MM AM/PM).
     * @param {string} timeString - The time string in HH:MM format.
     * @returns {string} Formatted time string in 12-hour format.
     */
    function formatTimeTo12Hour(timeString) {
        if (!timeString || !timeString.includes(':')) return 'Invalid Time';
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);

        if (isNaN(h) || isNaN(m)) return 'Invalid Time';

        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 || 12; // Convert 0 to 12 for 12 AM/PM
        const formattedMinutes = m < 10 ? '0' + m : m;

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }
    
    /**
     * Parses a time string (HH:MM) and combines it with a given date object.
     * If no date object is provided, it uses the current date.
     * @param {string} timeString - The time string in HH:MM format.
     * @param {Date} [dateObject=new Date()] - The date object to combine with the time.
     * @returns {Date} A Date object with the year, month, day from dateObject and hour, minute from timeString.
     */
    function parseTimeToDate(timeString, dateObject = new Date()) {
        if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
            console.error("[utils.js] parseTimeToDate: Invalid timeString provided:", timeString);
            return null; // Or throw an error
        }
        const [hours, minutes] = timeString.split(':').map(Number);

        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.error("[utils.js] parseTimeToDate: Invalid time values in timeString:", timeString);
            return null; // Or throw an error
        }

        const newDate = new Date(dateObject); // Clone the dateObject to avoid modifying the original
        newDate.setHours(hours, minutes, 0, 0); // Set hours and minutes, reset seconds and milliseconds
        return newDate;
    }


    /**
     * Calculates the duration in hours between two time strings (HH:MM).
     * Handles overnight shifts.
     * @param {string} startTime - The start time in HH:MM format.
     * @param {string} endTime - The end time in HH:MM format.
     * @returns {number} The duration in hours.
     */
    function calculateHoursWorked(startTime, endTime) {
        if (!startTime || !endTime) return 0;

        const start = parseTimeToDate(startTime);
        const end = parseTimeToDate(endTime);

        if (!start || !end) return 0;

        let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // difference in hours

        if (diff < 0) { // Handles overnight shifts
            diff += 24;
        }
        return roundToTwoDecimals(diff);
    }

    /**
     * Displays a custom modal dialog.
     * @param {string} message - The message to display in the modal.
     * @param {string} [type='info'] - The type of modal ('info', 'success', 'warning', 'error').
     * @param {Array<Object>} [buttons=null] - Optional array of button objects {text, class, action}.
     */
    function showCustomModal(message, type = 'info', buttons = null) {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalActions = document.getElementById('modalActions');

        if (!modal || !modalMessage || !modalActions) {
            console.warn('[utils.js] Modal elements not found. Falling back to alert.');
            alert(`${type.toUpperCase()}: ${message}`);
            return;
        }

        modalMessage.textContent = message;
        modal.className = 'modal-content'; // Reset classes
        modal.classList.add(`modal-${type}`);
        
        modalActions.innerHTML = ''; // Clear previous buttons

        if (buttons && buttons.length > 0) {
            buttons.forEach(btnConfig => {
                const button = document.createElement('button');
                button.textContent = btnConfig.text;
                button.className = btnConfig.class || 'button'; // Default class
                button.addEventListener('click', () => {
                    if (btnConfig.action && typeof btnConfig.action === 'function') {
                        btnConfig.action({ hide: () => modal.style.display = 'none' });
                    } else {
                        modal.style.display = 'none'; // Default action: hide modal
                    }
                });
                modalActions.appendChild(button);
            });
        } else {
            // Default close button if no custom buttons are provided
            const closeButton = document.createElement('button');
            closeButton.textContent = 'OK';
            closeButton.className = 'button';
            closeButton.onclick = () => modal.style.display = 'none';
            modalActions.appendChild(closeButton);
        }

        modal.style.display = 'block';

        // Close modal if user clicks outside of modal-content
        // This event listener should ideally be added once.
        // For simplicity here, it's added every time, ensure it doesn't cause issues.
        // Or manage it with a flag.
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.onclick = function(event) {
                if (event.target === modalOverlay) { // Check if the click is on the overlay itself
                    modal.style.display = 'none';
                }
            }
        }
    }
    
    /**
     * Creates a debounced version of a function that delays invoking func until after wait milliseconds.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The number of milliseconds to delay.
     * @returns {Function} The new debounced function.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Shows or hides a loading indicator.
     * @param {boolean} show - True to show, false to hide.
     */
    function showLoadingIndicator(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        } else {
            console.warn("[utils.js] Loading indicator not found.");
        }
    }
    
    /**
     * Checks if a given value is a valid Date object.
     * @param {*} d - The value to check.
     * @returns {boolean} True if d is a valid Date, false otherwise.
     */
    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Rounds a number to two decimal places.
     * @param {number} num - The number to round.
     * @returns {number} The rounded number.
     */
    function roundToTwoDecimals(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    // --- Week Calculation Utilities ---

    /**
     * Gets the ISO week number of a date.
     * @param {Date} d - The date.
     * @returns {number} The ISO week number.
     */
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }
    
    /**
     * Gets the year for the ISO week of a date.
     * (Needed because a week can start in one year and end in another)
     * @param {Date} d - The date.
     * @returns {number} The year of the ISO week.
     */
    function getWeekYear(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        return d.getUTCFullYear();
    }

    /**
     * Gets the start and end dates of a given ISO week number and year.
     * @param {number} year - The year.
     * @param {number} weekNumber - The ISO week number.
     * @returns {{start: Date, end: Date}} An object with start and end Date objects for the week.
     */
    function getWeekDates(year, weekNumber) {
        const d = new Date(year, 0, 1 + (weekNumber - 1) * 7); // Approximate first day
        const day = d.getDay() || 7; // Get day of week (1-7, Monday is 1)
        if (day !== 1) {
            d.setHours(-24 * (day - 1)); // Adjust to Monday
        }
        const startDate = new Date(d);
        const endDate = new Date(d);
        endDate.setDate(d.getDate() + 6);
        return { start: startDate, end: endDate };
    }
    
    /**
     * Gets the ISO week number and year for a given date.
     * @param {Date} date - The input date.
     * @returns {{week: number, year: number}} An object containing the week number and year.
     */
    function getWeekNumberAndYear(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        // Thursday in current week decides the year.
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        // Get first day of year
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        // Return week number and year
        return { week: weekNo, year: d.getUTCFullYear() };
    }

    /**
     * Gets the start and end date strings (YYYY-MM-DD) for the week containing the given date string.
     * @param {string} dateString - The date string in YYYY-MM-DD format.
     * @returns {{start: string, end: string, week: number, year: number} | null} Object with start, end, week, year or null if invalid.
     */
    function getWeekRangeFromDate(dateString) {
        if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            console.error("[utils.js] getWeekRangeFromDate: Invalid date string format provided:", dateString);
            return null;
        }
        const dateParts = dateString.split('-').map(Number);
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        if (!isValidDate(date)) {
            console.error("[utils.js] getWeekRangeFromDate: Invalid date provided:", dateString);
            return null;
        }

        const { week, year } = getWeekNumberAndYear(date);
        
        // Get the Monday of that week
        // Create a date for the first day of the year, then add (week - 1) * 7 days
        // Then adjust to the Monday of that week.
        let monday = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
        monday.setUTCDate(monday.getUTCDate() + 1 - (monday.getUTCDay() || 7)); // Adjust to Monday (day 1)

        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6); // Sunday is 6 days after Monday

        return {
            start: formatDate(new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate())), // Convert UTC back to local for formatting
            end: formatDate(new Date(sunday.getUTCFullYear(), sunday.getUTCMonth(), sunday.getUTCDate())),
            week: week,
            year: year
        };
    }


    // Public API
    return {
        MILLISECONDS_PER_DAY,
        DAYS_OF_WEEK,
        DAYS_OF_WEEK_LONG,
        MONTH_NAMES,
        generateId,
        formatDate,
        formatTime,
        formatTimeTo12Hour,
        calculateHoursWorked,
        showCustomModal,
        debounce,
        showLoadingIndicator,
        parseTimeToDate,
        isValidDate,
        roundToTwoDecimals,
        getWeekNumber,
        getWeekYear,
        getWeekDates,
        getWeekNumberAndYear,
        getWeekRangeFromDate
    };
})();

// Modal close functionality (if not already handled by showCustomModal's overlay click)
// It's generally better to attach event listeners once in an init function.
// However, for this modular structure, if the modal HTML is static in index.html:
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('customModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalButton = document.querySelector('#customModal .close-button'); // Assuming a general close button might exist

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay && modal) {
                modal.style.display = 'none';
            }
        });
    }
    if (closeModalButton && modal) {
         closeModalButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    // Also, allow ESC key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});

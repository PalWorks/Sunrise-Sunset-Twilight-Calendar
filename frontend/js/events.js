// events.js - Handles all DOM event bindings to comply with MV3 CSP

document.addEventListener('DOMContentLoaded', () => {
    // Top Navigation
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle && typeof toggleMobileMenu === 'function') {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Location & Coordinates Inputs
    const inputLocation = document.getElementById('input-location');
    if (inputLocation && typeof handleLocationInput === 'function' && typeof handleLocationEnter === 'function') {
        inputLocation.addEventListener('input', handleLocationInput);
        inputLocation.addEventListener('keypress', handleLocationEnter);
    }

    const btnSearchLocation = document.getElementById('btn-search-location');
    if (btnSearchLocation && typeof searchLocationByText === 'function') {
        btnSearchLocation.addEventListener('click', searchLocationByText);
    }

    const inputCoords = document.getElementById('input-coords');
    if (inputCoords && typeof handleCoordsEnter === 'function') {
        inputCoords.addEventListener('keypress', handleCoordsEnter);
    }

    const btnSearchCoords = document.getElementById('btn-search-coords');
    if (btnSearchCoords && typeof searchLocationByCoords === 'function') {
        btnSearchCoords.addEventListener('click', searchLocationByCoords);
    }

    // Options Checkboxes
    const options = [
        'opt-brahma', 'opt-sunrise', 'opt-sandhya', 'opt-noon',
        'opt-civil', 'opt-nautical', 'opt-astronomical',
        'opt-moon-phases', 'opt-moon-times', 'opt-moon-illumination'
    ];
    options.forEach(optId => {
        const checkbox = document.getElementById(optId);
        if (checkbox && typeof handleOptionToggle === 'function') {
            checkbox.addEventListener('change', handleOptionToggle);
        }
    });

    // Action Grid Buttons
    const btnDownloadIcs = document.getElementById('btn-download-ics');
    if (btnDownloadIcs && typeof generateStaticICS === 'function') {
        btnDownloadIcs.addEventListener('click', generateStaticICS);
    }

    const dynamicLink = document.getElementById('dynamic-link');
    if (dynamicLink && typeof subscribeDynamic === 'function') {
        dynamicLink.addEventListener('click', subscribeDynamic);
    }

    const copySyncBtn = document.getElementById('copy-sync-btn');
    if (copySyncBtn && typeof copySyncUrl === 'function') {
        copySyncBtn.addEventListener('click', copySyncUrl);
    }

    const btnShowCalendar = document.getElementById('btn-show-calendar');
    if (btnShowCalendar && typeof showVisualCalendar === 'function') {
        btnShowCalendar.addEventListener('click', showVisualCalendar);
    }

    const btnPreviewExternal = document.getElementById('btn-preview-external');
    if (btnPreviewExternal) {
        btnPreviewExternal.addEventListener('click', (e) => {
            if (btnPreviewExternal.getAttribute('href') === '#' || typeof currentLat === 'undefined' || currentLat === null) {
                e.preventDefault();
                if (typeof showError === 'function') {
                    showError("Please enter a location first.");
                } else {
                    alert("Please enter a location first.");
                }
            }
        });
    }

    // Calendar Modal Controls
    const btnCloseCalendar = document.getElementById('btn-close-calendar');
    if (btnCloseCalendar && typeof closeVisualCalendar === 'function') {
        btnCloseCalendar.addEventListener('click', closeVisualCalendar);
    }

    const monthPicker = document.getElementById('month-picker');
    if (monthPicker && typeof handleDateKey === 'function' && typeof jumpToTextDate === 'function') {
        monthPicker.addEventListener('keypress', handleDateKey);
        monthPicker.addEventListener('blur', jumpToTextDate);
    }

    const btn12h = document.getElementById('btn-12h');
    const btn24h = document.getElementById('btn-24h');
    if (btn12h && btn24h && typeof setTimeFormat === 'function') {
        btn12h.addEventListener('click', () => setTimeFormat('12h'));
        btn24h.addEventListener('click', () => setTimeFormat('24h'));
    }

    const btnPrevMonth = document.getElementById('btn-prev-month');
    const btnNextMonth = document.getElementById('btn-next-month');
    const btnSidePrevMonth = document.getElementById('btn-side-prev-month');
    const btnSideNextMonth = document.getElementById('btn-side-next-month');
    if (typeof changeMonth === 'function') {
        if (btnPrevMonth) btnPrevMonth.addEventListener('click', () => changeMonth(-1));
        if (btnNextMonth) btnNextMonth.addEventListener('click', () => changeMonth(1));
        if (btnSidePrevMonth) btnSidePrevMonth.addEventListener('click', () => changeMonth(-1));
        if (btnSideNextMonth) btnSideNextMonth.addEventListener('click', () => changeMonth(1));
    }

    const savePngBtn = document.getElementById('save-png-btn');
    if (savePngBtn && typeof downloadCalendarImage === 'function') {
        savePngBtn.addEventListener('click', downloadCalendarImage);
    }

    const savePdfBtn = document.getElementById('save-pdf-btn');
    if (savePdfBtn && typeof downloadCalendarPDF === 'function') {
        savePdfBtn.addEventListener('click', downloadCalendarPDF);
    }
});

// Set time format toggles from index UI
window.setTimeFormat = function(format) {
    if (typeof window.use24Hour !== 'undefined') {
        window.use24Hour = (format === '24h');
    } else {
        window.use24Hour = (format === '24h');
    }
    const btn12h = document.getElementById('btn-12h');
    const btn24h = document.getElementById('btn-24h');
    if (btn12h) btn12h.classList.toggle('active', !window.use24Hour);
    if (btn24h) btn24h.classList.toggle('active', window.use24Hour);
    
    const modal = document.getElementById('modal-overlay');
    if (modal && modal.style.display === 'flex' && typeof renderCalendar === 'function') {
        renderCalendar();
    }
};

// Service Worker Registration
if ('serviceWorker' in navigator && !window.chrome?.extension) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js?v=5').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

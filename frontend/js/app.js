/* Core Application State & Initialization */

let currentLat = null;
let currentLng = null;
let currentCity = "";
let targetTimezone = null;
let currentDate = new Date();
let use24Hour = true;
let selectedDayNum = 1;
let showDetailedTimings = false;

function initDefaults() {
    // Populate month picker defaults
    updateMonthPicker();
    
    // Add event listeners for dynamic url updates when options change
    document.querySelectorAll('.opt-group input').forEach(el => {
        el.addEventListener('change', () => {
            updateDynamicUrls();
            if (document.getElementById('modal-overlay').style.display === 'flex') {
                renderCalendar();
            }
        });
    });
}

function getLocation() {
    if (navigator.geolocation) {
        document.getElementById('input-location').value = "Locating...";
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                await updateLocationFromCoords(lat, lng);
            },
            (err) => {
                console.error(err);
                alert("Location access denied or unavailable.");
                document.getElementById('input-location').value = "";
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function toggleTimeFormat() {
    use24Hour = !use24Hour;
    document.getElementById('btn-time-format').textContent = use24Hour ? "24 Hr" : "12 Hr";
    if (document.getElementById('modal-overlay').style.display === 'flex') {
        renderCalendar();
    }
}

function updateDynamicUrls() {
    if (currentLat === null) return;
    
    let url = `https://api.yogasadhanacalendar.com/sync?lat=${currentLat.toFixed(6)}&lng=${currentLng.toFixed(6)}`;
    
    let events = [];
    if (document.getElementById('opt-brahma').checked) events.push('brahma');
    if (document.getElementById('opt-sunrise').checked) events.push('sun');
    if (document.getElementById('opt-sandhya').checked) events.push('sandhya');
    if (document.getElementById('opt-noon').checked) events.push('noon');
    if (document.getElementById('opt-civil').checked) events.push('civil');
    if (document.getElementById('opt-nautical').checked) events.push('nautical');
    if (document.getElementById('opt-astronomical').checked) events.push('astronomical');
    
    if (events.length > 0) {
        url += `&events=${events.join(',')}`;
    }
    
    document.getElementById('manual-sync-url').value = url;
}

function copyUrl() {
    const input = document.getElementById('manual-sync-url');
    input.select();
    input.setSelectionRange(0, 99999); 
    try {
        document.execCommand('copy');
        const btn = document.getElementById('copy-btn');
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy"; }, 2000);
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
}

document.addEventListener('DOMContentLoaded', initDefaults);

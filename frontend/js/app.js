/* Core Application State & Initialization */

let currentLat = null;
let currentLng = null;
let currentCity = "";
let currentLocationName = "";
let targetTimezone = null;
let currentDate = new Date();
let deferredPrompt; // PWA Install Prompt
let use24Hour = true;
let selectedDayNum = 1;
let showDetailedTimings = false;

function initDefaults() {
    // Populate month picker defaults
    updateMonthPicker();
    
    // Parse URL parameters for preview from extension
    const params = new URLSearchParams(window.location.search);
    const latStr = params.get('lat');
    const lngStr = params.get('lng');
    const optsStr = params.get('opts');
    const actionStr = params.get('action');

    if (latStr && lngStr && actionStr === 'preview') {
        const latFloat = parseFloat(latStr);
        const lngFloat = parseFloat(lngStr);
        if (!isNaN(latFloat) && !isNaN(lngFloat)) {
            // Apply options
            if (optsStr) {
                const optArray = optsStr.split(',');
                const optMap = {
                    'brahma': 'opt-brahma',
                    'sun': 'opt-sunrise',
                    'sandhya': 'opt-sandhya',
                    'noon': 'opt-noon',
                    'civil': 'opt-civil',
                    'nautical': 'opt-nautical',
                    'astronomical': 'opt-astronomical',
                    'moon_phases': 'opt-moon-phases',
                    'moon_times': 'opt-moon-times',
                    'moon_illumination': 'opt-moon-illumination'
                };
                
                // First uncheck all
                Object.values(optMap).forEach(id => {
                    const cb = document.getElementById(id);
                    if (cb) cb.checked = false;
                });
                
                // Then check the ones in the URL
                optArray.forEach(opt => {
                    const id = optMap[opt];
                    if (id) {
                        const cb = document.getElementById(id);
                        if (cb) cb.checked = true;
                    }
                });
            }
            
            // Populate coordinates and trigger search
            const inputCoords = document.getElementById('input-coords');
            if (inputCoords) {
                inputCoords.value = `${latFloat}, ${lngFloat}`;
                setTimeout(() => {
                    if (typeof searchLocationByCoords === 'function') {
                        searchLocationByCoords().then(() => {
                            if (typeof showVisualCalendar === 'function') {
                                showVisualCalendar();
                            }
                        });
                    }
                }, 300);
            }
        }
    } else {
        // If not a preview action, try restoring from localStorage
        const savedLat = localStorage.getItem('savedLat');
        const savedLng = localStorage.getItem('savedLng');
        const savedLocName = localStorage.getItem('savedLocName');
        
        if (savedLat && savedLng && savedLocName) {
            const latF = parseFloat(savedLat);
            const lngF = parseFloat(savedLng);
            if (!isNaN(latF) && !isNaN(lngF)) {
                setTimeout(() => {
                    if (typeof finalizeLocationUpdate === 'function') {
                        finalizeLocationUpdate(latF, lngF, savedLocName);
                    }
                }, 100);
            }
        }
    }
    
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

function updateDynamicUrls() {
    if (currentLat === null || currentLng === null) return;
    
    const opts = [];
    if (document.getElementById('opt-brahma')?.checked) opts.push('brahma');
    if (document.getElementById('opt-sunrise')?.checked) opts.push('sun');
    if (document.getElementById('opt-sandhya')?.checked) opts.push('sandhya');
    if (document.getElementById('opt-noon')?.checked) opts.push('noon');
    if (document.getElementById('opt-civil')?.checked) opts.push('civil');
    if (document.getElementById('opt-nautical')?.checked) opts.push('nautical');
    if (document.getElementById('opt-astronomical')?.checked) opts.push('astronomical');
    if (document.getElementById('opt-moon-phases')?.checked) opts.push('moon_phases');
    if (document.getElementById('opt-moon-times')?.checked) opts.push('moon_times');
    
    const optionsStr = opts.join(',');
    const cacheBuster = Date.now();
    const workerUrl = `https://api.sunmooncal.com/sync/${currentLat.toFixed(6)}/${currentLng.toFixed(6)}/${optionsStr}/${cacheBuster}.ics`;
    const webcalUrl = workerUrl.replace('https://', 'webcal://');
    
    // Apple Calendar prefers webcal:// protocol to trigger the native app
    const btnApple = document.getElementById('btn-apple-cal');
    if (btnApple) btnApple.href = webcalUrl;
    
    // Google Calendar sometimes rejects HTTPS links if previously cached as failing. webcal:// is safer.
    const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
    const btnGoogle = document.getElementById('btn-google-cal');
    if (btnGoogle) btnGoogle.href = googleCalUrl;
    
    const inputUrl = document.getElementById('manual-sync-url');
    if (inputUrl) inputUrl.value = workerUrl;

    // External Preview link for the Extension popup
    const btnPreview = document.getElementById('btn-preview-external');
    if (btnPreview) {
        btnPreview.href = `https://sunmooncal.com/?lat=${currentLat.toFixed(6)}&lng=${currentLng.toFixed(6)}&opts=${optionsStr}&action=preview`;
    }
}

function subscribeDynamic(e) {
    if (e) e.preventDefault();
    if (currentLat === null || currentLng === null) return;
    
    updateDynamicUrls();
    
    const drawer = document.getElementById('dynamic-sync-drawer');
    if (drawer) {
        if (drawer.style.display === 'none' || !drawer.style.display) {
            drawer.style.display = 'flex';
        } else {
            drawer.style.display = 'none';
        }
    }
}

function copySyncUrl() {
    const input = document.getElementById('manual-sync-url');
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('copy-sync-btn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-tertiary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

document.addEventListener('DOMContentLoaded', initDefaults);

// PWA Install Prompt Handling
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    const installCard = document.getElementById('card-pwa');
    const installBtnCard = document.getElementById('btn-install-pwa-card');
    
    const showInstallPrompt = async (clickEvent) => {
        if (clickEvent) clickEvent.preventDefault();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        } else {
            alert("To install the app, click the install icon in your browser's address bar.");
        }
    };

    if (installBtn) {
        installBtn.style.display = 'inline-block';
        installBtn.addEventListener('click', showInstallPrompt);
    }
    if (installBtnCard) {
        if (installCard) installCard.style.display = 'block';
        installBtnCard.addEventListener('click', showInstallPrompt);
    }
});

// Also attach a fallback directly in case beforeinstallprompt hasn't fired yet
document.addEventListener('DOMContentLoaded', () => {
    const fallbackBtn = document.getElementById('btn-install-pwa-card');
    if (fallbackBtn) {
        fallbackBtn.addEventListener('click', (e) => {
            if (!deferredPrompt) {
                e.preventDefault();
                alert("If the install prompt doesn't appear, you can install the app by clicking the install icon in your browser's address bar (near the bookmark star).");
            }
        });
    }
});

// Detect iOS for manual PWA install tooltip
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
};
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

if (isIos() && !isInStandaloneMode()) {
    const installBtn = document.getElementById('btn-install-pwa');
    const installCard = document.getElementById('card-pwa');
    const installBtnCard = document.getElementById('btn-install-pwa-card');
    const installMsg = document.getElementById('pwa-install-msg');
    
    const iosInstallAlert = () => {
        alert("To install the app on iOS: tap the 'Share' icon at the bottom of Safari, then scroll down and tap 'Add to Home Screen'.");
    };

    if (installBtn) {
        installBtn.style.display = 'inline-block';
        installBtn.textContent = "Install (iOS)";
        installBtn.addEventListener('click', iosInstallAlert);
    }
    
    if (installBtnCard) {
        installBtnCard.addEventListener('click', (e) => {
            e.preventDefault();
            iosInstallAlert();
        });
    }
}

// Extension detection and UI adjustment no longer needed here as popup.html handles it via dedicated DOM.

// Error Toast Notification System
function showError(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            width: max-content;
            max-width: 90vw;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        pointer-events: auto;
        text-align: center;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Override native alert for our app to use the new toast system
window.alert = showError;

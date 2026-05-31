/**
 * Yoga Sadhana Calendar
 * Central Navigation & Overlay UX Controller
 */

const CLOSED_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
</svg>`;

const OPEN_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;

/**
 * Mobile Drawer Menu Handlers
 */
function toggleMobileMenu() {
    const nav = document.getElementById('header-nav');
    const toggle = document.getElementById('menu-toggle');
    if (!nav || !toggle) return;
    
    const isActive = nav.classList.toggle('active');
    toggle.classList.toggle('active', isActive);
    toggle.innerHTML = isActive ? OPEN_SVG : CLOSED_SVG;
    
    if (isActive) {
        // Push menu state into history for clean back-button integration
        history.pushState({ menuOpen: true }, '');
    } else {
        if (history.state && history.state.menuOpen) {
            history.back();
        }
    }
}

function closeMobileMenu() {
    const nav = document.getElementById('header-nav');
    const toggle = document.getElementById('menu-toggle');
    if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        if (toggle) {
            toggle.classList.remove('active');
            toggle.innerHTML = CLOSED_SVG;
        }
        if (history.state && history.state.menuOpen) {
            history.back();
        }
    }
}

/**
 * Calendar Modal Overlay Handlers
 */
function openCalendarModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        // Push modal state into history
        history.pushState({ modalOpen: true }, '');
    }
}

function closeCalendarModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal && modal.style.display === 'flex') {
        modal.style.display = 'none';
        if (history.state && history.state.modalOpen) {
            history.back();
        }
    }
}

/**
 * Global Keyboard & Interaction Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Click Outside auto-closing triggers
    document.addEventListener('click', (event) => {
        const nav = document.getElementById('header-nav');
        const toggle = document.getElementById('menu-toggle');
        
        // Close menu drawer if tapping outside
        if (nav && nav.classList.contains('active')) {
            if (!nav.contains(event.target) && !toggle.contains(event.target)) {
                closeMobileMenu();
            }
        }
        
        // Close calendar preview modal if tapping dark background overlay itself
        const modal = document.getElementById('modal-overlay');
        if (modal && modal.style.display === 'flex') {
            if (event.target === modal) {
                closeCalendarModal();
            }
        }
    });

    // 2. Escape Key support
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
            closeCalendarModal();
        }
    });

    // 3. Swipe Left to close drawer gesture (passive listeners for scrolling efficiency)
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        
        // Standard horizontal swipe left logic (must exceed 40px threshold and be primarily horizontal)
        if (diffX > 40 && diffX > diffY * 2) {
            closeMobileMenu();
        }
    }, { passive: true });
});

// 4. Back-button and Swipe-back gesture intercept
window.addEventListener('popstate', (event) => {
    // Close menu drawer if we popped back from active menu open state
    if (!event.state || !event.state.menuOpen) {
        const nav = document.getElementById('header-nav');
        const toggle = document.getElementById('menu-toggle');
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            if (toggle) {
                toggle.classList.remove('active');
                toggle.innerHTML = CLOSED_SVG;
            }
        }
    }
    
    // Close calendar overlay if we popped back from active modal open state
    if (!event.state || !event.state.modalOpen) {
        const modal = document.getElementById('modal-overlay');
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    }
});

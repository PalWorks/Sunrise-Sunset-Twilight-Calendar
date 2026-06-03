import re

with open('frontend/index.html', 'r') as f:
    content = f.read()

replacements = [
    (
        '''    <script src="https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js" integrity="sha384-Ssj6wXFm/aTdsC1FeDLrGxP3/PooxBGcOqehkmt8CbKQOcei4CDaRbreAUvdFNrq" crossorigin="anonymous" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H" crossorigin="anonymous" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" integrity="sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk" crossorigin="anonymous" defer></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>''',
        '''    <script src="lib/suncalc.min.js" defer></script>
    <script src="lib/html2canvas.min.js" defer></script>
    <script src="lib/jspdf.umd.min.js" defer></script>
    <link rel="stylesheet" href="lib/leaflet/leaflet.css"/>
    <script src="lib/leaflet/leaflet.js" defer></script>'''
    ),
    (
        '<button class="menu-toggle" id="menu-toggle" aria-label="Toggle Navigation Menu" onclick="toggleMobileMenu(event)">',
        '<button class="menu-toggle" id="menu-toggle" aria-label="Toggle Navigation Menu">'
    ),
    (
        '<input type="text" id="input-location" class="meta-input" placeholder="Search city..." onkeypress="handleLocationEnter(event)" oninput="handleLocationInput(event)" autocomplete="off">',
        '<input type="text" id="input-location" class="meta-input" placeholder="Search city..." autocomplete="off">'
    ),
    (
        '<button onclick="searchLocationByText()" class="meta-search-btn" title="Search">',
        '<button id="btn-search-location" class="meta-search-btn" title="Search">'
    ),
    (
        '<input type="text" id="input-coords" class="meta-input" placeholder="Lat, Lng" onkeypress="handleCoordsEnter(event)">',
        '<input type="text" id="input-coords" class="meta-input" placeholder="Lat, Lng">'
    ),
    (
        '<button onclick="searchLocationByCoords()" class="meta-search-btn" title="Search Coordinates">',
        '<button id="btn-search-coords" class="meta-search-btn" title="Search Coordinates">'
    ),
    (
        '<button class="btn-action" onclick="generateStaticICS()">',
        '<button id="btn-download-ics" class="btn-action">'
    ),
    (
        '<a href="#" class="btn-action" id="dynamic-link" onclick="subscribeDynamic(event)">',
        '<a href="#" class="btn-action" id="dynamic-link">'
    ),
    (
        'onclick="copySyncUrl()" title="Copy Link">',
        'title="Copy Link">'
    ),
    (
        '<button class="btn-action" onclick="showVisualCalendar()">',
        '<button id="btn-show-calendar" class="btn-action">'
    ),
    (
        '<button class="close-modal" data-html2canvas-ignore="true" onclick="closeVisualCalendar()" aria-label="Close calendar">',
        '<button id="btn-close-calendar" class="close-modal" data-html2canvas-ignore="true" aria-label="Close calendar">'
    ),
    (
        '<input type="text" id="month-picker" placeholder="YYYY-MM" onkeypress="handleDateKey(event)" onblur="jumpToTextDate()" style="font-size: 1rem; padding: 0.5rem 0.8rem; width: 120px; text-align: center; border: 1px solid var(--card-border); border-radius: 8px; background: rgba(0,0,0,0.02); color: var(--text-main); font-weight: 600;">',
        '<input type="text" id="month-picker" placeholder="YYYY-MM" style="font-size: 1rem; padding: 0.5rem 0.8rem; width: 120px; text-align: center; border: 1px solid var(--card-border); border-radius: 8px; background: rgba(0,0,0,0.02); color: var(--text-main); font-weight: 600;">'
    ),
    (
        '<button class="toggle-btn" id="btn-12h" onclick="setTimeFormat(\'12h\')">12 Hr</button>',
        '<button class="toggle-btn" id="btn-12h">12 Hr</button>'
    ),
    (
        '<button class="toggle-btn active" id="btn-24h" onclick="setTimeFormat(\'24h\')">24 Hr</button>',
        '<button class="toggle-btn active" id="btn-24h">24 Hr</button>'
    ),
    (
        '<button class="nav-btn" onclick="changeMonth(-1)">Prev</button>',
        '<button id="btn-prev-month" class="nav-btn">Prev</button>'
    ),
    (
        '<button class="nav-btn" onclick="changeMonth(1)">Next</button>',
        '<button id="btn-next-month" class="nav-btn">Next</button>'
    ),
    (
        '<button class="export-btn" id="save-png-btn" style="display: flex; align-items: center; gap: 0.5rem;" onclick="downloadCalendarImage()">Save PNG</button>',
        '<button class="export-btn" id="save-png-btn" style="display: flex; align-items: center; gap: 0.5rem;">Save PNG</button>'
    ),
    (
        '<button class="export-btn secondary" id="save-pdf-btn" style="display: flex; align-items: center; gap: 0.5rem;" onclick="downloadCalendarPDF()">Save PDF</button>',
        '<button class="export-btn secondary" id="save-pdf-btn" style="display: flex; align-items: center; gap: 0.5rem;">Save PDF</button>'
    ),
    (
        '<button class="side-nav-btn prev" data-html2canvas-ignore="true" onclick="changeMonth(-1)">&#10094;</button>',
        '<button id="btn-side-prev-month" class="side-nav-btn prev" data-html2canvas-ignore="true">&#10094;</button>'
    ),
    (
        '<button class="side-nav-btn next" data-html2canvas-ignore="true" onclick="changeMonth(1)">&#10095;</button>',
        '<button id="btn-side-next-month" class="side-nav-btn next" data-html2canvas-ignore="true">&#10095;</button>'
    ),
    (
        '''    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js?v=4').then(registration => {
                    console.log('SW registered: ', registration);
                }).catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
            });
        }
    </script>''',
        ''
    ),
    (
        '''    <script>
        // Set time format toggles from index UI
        function setTimeFormat(format) {
            use24Hour = (format === '24h');
            document.getElementById('btn-12h').classList.toggle('active', !use24Hour);
            document.getElementById('btn-24h').classList.toggle('active', use24Hour);
            if (document.getElementById('modal-overlay').style.display === 'flex') {
                renderCalendar();
            }
        }
    </script>''',
        '''    <script src="js/events.js?v=4" defer></script>'''
    )
]

for old_str, new_str in replacements:
    content = content.replace(old_str, new_str)

# Now globally remove ` onchange="handleOptionToggle()"`
content = content.replace(' onchange="handleOptionToggle()"', '')

with open('frontend/index.html', 'w') as f:
    f.write(content)
print("Updated frontend/index.html")

let isExporting = false;

function toICSDate(date) {
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateUID(dateStr, eventName) {
    const cleanName = eventName.replace(/\s+/g, '').toLowerCase();
    return `${dateStr}_${cleanName}@sunmooncal.com`;
}

function createEvent(name, start, end, description = '') {
    if (!start || !end) return '';
    const dtStart = toICSDate(start);
    const dtEnd = toICSDate(end);
    const dtStamp = toICSDate(new Date());
    const uid = generateUID(dtStart, name);
    return `BEGIN:VEVENT\r\nCREATED:${dtStamp}\r\nDTSTART:${dtStart}\r\nDTEND:${dtEnd}\r\nDTSTAMP:${dtStamp}\r\nUID:${uid}\r\nSUMMARY:${name}\r\nDESCRIPTION:${description}\r\nEND:VEVENT\r\n`;
}

function generateStaticICS() {
    if (currentLat === null || currentLng === null) {
        alert("Please select a location first.");
        return;
    }
    let ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SunMoonCal.com//StaticBrowser//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:SunMoonCal.com (${currentCity})\r\n`;
    const today = new Date();
    const btn = document.querySelector('.card-static button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Generating...';
    
    setTimeout(() => {
        for (let i = 0; i < 365; i++) {
            const current = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 12, 0, 0);
            const times = SunCalc.getTimes(current, currentLat, currentLng);
            
            if (document.getElementById('opt-noon').checked && times.solarNoon) {
                const noonStart = new Date(times.solarNoon.getTime() - 5 * 60000);
                const noonEnd = new Date(times.solarNoon.getTime() + 5 * 60000);
                ics += createEvent("Solar Noon", noonStart, noonEnd, "Solar Transit Peak");
            }
            if (document.getElementById('opt-sunrise').checked) {
                if (times.sunrise) {
                    ics += createEvent("Sunrise", times.sunrise, new Date(times.sunrise.getTime() + 15 * 60000));
                }
                if (times.sunset) {
                    ics += createEvent("Sunset", times.sunset, new Date(times.sunset.getTime() + 15 * 60000));
                }
            }
            if (document.getElementById('opt-brahma').checked && times.sunrise) {
                const brahmaStart = new Date(times.sunrise.getTime() - 96 * 60000);
                const brahmaEnd = new Date(times.sunrise.getTime() - 48 * 60000);
                ics += createEvent("Brahma Muhurta", brahmaStart, brahmaEnd, "Sacred pre-sunrise period for spiritual practices.");
            }
            if (document.getElementById('opt-sandhya').checked) {
                if (times.sunrise) {
                    ics += createEvent("Morning Sandhya", new Date(times.sunrise.getTime() - 24 * 60000), new Date(times.sunrise.getTime() + 24 * 60000), "Auspicious morning junction.");
                }
                if (times.sunset) {
                    ics += createEvent("Evening Sandhya", new Date(times.sunset.getTime() - 24 * 60000), new Date(times.sunset.getTime() + 24 * 60000), "Auspicious evening junction.");
                }
            }
            if (document.getElementById('opt-civil').checked) {
                if (times.dawn && times.sunrise) {
                    ics += createEvent("Civil Dawn", times.dawn, times.sunrise);
                }
                if (times.sunset && times.dusk) {
                    ics += createEvent("Civil Dusk", times.sunset, times.dusk);
                }
            }
            if (document.getElementById('opt-nautical').checked) {
                if (times.nauticalDawn && times.dawn) {
                    ics += createEvent("Nautical Dawn", times.nauticalDawn, times.dawn);
                }
                if (times.dusk && times.nauticalDusk) {
                    ics += createEvent("Nautical Dusk", times.dusk, times.nauticalDusk);
                }
            }
            if (document.getElementById('opt-astronomical').checked) {
                if (times.nightEnd && times.nauticalDawn) {
                    ics += createEvent("Astronomical Dawn", times.nightEnd, times.nauticalDawn);
                }
                if (times.nauticalDusk && times.night) {
                    ics += createEvent("Astronomical Dusk", times.nauticalDusk, times.night);
                }
            }
            
            if (document.getElementById('opt-moon-phases').checked) {
                const moonIllum = SunCalc.getMoonIllumination(current);
                const phase = moonIllum.phase;
                let phaseName = "";
                if (phase < 0.03 || phase > 0.97) {
                    phaseName = `New Moon (${(moonIllum.fraction * 100).toFixed(0)}%)`;
                } else if (phase > 0.47 && phase < 0.53) {
                    phaseName = `Full Moon (${(moonIllum.fraction * 100).toFixed(0)}%)`;
                }
                if (phaseName !== "") {
                    const moonStart = new Date(current.getTime());
                    moonStart.setHours(12,0,0,0);
                    const moonEnd = new Date(moonStart.getTime() + 60 * 60000);
                    ics += createEvent(phaseName, moonStart, moonEnd, "Lunar Phase");
                }
            }
            
            if (document.getElementById('opt-moon-times').checked) {
                const moonTimes = SunCalc.getMoonTimes(current, currentLat, currentLng);
                if (moonTimes.rise) {
                    ics += createEvent("Moonrise", moonTimes.rise, new Date(moonTimes.rise.getTime() + 15 * 60000));
                }
                if (moonTimes.set) {
                    ics += createEvent("Moonset", moonTimes.set, new Date(moonTimes.set.getTime() + 15 * 60000));
                }
            }
        }
        ics += `END:VCALENDAR\r\n`;
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sunmooncal_${currentCity.toLowerCase().replace(/\s+/g, '_')}_1_year.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        btn.innerHTML = originalText;
    }, 50);
}

async function downloadCalendarImage() {
    if (isExporting) return;
    isExporting = true;
    
    const wrapper = document.getElementById('calendar-wrapper');
    const saveBtn = document.getElementById('save-png-btn');
    const originalHtml = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<div class="spinner"></div> Saving...';
    saveBtn.style.pointerEvents = 'none';
    
    await new Promise(r => setTimeout(r, 50));
    
    try {
        const canvas = await html2canvas(wrapper, { 
            backgroundColor: '#ffffff', 
            scale: 2,
            windowWidth: wrapper.scrollWidth,
            windowHeight: wrapper.scrollHeight,
            onclone: (clonedDoc) => {
                const clonedWrapper = clonedDoc.getElementById('calendar-wrapper');
                const clonedFrame = clonedDoc.querySelector('.cal-modal-frame');
                const clonedOverlay = clonedDoc.getElementById('modal-overlay');
                
                if (clonedWrapper) {
                    clonedWrapper.style.maxHeight = 'none';
                    clonedWrapper.style.overflowY = 'visible';
                }
                if (clonedFrame) {
                    clonedFrame.style.maxHeight = 'none';
                }
                if (clonedOverlay) {
                    clonedOverlay.style.alignItems = 'flex-start';
                }
            }
        });
        const link = document.createElement('a');
        link.download = `sunmooncal_calendar_${currentCity.toLowerCase()}_${currentDate.getMonth()+1}_${currentDate.getFullYear()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error(err);
        alert("Could not generate image.");
    } finally {
        saveBtn.innerHTML = originalHtml;
        saveBtn.style.pointerEvents = 'auto';
        isExporting = false;
    }
}

async function downloadCalendarPDF() {
    if (isExporting) return;
    isExporting = true;
    
    const wrapper = document.getElementById('calendar-wrapper');
    const saveBtn = document.getElementById('save-pdf-btn');
    const originalHtml = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<div class="spinner" style="border-color: rgba(0,0,0,0.1); border-top-color: var(--text-main);"></div> Saving...';
    saveBtn.style.pointerEvents = 'none';
    
    await new Promise(r => setTimeout(r, 50));
    
    try {
        const canvas = await html2canvas(wrapper, { 
            backgroundColor: '#ffffff', 
            scale: 2,
            windowWidth: wrapper.scrollWidth,
            windowHeight: wrapper.scrollHeight,
            onclone: (clonedDoc) => {
                const clonedWrapper = clonedDoc.getElementById('calendar-wrapper');
                const clonedFrame = clonedDoc.querySelector('.cal-modal-frame');
                const clonedOverlay = clonedDoc.getElementById('modal-overlay');
                
                if (clonedWrapper) {
                    clonedWrapper.style.maxHeight = 'none';
                    clonedWrapper.style.overflowY = 'visible';
                }
                if (clonedFrame) {
                    clonedFrame.style.maxHeight = 'none';
                }
                if (clonedOverlay) {
                    clonedOverlay.style.alignItems = 'flex-start';
                }
            }
        });
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        const pageWidth = 297;
        const pageHeight = 210;
        const margin = 0;
        
        const maxAvailableWidth = pageWidth - (margin * 2);
        const maxAvailableHeight = pageHeight - (margin * 2);
        
        const widthRatio = maxAvailableWidth / canvas.width;
        const heightRatio = maxAvailableHeight / canvas.height;
        const bestRatio = Math.min(widthRatio, heightRatio);
        
        const finalWidth = canvas.width * bestRatio;
        const finalHeight = canvas.height * bestRatio;
        
        const xPos = margin + (maxAvailableWidth - finalWidth) / 2;
        const yPos = margin + (maxAvailableHeight - finalHeight) / 2;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, yPos, finalWidth, finalHeight);
        pdf.save(`sunmooncal_calendar_${currentCity.toLowerCase()}_${currentDate.getMonth()+1}_${currentDate.getFullYear()}.pdf`);
        
    } catch (err) {
        console.error(err);
        alert("Could not generate PDF.");
    } finally {
        saveBtn.innerHTML = originalHtml;
        saveBtn.style.pointerEvents = 'auto';
        isExporting = false;
    }
}

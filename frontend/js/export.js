let isExporting = false;

function generateICS() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Yoga Sadhana Calendar//EN\n";
    
    for (let i = 1; i <= daysInMonth; i++) {
        // Here we generate the absolute UTC time for calculation
        const targetDate = new Date(Date.UTC(year, month, i, 12, 0, 0));
        const times = SunCalc.getTimes(targetDate, currentLat, currentLng);
        
        if (document.getElementById('opt-brahma').checked && times.sunrise) {
            const start = new Date(times.sunrise.getTime() - 96 * 60000);
            const end = new Date(times.sunrise.getTime() - 48 * 60000);
            ics += formatICSEvent(start, end, 'Brahma Muhurta');
        }
        if (document.getElementById('opt-sunrise').checked && times.sunrise) {
            const end = new Date(times.sunrise.getTime() + 5 * 60000);
            ics += formatICSEvent(times.sunrise, end, 'Sunrise');
        }
        if (document.getElementById('opt-sandhya').checked && times.sunrise) {
            const start = new Date(times.sunrise.getTime() - 24 * 60000);
            const end = new Date(times.sunrise.getTime() + 24 * 60000);
            ics += formatICSEvent(start, end, 'Morning Sandhya');
        }
        if (document.getElementById('opt-noon').checked && times.solarNoon) {
            const end = new Date(times.solarNoon.getTime() + 5 * 60000);
            ics += formatICSEvent(times.solarNoon, end, 'Solar Noon');
        }
        if (document.getElementById('opt-sandhya').checked && times.sunset) {
            const start = new Date(times.sunset.getTime() - 24 * 60000);
            const end = new Date(times.sunset.getTime() + 24 * 60000);
            ics += formatICSEvent(start, end, 'Evening Sandhya');
        }
        if (document.getElementById('opt-sunrise').checked && times.sunset) {
            const end = new Date(times.sunset.getTime() + 5 * 60000);
            ics += formatICSEvent(times.sunset, end, 'Sunset');
        }
    }
    
    ics += "END:VCALENDAR";
    return ics;
}

function formatICSEvent(start, end, summary) {
    const formatStr = (d) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    return `BEGIN:VEVENT\nDTSTART:${formatStr(start)}\nDTEND:${formatStr(end)}\nSUMMARY:${summary}\nEND:VEVENT\n`;
}

function downloadICS() {
    if (currentLat === null) {
        alert("Please select a location first.");
        return;
    }
    const ics = generateICS();
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `yogasadhana_${currentCity.toLowerCase()}_${currentDate.getMonth()+1}_${currentDate.getFullYear()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        const canvas = await html2canvas(wrapper, { backgroundColor: '#ffffff', scale: 2 });
        const link = document.createElement('a');
        link.download = `yogasadhana_calendar_${currentCity.toLowerCase()}_${currentDate.getMonth()+1}_${currentDate.getFullYear()}.png`;
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
        const canvas = await html2canvas(wrapper, { backgroundColor: '#ffffff', scale: 2 });
        
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
        pdf.save(`yogasadhana_calendar_${currentCity.toLowerCase()}_${currentDate.getMonth()+1}_${currentDate.getFullYear()}.pdf`);
        
    } catch (err) {
        console.error(err);
        alert("Could not generate PDF.");
    } finally {
        saveBtn.innerHTML = originalHtml;
        saveBtn.style.pointerEvents = 'auto';
        isExporting = false;
    }
}

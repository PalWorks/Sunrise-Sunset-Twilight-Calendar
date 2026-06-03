import SunCalc from 'suncalc';

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
  if (!dtStart || !dtEnd) return ''; // Prevent DTSTART:null for invalid dates

  const dtStamp = toICSDate(new Date());
  const uid = generateUID(dtStart, name);

  let evt = `BEGIN:VEVENT
CREATED:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
DTSTAMP:${dtStamp}
UID:${uid}
SUMMARY:${name}
`;
  if (description) {
    evt += `DESCRIPTION:${description}\n`;
  }
  evt += `END:VEVENT\n`;
  return evt;
}

function generateCalendar(lat, lng, activeOptions) {
  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SunMoonCal.com//Worker//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:SunMoonCal.com
X-WR-CALDESC:Dynamic Solar and Sadhana Timings
REFRESH-INTERVAL;VALUE=DURATION:PT12H
X-PUBLISHED-TTL:PT12H
X-APPLE-CALENDAR-COLOR:#FF9500
`;

  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const current = new Date(today);
    current.setDate(today.getDate() + i);
    
    const times = SunCalc.getTimes(current, lat, lng);
    
    if (activeOptions.includes('noon') && times.solarNoon && !isNaN(times.solarNoon.getTime())) {
      const noonStart = new Date(times.solarNoon.getTime() - 5 * 60000);
      const noonEnd = new Date(times.solarNoon.getTime() + 5 * 60000);
      ics += createEvent("Solar Noon Peak", noonStart, noonEnd, "Solar Transit Peak");
    }
    
    if (times.sunrise) {
      if (activeOptions.includes('sunrise')) {
        const sunriseStart = times.sunrise;
        const sunriseEnd = new Date(sunriseStart.getTime() + 15 * 60000);
        ics += createEvent("Sunrise", sunriseStart, sunriseEnd);
      }
      
      if (activeOptions.includes('brahma')) {
        const brahmaStart = new Date(times.sunrise.getTime() - 96 * 60000);
        const brahmaEnd = new Date(times.sunrise.getTime() - 48 * 60000);
        ics += createEvent("Brahma Muhurta", brahmaStart, brahmaEnd, "Auspicious pre-sunrise period for spiritual practices.");
      }
      
      if (activeOptions.includes('sandhya')) {
        const mSandhyaStart = new Date(times.sunrise.getTime() - 24 * 60000);
        const mSandhyaEnd = new Date(times.sunrise.getTime() + 24 * 60000);
        ics += createEvent("Morning Sandhya", mSandhyaStart, mSandhyaEnd, "Auspicious junction 24 minutes before and after sunrise.");
      }
    }
    
    if (times.sunset) {
      if (activeOptions.includes('sunrise')) {
        const sunsetStart = times.sunset;
        const sunsetEnd = new Date(sunsetStart.getTime() + 15 * 60000);
        ics += createEvent("Sunset", sunsetStart, sunsetEnd);
      }
      
      if (activeOptions.includes('sandhya')) {
        const eSandhyaStart = new Date(times.sunset.getTime() - 24 * 60000);
        const eSandhyaEnd = new Date(times.sunset.getTime() + 24 * 60000);
        ics += createEvent("Evening Sandhya", eSandhyaStart, eSandhyaEnd, "Auspicious junction 24 minutes before and after sunset.");
      }
    }
    
    if (activeOptions.includes('civil')) {
      if (times.dawn && times.sunrise) {
        ics += createEvent("Civil Twilight (Morning)", times.dawn, times.sunrise);
      }
      if (times.sunset && times.dusk) {
        ics += createEvent("Civil Twilight (Evening)", times.sunset, times.dusk);
      }
    }
    
    if (activeOptions.includes('nautical')) {
      if (times.nauticalDawn && times.dawn) {
        ics += createEvent("Nautical Twilight (Morning)", times.nauticalDawn, times.dawn);
      }
      if (times.dusk && times.nauticalDusk) {
        ics += createEvent("Nautical Twilight (Evening)", times.dusk, times.nauticalDusk);
      }
    }

    if (activeOptions.includes('astronomical')) {
      if (times.nightEnd && times.nauticalDawn) {
        ics += createEvent("Astronomical Twilight (Morning)", times.nightEnd, times.nauticalDawn);
      }
      if (times.nauticalDusk && times.night) {
        ics += createEvent("Astronomical Twilight (Evening)", times.nauticalDusk, times.night);
      }
    }
    
    if (activeOptions.includes('moon_phases')) {
      const moonIllum = SunCalc.getMoonIllumination(current);
      const phase = moonIllum.phase;
      let phaseName = "";
      if (phase < 0.03 || phase > 0.97) {
        phaseName = `New Moon (${(moonIllum.fraction * 100).toFixed(0)}%)`;
      } else if (phase > 0.22 && phase < 0.28) {
        phaseName = `First Quarter Moon (${(moonIllum.fraction * 100).toFixed(0)}%)`;
      } else if (phase > 0.47 && phase < 0.53) {
        phaseName = `Full Moon (${(moonIllum.fraction * 100).toFixed(0)}%)`;
      } else if (phase > 0.72 && phase < 0.78) {
        phaseName = `Last Quarter Moon (${(moonIllum.fraction * 100).toFixed(0)}%)`;
      }
      
      if (phaseName) {
        const moonStart = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 12, 0, 0);
        const moonEnd = new Date(moonStart.getTime() + 15 * 60000);
        ics += createEvent(phaseName, moonStart, moonEnd, `Moon Phase: ${phaseName}`);
      }
    }
    
    if (activeOptions.includes('moon_times')) {
      const moonTimes = SunCalc.getMoonTimes(current, lat, lng);
      if (moonTimes.rise && !isNaN(moonTimes.rise.getTime())) {
        ics += createEvent("Moonrise", moonTimes.rise, new Date(moonTimes.rise.getTime() + 15 * 60000));
      }
      if (moonTimes.set && !isNaN(moonTimes.set.getTime())) {
        ics += createEvent("Moonset", moonTimes.set, new Date(moonTimes.set.getTime() + 15 * 60000));
      }
    }
  }

  ics += `END:VCALENDAR\r\n`;
  return ics.replace(/\n/g, '\r\n').replace(/\r\r\n/g, '\r\n');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let lat, lng, optionsParam;

    if (url.pathname.startsWith('/sync/')) {
      const parts = url.pathname.replace('.ics', '').split('/');
      if (parts.length >= 4) {
        lat = parseFloat(parts[2]);
        lng = parseFloat(parts[3]);
        optionsParam = parts[4] || 'brahma,sunrise,sandhya,noon,moon_phases';
      }
    }

    if (lat === undefined || isNaN(lat) || isNaN(lng)) {
      lat = parseFloat(url.searchParams.get('lat'));
      lng = parseFloat(url.searchParams.get('lng'));
      optionsParam = url.searchParams.get('options') || 'brahma,sunrise,sandhya,noon,moon_phases';
    }
    
    if (isNaN(lat) || isNaN(lng)) {
      return new Response("Missing or invalid lat/lng parameters", { status: 400 });
    }
    
    const activeOptions = optionsParam.split(',');
    
    const icsContent = generateCalendar(lat, lng, activeOptions);
    
    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="sunmooncal.ics"',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

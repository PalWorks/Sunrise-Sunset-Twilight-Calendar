const SunCalc = require('suncalc');
function toICSDate(date) {
  if (!date || isNaN(date.getTime())) return null;
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
const times = SunCalc.getTimes(new Date(), 78.2232, 15.6267); // Svalbard (Polar region)
console.log("Sunrise:", times.sunrise);
console.log("ICS Sunrise:", toICSDate(times.sunrise));

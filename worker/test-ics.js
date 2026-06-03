const ICAL = require('ical.js');
const fs = require('fs');
const execSync = require('child_process').execSync;

const icsData = execSync('curl -s "https://api.sunmooncal.com/sync.ics?lat=37.7749&lng=-122.4194&options=sunrise"').toString();

try {
  const jcalData = ICAL.parse(icsData);
  const comp = new ICAL.Component(jcalData);
  console.log("Valid ICS! Found components:", comp.getAllSubcomponents().length);
  // Also check if any warnings
  // console.log(comp.toJSON());
} catch (e) {
  console.error("Parse error:", e);
}

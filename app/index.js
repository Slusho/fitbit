import clock from "clock";
import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";
import { battery } from "power";
import { preferences } from "user-settings";
import { display } from "display";

// Update the clock every second
clock.granularity = "seconds";

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");
let myClock = document.getElementById("myClock"); // digital clock
let myDate = document.getElementById("date");
let myDay = document.getElementById("day");
let spindle = document.getElementById("spindle");
let sh = document.getElementById("sh"); // second hand
let batt = document.getElementById("batt");
let color, color_get, settings, settings_get, time;

// Shows current battery level
display.onchange = () => {
  if (battery.chargeLevel > 30) {
    batt.style.fill = "green";
  } else if ((battery.chargeLevel < 30) && (battery.chargeLevel >= 20)) {
    batt.style.fill = "orange";
  } else {
    batt.style.fill = "red";
  }
}

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes, s) {
  return minutes * 6 + (s / 10);
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds, milli) {
  try {
    if (settings_get === false) {
      return (seconds * 6 + (milli / (1000 / 6)));
    } else {
      return (seconds * 6 + (milli / (1000)));
    }
  }
  catch (err) {
    return (seconds * 6 + (milli / (1000 / 6)));
  }
}

// Digital clock
function digitalClock(evt) {
  let hours = evt.getHours();
  let minutes = evt.getMinutes();
  let suffix;

  if (preferences.clockDisplay === "12h" && hours > 12) {
    if (hours == 0) {
      hours = 12;
    } else {
      hours = hours - 12;
    }
    suffix = "pm";
  } else {
    suffix = "";
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  myClock.text = `${hours}:${minutes}${suffix}`;
}

function dayDate(d, weekday, today) {
  if (d < 10) {
    myDate.text = "0" + d;
  } else {
    myDate.text = d;
  }
  myDay.text = weekday[today.getDay()];
  if (weekday[today.getDay()] == "Sun") {
    myDay.style.fill = "tomato";
  } else {
    myDay.style.fill = "white";
  }
}

// Checks if the settings file is set by user and sets color for the seconds hand, if not, sets the color default to tomato
try {
  color_get = fs.readFileSync("color_set.txt", "json");
  settings_get = fs.readFileSync("sweep.txt", "json");
  // Change second hand(sh) and spindle color
  sh.style.fill = color_get;
  spindle.style.fill = color_get;
  if (settings_get === true) {
    time = 1000;
  }
  if (settings_get === false) {
    time = 60;
  }

} catch (err) {
  sh.style.fill = "tomato";
  spindle.style.fill = "tomato";
  settings_get = false;
}

// Rotate the hands every tick
function updateClock() {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();
  let milli = today.getMilliseconds();
  let d = today.getDate();
  let weekday = new Array(7);
  weekday[0] = "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thu";
  weekday[5] = "Fri";
  weekday[6] = "Sat";

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins, secs);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs, milli);

  digitalClock(today);
  dayDate(d, weekday, today);
}


// Message is received
messaging.peerSocket.onmessage = evt => {
  //console.log(`App received: ${JSON.stringify(evt)}`)
  if (evt.data.key === "color") {
    color = JSON.parse(evt.data.newValue);
    fs.writeFileSync("color_set.txt", color, "json");
    color_get = fs.readFileSync("color_set.txt", "json");
    // Change second hand(sh) and spindle color
    sh.style.fill = color_get;
    spindle.style.fill = color_get;
  }
  if (evt.data.key === "toggle") {
    settings = JSON.parse(evt.data.newValue);
    fs.writeFileSync("sweep.txt", settings, "json");
    settings_get = fs.readFileSync("sweep.txt", "json");
    if (settings_get === true) {
      time = 1000;
    }
    if (settings_get === false) {
      time = 60;
    }
  }
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
}

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
}

function sweep() {
  updateClock();
  setTimeout(sweep, time);
}

sweep();

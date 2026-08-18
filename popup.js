let isIstToTarget = true; // Mode flag: true = IST -> Target, false = Target -> IST


document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill input with current local time formatted for datetime-local
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
  document.getElementById('timeInput').value = localISOTime;


  // Event listeners
  document.getElementById('swapBtn').addEventListener('click', toggleDirection);
  document.getElementById('convertBtn').addEventListener('click', convertTime);
});


function toggleDirection() {
  isIstToTarget = !isIstToTarget;


  const directionLabel = document.getElementById('directionLabel');
  const inputLabel = document.getElementById('inputLabel');
  const tzLabel = document.getElementById('tzLabel');


  if (isIstToTarget) {
    directionLabel.innerText = "IST ➔ Foreign Timezone";
    inputLabel.innerText = "Enter Time in IST:";
    tzLabel.innerText = "Select Foreign Timezone:";
  } else {
    directionLabel.innerText = "Foreign Timezone ➔ IST";
    inputLabel.innerText = "Enter Time in Foreign Timezone:";
    tzLabel.innerText = "Select Foreign Timezone:";
  }


  // Trigger re-conversion automatically if an input is present
  if (document.getElementById('timeInput').value) {
    convertTime();
  }
}


// Helper function to parse a local date/time string in a specific target timezone
function parseDateInTimeZone(dateStr, timeZone) {
  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);


  // Treat as UTC initial reference
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));


  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });


  const parts = formatter.formatToParts(utcDate);
  const map = {};
  parts.forEach(p => map[p.type] = p.value);


  let formattedHour = parseInt(map.hour, 10);
  if (formattedHour === 24) formattedHour = 0;


  const targetAsUtc = Date.UTC(
    parseInt(map.year, 10),
    parseInt(map.month, 10) - 1,
    parseInt(map.day, 10),
    formattedHour,
    parseInt(map.minute, 10)
  );


  const offset = targetAsUtc - utcDate.getTime();
  return new Date(utcDate.getTime() - offset);
}


function convertTime() {
  const timeInput = document.getElementById('timeInput').value;
  const targetTz = document.getElementById('targetTimezone').value;


  if (!timeInput) {
    document.getElementById('result').innerText = "Please select a valid time.";
    return;
  }


  try {
    if (isIstToTarget) {
      // IST (+05:30) to Foreign Timezone
      const istDateString = timeInput + "+05:30";
      const dateObj = new Date(istDateString);


      if (isNaN(dateObj)) {
        document.getElementById('result').innerText = "Invalid date/time format.";
        return;
      }


      const options = {
        timeZone: targetTz,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'long'
      };


      const formatter = new Intl.DateTimeFormat('en-US', options);
      document.getElementById('result').innerText = formatter.format(dateObj);


    } else {
      // Foreign Timezone to IST
      const dateObj = parseDateInTimeZone(timeInput, targetTz);


      if (isNaN(dateObj)) {
        document.getElementById('result').innerText = "Invalid date/time format.";
        return;
      }


      const options = {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      };


      const formatter = new Intl.DateTimeFormat('en-US', options);
      document.getElementById('result').innerText = formatter.format(dateObj) + " (IST)";
    }
  } catch (e) {
    document.getElementById('result').innerText = "Error converting time.";
  }
}

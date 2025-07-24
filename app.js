let calendar;

document.addEventListener('DOMContentLoaded', () => {
  let calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    timeZone: 'local',
    events: fetchEvents,
    eventClick: function(info) {
      if (info.event.url) {
        window.open(info.event.url, '_blank');
      }
    }
  });
  calendar.render();
  showUpcoming();
});

// Lokální ukládání událostí
function saveEvent(event) {
  let events = JSON.parse(localStorage.getItem('events') || '[]');
  events.push(event);
  localStorage.setItem('events', JSON.stringify(events));
}

async function fetchEvents(info, successCallback) {
  let local = JSON.parse(localStorage.getItem('events') || '[]');

  // YouTube
  let yt = [];
  try {
    const res = await fetch('/api/fetchYT');
    yt = await res.json();
  } catch (e) {
    console.warn("Chyba při načítání YT událostí", e);
  }

  successCallback([...local, ...yt]);
}

function showUpcoming() {
  let now = luxon.DateTime.now();
  let events = JSON.parse(localStorage.getItem('events') || '[]');
  let dtEvents = events.map(e => ({
    ...e,
    dt: luxon.DateTime.fromISO(e.start)
  })).filter(e => e.dt > now);

  dtEvents.sort((a, b) => a.dt - b.dt);

  let html = "<h2>Nadcházející události</h2><ul>";
  for (let e of dtEvents) {
    let diff = e.dt.diff(now, ['hours', 'minutes']).toObject();
    html += `<li>${e.title} – ${e.dt.toLocaleString(luxon.DateTime.DATETIME_MED)} (za ${Math.floor(diff.hours)}h ${Math.floor(diff.minutes)}m)</li>`;
  }
  html += "</ul>";
  document.getElementById('upcoming').innerHTML = html;
}

// Formulář – přidání události
document.getElementById('eventForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = e.target.title.value;
  const start = luxon.DateTime.fromISO(e.target.start.value, { zone: 'Europe/Prague' }).toUTC().toISO();

  saveEvent({ title, start, allDay: false });
  calendar.refetchEvents();
  showUpcoming();
});

// Formulář – přidání YouTube kanálu
document.getElementById('channelForm').addEventListener('submit', e => {
  e.preventDefault();
  const chan = e.target.channelId.value.trim();
  let channels = JSON.parse(localStorage.getItem('ytChannels') || '[]');
  if (!channels.includes(chan)) {
    channels.push(chan);
    localStorage.setItem('ytChannels', JSON.stringify(channels));
    alert('Kanál přidán!');
  }
});

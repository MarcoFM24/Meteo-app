/* dettaglio.js
- legge i parametri dalla query string (nome, lat, lon)
- chiama Open-Meteo (current + daily)
- mostra meteo attuale + previsioni 5 giorni
- sfondo dinamico stile Apple Weather
*/

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome') || 'Sconosciuto';
  const lat = params.get('lat');
  const lon = params.get('lon');

  document.getElementById('titolo').textContent = nome;
  document.getElementById('sottotitolo').textContent =
    lat && lon ? `${parseFloat(lat).toFixed(2)}°N, ${parseFloat(lon).toFixed(2)}°E` : '';

  if (!lat || !lon) {
    showError('Coordinate non fornite');
    return;
  }

  try {
    const data = await fetchForecast(lat, lon);
    renderCurrent(data);
    renderDaily(data);
  } catch (err) {
    console.error(err);
    showError('Errore caricamento dati');
  }
});

function showError(msg) {
  document.getElementById('current').innerHTML =
    `<p style="text-align:center;color:var(--text-secondary);">${msg}</p>`;
  document.getElementById('daily').innerHTML = '';
}

/* =======================
   API OPEN METEO
======================= */
async function fetchForecast(lat, lon) {
  const q = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code'
  });

  const res = await fetch(`${FORECAST_BASE}?${q.toString()}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

/* =======================
   METEO ATTUALE
======================= */
function renderCurrent(data) {
  const cur = data.current;
  if (!cur) return showError('Nessun dato disponibile');

  const weatherCode = cur.weather_code;
  applyWeatherBackground(weatherCode);

  const timeStr = new Date(data.current.time)
    .toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  document.getElementById('current').innerHTML = `
    <div class="day-icon" style="font-size:4rem;margin:20px 0;">
      ${getWeatherIcon(weatherCode)}
    </div>
    <div class="temperatura">${Math.round(cur.temperature_2m)}°</div>
    <div class="descrizione">${getWeatherDescription(weatherCode)}</div>

    <div class="dettagli">
      <div class="dettaglio-item">
        <span class="dettaglio-label">Percepita</span>
        <span class="dettaglio-valore">${Math.round(cur.apparent_temperature)}°</span>
      </div>

      <div class="dettaglio-item">
        <span class="dettaglio-label">Umidità</span>
        <span class="dettaglio-valore">${cur.relative_humidity_2m}%</span>
      </div>

      <div class="dettaglio-item">
        <span class="dettaglio-label">Vento</span>
        <span class="dettaglio-valore">${Math.round(cur.wind_speed_10m)} km/h</span>
      </div>

      <div class="dettaglio-item">
        <span class="dettaglio-label">Precipitazioni</span>
        <span class="dettaglio-valore">${cur.precipitation} mm</span>
      </div>

      <div class="dettaglio-item">
        <span class="dettaglio-label">Rilevazione</span>
        <span class="dettaglio-valore">${timeStr}</span>
      </div>
    </div>
  `;
}

/* =======================
   PREVISIONI 5 GIORNI
======================= */
function renderDaily(data) {
  const d = data.daily;
  if (!d?.time) return;

  let html = '';
  for (let i = 0; i < Math.min(5, d.time.length); i++) {
    const date = new Date(d.time[i]);
    const dayName = i === 0 ? 'Oggi' : date.toLocaleDateString('it-IT', { weekday: 'long' });
    const code = d.weather_code[i];

    html += `
      <div class="day-item">
        <div class="day-name">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</div>
        <div class="day-icon">${getWeatherIcon(code)}</div>
        <div class="day-temp">
          <span class="temp-max">${Math.round(d.temperature_2m_max[i])}°</span>
          <span class="temp-min">${Math.round(d.temperature_2m_min[i])}°</span>
        </div>
      </div>
    `;
  }

  document.getElementById('daily').innerHTML = html;
}

/* =======================
   ICONE & TESTI
======================= */
function getWeatherIcon(code) {
  const icons = {
    0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
    45:'🌫️',48:'🌫️',
    51:'🌦️',53:'🌧️',55:'🌧️',
    61:'🌦️',63:'🌧️',65:'🌧️',
    71:'🌨️',73:'🌨️',75:'❄️',
    80:'🌦️',81:'⛈️',82:'⛈️',
    95:'⛈️',96:'⛈️',99:'⛈️'
  };
  return icons[code] || '🌤️';
}

function getWeatherDescription(code) {
  const desc = {
    0:'Sereno',1:'Prevalentemente sereno',2:'Parzialmente nuvoloso',
    3:'Nuvoloso',45:'Nebbia',48:'Nebbia',
    51:'Pioggia leggera',53:'Pioggia moderata',55:'Pioggia forte',
    61:'Pioggia leggera',63:'Pioggia moderata',65:'Pioggia forte',
    71:'Neve leggera',73:'Neve moderata',75:'Neve forte',
    80:'Rovesci',81:'Rovesci forti',82:'Temporale',
    95:'Temporale',96:'Temporale con grandine',99:'Temporale violento'
  };
  return desc[code] || 'Variabile';
}

/* =======================
   SFONDO DINAMICO
======================= */
function applyWeatherBackground(code) {
  const body = document.body;

  [...body.classList].forEach(c => {
    if (c.startsWith('weather-')) body.classList.remove(c);
  });

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 20;

  let cls = 'weather-clear';

  if (code === 0) cls = isNight ? 'weather-night-clear' : 'weather-sunny';
  else if (code <= 2) cls = isNight ? 'weather-night-cloudy' : 'weather-cloudy';
  else if (code === 3) cls = 'weather-overcast';
  else if (code >= 45 && code <= 48) cls = 'weather-foggy';
  else if (code >= 51 && code <= 67) cls = 'weather-rainy';
  else if (code >= 71 && code <= 86) cls = 'weather-snowy';
  else if (code >= 95) cls = 'weather-stormy';

  body.classList.add(cls);
}

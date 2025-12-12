/* dettaglio.js
   - legge i parametri dalla query string (nome, lat, lon)
   - chiama Open-Meteo per current + daily
   - mostra meteo attuale (temperatura, vento, orario) e tabella 5 giorni
*/

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome') || 'Sconosciuto';
  const lat = params.get('lat');
  const lon = params.get('lon');

  document.getElementById('titolo').textContent = `Dettaglio meteo: ${nome}`;
  document.getElementById('sottotitolo').textContent = (lat && lon) ? `Coordinate: ${lat}, ${lon}` : '';

  if (!lat || !lon) {
    document.getElementById('current').textContent = 'Coordinate non fornite — impossibile ottenere previsioni.';
    document.getElementById('daily').textContent = '';
    return;
  }

  try {
    const data = await fetchForecast(lat, lon);
    renderCurrent(data);
    renderDaily(data);
  } catch (err) {
    console.error('Errore fetch forecast:', err);
    document.getElementById('current').textContent = 'Errore caricamento dati meteo: ' + err.message;
    document.getElementById('daily').textContent = '';
  }
});

async function fetchForecast(lat, lon) {
  // Richiediamo current weather + daily (max/min temps, precipitation sum)
  const q = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    current_weather: 'true',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum'
  });
  const url = `${FORECAST_BASE}?${q.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return data;
}

function renderCurrent(data) {
  const cur = data.current_weather;
  if (!cur) {
    document.getElementById('current').textContent = 'Nessun dato meteo attuale disponibile.';
    return;
  }
  // windspeed in km/h già fornita (open-meteo standard)
  const html = `
    <div><strong>Temperatura:</strong> ${cur.temperature} °C</div>
    <div><strong>Vento:</strong> ${cur.windspeed} km/h</div>
    <div><strong>Orario rilevazione:</strong> ${cur.time}</div>
  `;
  document.getElementById('current').innerHTML = html;
}

function renderDaily(data) {
  const daily = data.daily;
  if (!daily || !daily.time) {
    document.getElementById('daily').textContent = 'Nessuna previsione giornaliera disponibile.';
    return;
  }

  // Costruiamo tabella per i primi 5 giorni (o meno se non disponibili)
  const n = Math.min(5, daily.time.length);
  let html = `<table class="forecast-table" border="0" cellpadding="6" cellspacing="0">
    <thead><tr>
      <th>Data</th><th>Max (°C)</th><th>Min (°C)</th><th>Precipitazioni (mm)</th>
    </tr></thead><tbody>`;

  for (let i=0;i<n;i++){
    const dataStr = daily.time[i];
    const maxT = daily.temperature_2m_max[i];
    const minT = daily.temperature_2m_min[i];
    const prec = daily.precipitation_sum[i];
    html += `<tr>
      <td>${dataStr}</td>
      <td>${maxT != null ? maxT : '-'}</td>
      <td>${minT != null ? minT : '-'}</td>
      <td>${prec != null ? prec : '-'}</td>
    </tr>`;
  }

  html += '</tbody></table>';
  document.getElementById('daily').innerHTML = html;
}

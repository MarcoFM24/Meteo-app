/* dettaglio.js */

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
  const q = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    current_weather: 'true',
    // Aggiungiamo: percepita, pressione, nuvolosità, umidità
    current: 'relative_humidity_2m,apparent_temperature,surface_pressure,cloud_cover',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max'
  });
  
  const url = `${FORECAST_BASE}?${q.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

function getMeteoDesc(code) {
  // Codici WMO (World Meteorological Organization)
  if (code === 0) return "☀️ Sereno";
  if (code === 1 || code === 2 || code === 3) return "⛅ Nuvoloso";
  if (code === 45 || code === 48) return "🌫️ Nebbia";
  if (code >= 51 && code <= 55) return "🌧️ Pioviggine";
  if (code >= 61 && code <= 65) return "🌧️ Pioggia";
  if (code >= 71 && code <= 77) return "❄️ Neve";
  if (code >= 95) return "⛈️ Temporale";
  return "❓ Sconosciuto";
}

function renderCurrent(data) {
  const cur = data.current_weather; // Contiene temp, vento, meteoCode
  const extra = data.current;       // Contiene umidità, pressione, percepita, nubi

  if (!cur) {
    document.getElementById('current').textContent = 'Nessun dato.';
    return;
  }

  // Prepara i dati (gestione se mancano)
  const hum = extra && extra.relative_humidity_2m != null ? extra.relative_humidity_2m + '%' : '-';
  const appTemp = extra && extra.apparent_temperature != null ? extra.apparent_temperature + ' °C' : '-';
  const press = extra && extra.surface_pressure != null ? extra.surface_pressure + ' hPa' : '-';
  const cloud = extra && extra.cloud_cover != null ? extra.cloud_cover + '%' : '-';
  
  // Ottieni descrizione e icona dal codice
  const meteoInfo = getMeteoDesc(cur.weathercode);

  const html = `
    <div style="font-size: 1.2em; margin-bottom: 10px;">
      <strong>Condizione:</strong> ${meteoInfo}
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div><strong>🌡️ Temp:</strong> ${cur.temperature} °C</div>
      <div><strong>🧘 Percepita:</strong> ${appTemp}</div>
      
      <div><strong>💧 Umidità:</strong> ${hum}</div>
      <div><strong>☁️ Nubi:</strong> ${cloud}</div>
      
      <div><strong>💨 Vento:</strong> ${cur.windspeed} km/h</div>
      <div><strong>⏲️ Pressione:</strong> ${press}</div>
    </div>

    <div style="margin-top: 15px; font-size: 0.8em; color: gray;">
      Rilevato alle: ${cur.time}
    </div>
  `;
  document.getElementById('current').innerHTML = html;
}

function renderDaily(data) {
  const daily = data.daily;
  if (!daily || !daily.time) {
    document.getElementById('daily').textContent = 'Nessuna previsione giornaliera disponibile.';
    return;
  }

  const n = Math.min(5, daily.time.length);
  let html = `<table class="forecast-table" border="0" cellpadding="6" cellspacing="0">
    <thead><tr>
      <th>Data</th><th>Max (°C)</th><th>Min (°C)</th><th>Pioggia (mm)</th>
    </tr></thead><tbody>`;

  for (let i=0; i<n; i++){
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
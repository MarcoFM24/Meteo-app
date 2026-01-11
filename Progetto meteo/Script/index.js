/*
ALL RIGHTS RESERVED.
Authors: Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
Property: ITI F.Severi Padova && Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
*/

// Variabili globali
let comuni = [];
let mappa; 
let layerMarkers = L.layerGroup(); 
const regione = document.getElementById("regioni");
const message = document.getElementById("message");

// Carica i comuni all'avvio della pagina
function caricaComuni() {
    const URL_COMUNI = "https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";

    message.textContent = "Caricamento delle regioni in corso...";
    message.style.color = "black";

    fetch(URL_COMUNI)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(comuniArray => {
            comuni = comuniArray;
            message.textContent = "Caricamento delle regioni completato con successo!";
            message.style.color = "black";
        })
        .catch(err => {
            message.textContent = "Errore nel caricamento delle regioni.\n" + err.message;
            message.style.color = "red";
            console.error("Errore dettagliato:", err);
        });
}

document.addEventListener("DOMContentLoaded", caricaComuni);

// Gestisce la selezione della regione e mostra le province
const btnProvincie = document.getElementById("cercaRegione");
btnProvincie.addEventListener("click", menuProvince);    

function menuProvince() {
    // Rimuove fieldset precedenti se esistono
    let provinciaFieldset = document.getElementById("province");
    if (provinciaFieldset != null) {
        provinciaFieldset.remove();
    }
    let comuneFieldset = document.getElementById("comuni");
    if (comuneFieldset != null) {
        comuneFieldset.remove();
    }

    const regione = document.getElementById("regioni");
    const output = document.getElementById("selezionaRegione");
    message.textContent = "Caricamento delle province in corso...";
    message.style.color = "black";
    
    if (regione.value == "Non selezionato") {
        message.textContent = "Seleziona una regione!";
        message.style.color = "red";
        return;
    }

    // Ottiene le province della regione selezionata
    let provinceOutput = cercaProvince(regione);

    // Crea il fieldset per le province
    provinciaFieldset = document.createElement("fieldset");
    provinciaFieldset.id = "province";
    const provinciaLegend = document.createElement("legend");
    provinciaLegend.innerHTML = "Provincia";
    output.appendChild(provinciaFieldset);
    provinciaFieldset.appendChild(provinciaLegend);

    // Crea il select delle province
    const provinciaSelect = document.createElement("select");
    provinciaSelect.id = "selectProvince";
    provinciaFieldset.appendChild(provinciaSelect);

    // Popola il select con le province
    creaOption("Non selezionato", "Seleziona una Provincia", provinciaSelect);
    for (let i = 0; i < provinceOutput.length; i++) {
        creaOption(provinceOutput[i], provinceOutput[i], provinciaSelect);
    }

    // Crea bottone per mostrare i comuni sulla mappa
    const btnComuni = creaBottone("cercaComuni", "Mostra Comuni sulla Mappa", provinciaFieldset);
    btnComuni.addEventListener("click", function() {
        menuComuni();
        mostraTuttiComuniProvincia();
    });

    message.textContent = "Province caricate con successo!";
    message.style.color = "green";
}

// Ritorna un array con i nomi delle province della regione selezionata
function cercaProvince(regione) {
    let provinceOutput = [];
    for (let i = 0; i < comuni.length; i++) {
        if (isRegioneCorretto(regione, comuni[i])) {
            provinceOutput.push(comuni[i].provincia.nome);
        }
    }
    return rimuoviDuplicati(provinceOutput);
}

// Gestisce la selezione della provincia e mostra i comuni
function menuComuni() {
    const provincia = document.getElementById("selectProvince");
    const output = document.getElementById("selezionaRegione");
    
    message.textContent = "Caricamento dei comuni in corso...";
    message.style.color = "black";
    
    if (provincia.value == "Non selezionato") {
        message.textContent = "Seleziona una provincia!";
        message.style.color = "red";
        return;
    }

    // Rimuove fieldset dei comuni se esiste
    let comuneFieldset = document.getElementById("comuni");
    if (comuneFieldset != null) {
        comuneFieldset.remove();
    }

    // Ottiene i comuni della provincia selezionata
    let comuniOutput = cercaComuni(provincia.value);

    // Crea il fieldset per i comuni
    comuneFieldset = document.createElement("fieldset");
    comuneFieldset.id = "comuni";
    const comuneLegend = document.createElement("legend");
    comuneLegend.innerHTML = "Comune";
    output.appendChild(comuneFieldset);
    comuneFieldset.appendChild(comuneLegend);

    // Crea il select dei comuni
    const comuneSelect = document.createElement("select");
    comuneSelect.id = "selectComuni";
    comuneFieldset.appendChild(comuneSelect);

    // Popola il select con i comuni
    creaOption("Non selezionato", "Seleziona un Comune", comuneSelect);
    for (let i = 0; i < comuniOutput.length; i++) {
        creaOption(comuniOutput[i], comuniOutput[i], comuneSelect);
    }

    // Crea bottone per centrare il comune sulla mappa
    const btnMeteo = creaBottone("cercaMeteo", "Centra Comune sulla Mappa", comuneFieldset);
    btnMeteo.addEventListener("click", mostraComuneSelezionato);

    message.textContent = "Comuni caricati con successo!";
    message.style.color = "green";
}

// Mostra tutti i comuni della provincia selezionata sulla mappa
async function mostraTuttiComuniProvincia() {
    const provincia = document.getElementById("selectProvince");
    
    if (!provincia || provincia.value === "Non selezionato") {
        message.textContent = "Seleziona una provincia valida!";
        message.style.color = "red";
        return;
    }
    
    message.textContent = "Caricamento di tutti i comuni sulla mappa...";
    message.style.color = "blue";
    
    const comuniProvincia = comuni.filter(c => c.provincia.nome === provincia.value);
    
    if (comuniProvincia.length === 0) {
        message.textContent = "Nessun comune trovato per questa provincia!";
        message.style.color = "red";
        return;
    }
    
    await mostraComuniSuMappa(comuniProvincia);
    
    message.textContent = `Mappa caricata con ${comuniProvincia.length} comuni della provincia di ${provincia.value}!`;
    message.style.color = "green";
}

// Mostra solo il comune selezionato sulla mappa
async function mostraComuneSelezionato() {
    const comuneSelect = document.getElementById("selectComuni");
    const provincia = document.getElementById("selectProvince");
    
    if (!comuneSelect || comuneSelect.value === "Non selezionato") {
        message.textContent = "Seleziona un comune valido!";
        message.style.color = "red";
        return;
    }
    
    message.textContent = "Caricamento del comune sulla mappa...";
    message.style.color = "blue";
    
    const comuneSelezionato = comuni.find(c => 
        c.nome === comuneSelect.value && c.provincia.nome === provincia.value
    );
    
    if (!comuneSelezionato) {
        message.textContent = "Comune non trovato!";
        message.style.color = "red";
        return;
    }
    
    await mostraComuniSuMappa([comuneSelezionato]);
    
    message.textContent = 'Mappa centrata su ' + comuneSelezionato.nome + '!';
    message.style.color = "green";
}

// Confronta se la regione del comune corrisponde alla regione selezionata
function isRegioneCorretto(regione, comune) {
    return comune.regione.nome == regione.value;
}

// Ritorna un array con i nomi dei comuni di una provincia
function cercaComuni(provincia) {
    let comuniOutput = [];
    for (let i = 0; i < comuni.length; i++) {
        if (isComuneCorretto(provincia, comuni[i])) {
            comuniOutput.push(comuni[i].nome);
        }
    }
    return rimuoviDuplicati(comuniOutput);
}

// Confronta se la provincia del comune corrisponde alla provincia selezionata
function isComuneCorretto(provincia, comune) {
    return comune.provincia.nome == provincia;
}

// Rimuove duplicati e ordina l'array
function rimuoviDuplicati(arr) {
    return [...new Set(arr)].sort();
}

// Crea un bottone e lo aggiunge al parent
function creaBottone(id, text, parent) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    parent.appendChild(btn);
    return btn;
}

// Crea un'option e la aggiunge al parent
function creaOption(valore, text, parent) {
    const option = document.createElement("option");
    option.value = valore;
    option.textContent = text;
    parent.appendChild(option);
    return option;
}

// Inizializza la mappa Leaflet centrata sull'Italia
function inizializzaMappa() {
    mappa = L.map('map').setView([42.5, 12.5], 6);
   
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(mappa);
   
    layerMarkers.addTo(mappa);
}

document.addEventListener("DOMContentLoaded", inizializzaMappa);

// Mostra i comuni sulla mappa con marker
async function mostraComuniSuMappa(comuniProvincia) {
    layerMarkers.clearLayers();
   
    const bounds = [];
   
    for (const comune of comuniProvincia) {
        try {
            const coords = await ottieniCoordinate(comune.nome, comune.provincia.nome, comune.regione.nome);
           
            if (coords) {
                const marker = L.marker([coords.lat, coords.lng]);
                const popupContent = await creaContenutoPopup(comune, coords);
                marker.bindPopup(popupContent);
                layerMarkers.addLayer(marker);
                bounds.push([coords.lat, coords.lng]);
            }
        } catch (error) {
            console.error(`Errore nel caricamento del comune ${comune.nome}:`, error);
        }
    }
   
    if (bounds.length > 0) {
        mappa.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Ottiene le coordinate di un comune tramite l'API di Open-Meteo
async function ottieniCoordinate(nomeComune, provincia, regione) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeComune)}&count=5&language=it&format=json&countryCode=IT`;
   
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Errore HTTP! Status: ${response.status}`);
        }
        
        const data = await response.json();
       
        if (data.results && data.results.length > 0) {
            const risultatoCorretto = data.results.find(r =>
                r.admin2 === provincia && r.admin1 === regione
            );
           
            if (risultatoCorretto) {
                return {
                    lat: risultatoCorretto.latitude,
                    lng: risultatoCorretto.longitude
                };
            }
           
            return {
                lat: data.results[0].latitude,
                lng: data.results[0].longitude
            };
        }
    } catch (error) {
        console.error(`Errore geocoding per ${nomeComune}:`, error);
        throw error;
    }
   
    return null;
}

// Crea il contenuto HTML del popup per un marker
async function creaContenutoPopup(comune, coords) {
    let html = `
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 10px 0;">${comune.nome}</h3>
            <p style="margin: 5px 0;"><strong>Provincia:</strong> ${comune.provincia.nome}</p>
            <p style="margin: 5px 0;"><strong>Regione:</strong> ${comune.regione.nome}</p>
    `;
   
    try {
        const meteo = await ottieniMeteoAttuale(coords.lat, coords.lng);
        if (meteo) {
            html += `
                <hr style="margin: 10px 0;">
                <p style="margin: 5px 0;"><strong>🌡️ Temperatura:</strong> ${meteo.temperatura}°C (p. ${meteo.temperaturaPercepita}°C)</p>
                <p style="margin: 5px 0;"><strong>💨 Vento:</strong> ${meteo.vento} km/h (dir. ${meteo.dirVento}°)</p>
                <p style="margin: 5px 0;"><strong>🌧️ Precipitazioni:</strong> ${meteo.precipitazioni} mm (${meteo.probPrecipitazioni}%)</p>
            `;
        }
    } catch (error) {
        console.error("Errore caricamento meteo:", error);
        html += `
            <hr style="margin: 10px 0;">
            <p style="margin: 5px 0; color: red;"><em>Errore caricamento meteo</em></p>
        `;
    }
   
    html += `
            <hr style="margin: 10px 0;">
            <a href="dettaglio.html?nome=${encodeURIComponent(comune.nome)}&lat=${coords.lat}&lon=${coords.lng}"
               style="display: inline-block; padding: 8px 16px; background-color: #007bff; color: white;
                      text-decoration: none; border-radius: 4px; margin-top: 10px;">
                📊 Vai al dettaglio meteo
            </a>
        </div>
    `;
   
    return html;
}

// Ottiene i dati meteo attuali per una posizione
async function ottieniMeteoAttuale(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`;
   
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Errore HTTP! Status: ${response.status}`);
        }
        
        const data = await response.json();
       
        if (data.current && data.daily) {
            return {
                temperatura: data.current.temperature_2m,
                temperaturaPercepita: data.current.apparent_temperature,
                umidita: data.current.relative_humidity_2m,
                vento: data.current.wind_speed_10m,
                dirVento: data.current.wind_direction_10m,
                temperaturaMinima: data.daily.temperature_2m_min,
                temperaturaMassima: data.daily.temperature_2m_max,
                precipitazioni: data.current.precipitation || 0,
                probPrecipitazioni: max(data.daily.precipitation_probability_max)
            };
        }
    } catch (error) {
        console.error("Errore API meteo:", error);
        throw error;
    }
   
    return null;
}

// Trova il massimo di un array
function max(arr) {
    if (arr.length == 0) return 0;
    let massimo = -1;
    for (let i = 0; i < arr.length; i++) {
        if (massimo < arr[i]) massimo = arr[i];
    }
    return massimo;
}

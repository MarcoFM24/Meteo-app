/*
ALL RIGHTS RESERVED.
Authors: Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
Property: ITI F.Severi Padova && Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
*/

let comuni = []
let mappa; // Oggetto mappa Leaflet
let layerMarkers = L.layerGroup(); // Layer group per gestire i marker
const regione = document.getElementById("regioni");
const message = document.getElementById("message");

function caricaComuni() {
    const output = document.getElementById("selezionaRegione");
    const URL_COMUNI = 
        "https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";

    message.textContent = "Caricamento delle regioni in corso...";
    message.style.color = "black";

    fetch(URL_COMUNI)
        .then(response => {
            // ✅ PUNTO 4: Gestione errori migliorata
            if (!response.ok) {
                throw new Error(`Errore HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(comuniArray => {
            comuni = comuniArray;
            console.log(comuni);
            message.textContent = "Caricamento delle regioni completato con successo!";
            message.style.color = "green";
        })
        .catch(err => {
            message.textContent = "Errore nel caricamento delle regioni.\n" + err.message;
            message.style.color = "red";
            console.error("Errore dettagliato:", err);
        });
}
document.addEventListener("DOMContentLoaded", caricaComuni);

const btnProvincie = document.getElementById("cercaRegione");

// Dopo aver selezionato la regione si preme questo bottone, e crea il fieldset delle provincie
btnProvincie.addEventListener("click", menuProvince);    
function menuProvince (){

    let provinciaFieldset = document.getElementById("province");
    if(provinciaFieldset != null){
        provinciaFieldset.remove(provinciaFieldset)
    }
    let comuneFieldset = document.getElementById("comuni");
    if(comuneFieldset != null){
        comuneFieldset.remove(comuneFieldset)
    }

    const regione = document.getElementById("regioni");
    const output = document.getElementById("selezionaRegione");
    message.textContent = "Caricamento delle province in corso...";
    message.style.color = "black";
    
    if(regione.value == "Non selezionato"){
        message.textContent = "Seleziona una regione!";
        message.style.color = "red";
    }
    else{
        //------------ Ottengo un array di provincie ------------
        let provinceOutput = null
        provinceOutput = cercaProvince(regione);

        //------------ Creo il fieldset con la legend ------------
        provinciaFieldset = document.createElement("fieldset");
        provinciaFieldset.id = "province"
        provinciaLegend = document.createElement("legend");
        provinciaLegend.innerHTML = "Provincia";
        output.appendChild(provinciaFieldset)
        provinciaFieldset.appendChild(provinciaLegend);

        //------------Creo il select------------
        provinciaSelect = document.createElement("select");
        provinciaSelect.id = "selectProvince";
        provinciaFieldset.appendChild(provinciaSelect);

        //------------inserisco le option------------
        //Creo la option per il non selezionato
        creaOption("Non selezionato", "Seleziona una Provincia", provinciaSelect)

        //Itero per inserire le provincie nel select
        for(let i = 0; i < provinceOutput.length; i++){
            creaOption(provinceOutput[i], provinceOutput[i], provinciaSelect)
        }

        const btnComuni = creaBottone("cercaComuni", "Mostra Comuni sulla Mappa", provinciaFieldset);
        btnComuni.addEventListener("click", function() {
            menuComuni();
            mostraTuttiComuniProvincia();
        });

        message.textContent = "Province caricate con successo!";
        message.style.color = "green";
    }
}

//Ritorna un array con i nomi delle province
function cercaProvince(regione){
    let provinceOutput = [];
    for(let i = 0; i < comuni.length; i++){
        if(isRegioneCorretto(regione, comuni[i])){
            provinceOutput.push(comuni[i].provincia.nome);
        }
    }
    return rimuoviDuplicati(provinceOutput);
}

function menuComuni(){
    // Dopo aver selezionato la regione si preme questo bottone, e crea il fieldset delle provincie
    const provincia = document.getElementById("selectProvince");
    const output = document.getElementById("selezionaRegione");
    message.textContent = "Caricamento dei comuni in corso...";
    message.style.color = "black";
    if(provincia.value == "Non selezionato"){
        message.textContent = "Seleziona un comune!";
        message.style.color = "red";
    }
    else{
        let comuneFieldset = document.getElementById("comuni");
        if(comuneFieldset != null){
            comuneFieldset.remove(comuneFieldset)
        }
        //------------ Ottengo un array di comuni ------------
        let comuniOutput = null
        comuniOutput = cercaComuni(provincia.value);
        //------------ Creo il fieldset con la legend ------------
        comuneFieldset = document.createElement("fieldset");
        comuneFieldset.id = "comuni"
        comuneLegend = document.createElement("legend");
        comuneLegend.innerHTML = "Comune";
        output.appendChild(comuneFieldset)
        comuneFieldset.appendChild(comuneLegend);

        //------------Creo il select------------
        comuneSelect = document.createElement("select");
        comuneSelect.id = "selectComuni";
        comuneFieldset.appendChild(comuneSelect);

        //------------inserisco le option------------
        //Creo il select per il non selezionato
        creaOption("Non selezionato", "Seleziona un Comune", comuneSelect);
        //Itero per inserire i comuni nel select
        for(let i = 0; i < comuniOutput.length; i++){
            creaOption(comuniOutput[i], comuniOutput[i], comuneSelect);
        }

        // Collegamento del bottone cercaMeteo per mostrare solo il comune selezionato
        const btnMeteo = creaBottone("cercaMeteo", "Centra Comune sulla Mappa", comuneFieldset);
        btnMeteo.addEventListener("click", mostraComuneSelezionato);

        message.textContent = "Comuni caricati con successo!";
        message.style.color = "green";
    }
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
    
    // Filtra i comuni della provincia selezionata
    const comuniProvincia = comuni.filter(c => c.provincia.nome === provincia.value);
    
    if (comuniProvincia.length === 0) {
        message.textContent = "Nessun comune trovato per questa provincia!";
        message.style.color = "red";
        return;
    }
    
    // Mostra i comuni sulla mappa
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
    
    // Trova il comune selezionato nell'array
    const comuneSelezionato = comuni.find(c => 
        c.nome === comuneSelect.value && c.provincia.nome === provincia.value
    );
    
    if (!comuneSelezionato) {
        message.textContent = "Comune non trovato!";
        message.style.color = "red";
        return;
    }
    
    // Mostra solo questo comune sulla mappa (passando un array con un solo elemento)
    await mostraComuniSuMappa([comuneSelezionato]);
    
    message.textContent = `Mappa centrata su ${comuneSelect.value}!`;
    message.style.color = "green";
}

//Confronta se la regione selezionata dall'array dei comuni è uguale alla regione selezionata dal select
function isRegioneCorretto(regione, comune){
    return comune.regione.nome == regione.value;
}

//Ritorna un array con i nomi dei comuni di una provincia
function cercaComuni(province){
    comuniOutput = [];
    for(let i = 0; i < comuni.length; i++){
        if(isComuneCorretto(province, comuni[i])){
            comuniOutput.push(comuni[i].nome);
        }
    }
    return rimuoviDuplicati(comuniOutput);
}

//Confronta se la provincia selezionata dall'array dei comuni è uguale alla provincia selezionata dal select
function isComuneCorretto(province, comune){
    return comune.provincia.nome == province;
}

// ✅ PUNTO 7: Ottimizzazione con Set
function rimuoviDuplicati(arr){
    return [...new Set(arr)].sort();
}

function creaBottone(id, text, parent){
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    parent.appendChild(btn);
    return btn;
}

function creaOption(valore, text, parent){
    const option = document.createElement("option");
    option.value = valore;
    option.textContent = text;
    parent.appendChild(option);
    return option;
}

/* RISPOSTA DA API GEOCODING - STRUTTURA DEL JSON
[
    {
        "id":3171728,
        "name":"Padova",
        "latitude":45.40797,
        "longitude":11.88586,
        "elevation":12.0,
        "feature_code":"PPLA2",
        "country_code":"IT",
        "admin1_id":3164604,
        "admin2_id":3171727,
        "admin3_id":6542281,
        "timezone":"Europe/Rome",
        "population":203725,
        "country_id":3175395,
        "country":"Italia",
        "admin1":"Veneto",
        "admin2":"Padova",
        "admin3":"Padova"
    }
],
"generationtime_ms":0.41544437
}
*/

/*
https://api.openmeteo.com/v1/forecast?latitude=45.4064&longitude=11.8768&current=temperature_2m,
wind_speed_10m&timezone=auto
Analisi:
https://api.openmeteo.com/v1/forecast - sito di richiesta api
? - passo parametri
latitude=45.4064 - parametro con nome latitude e valore 45.4064
& - chiave di concatenazione
longitude=11.8768 - vedi latitude
& - chiave di concatenazione
current=temperature_2m,wind_speed_10m parametro con nome current e più valori intervallati da virgola
IMPORTANTE sono i parametri dove si aspetta una risposta
& - chiave di concatenazione
timezone=auto - serve passare per il timezone che indicherà l'orario inserito nella risposta

NON PRESENTE - SOSTITUISCE CURRENT
daily=temperature_2m,wind_speed_10m - parametro con nome daily, indica la richiesta di dati giornalieri e non attuali

TUTTI I PARAMETRI A CUI E' OPPORTUNO FARE LA CHIAMATA:
temperature_2m - Air temperature at 2 meters above ground
relative_humidity_2m - Relative humidity at 2 meters above ground
apparent_temperature - Apparent temperature is the perceived feels-like temperature combining wind chill factor, relative humidity and solar radiation
wind_speed_10m - Wind speed at 10 meters above ground.
wind_direction_10m - Wind direction at 10 meters above ground.
rain - Rain from large scale weather systems of the preceding hour in millimeter

current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m
&
daily=temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max
*/

/**
 * Inizializza la mappa Leaflet
 */
function inizializzaMappa() {
    // Crea la mappa centrata sull'Italia
    mappa = L.map('map').setView([42.5, 12.5], 6);
   
    // Aggiungi il tile layer di OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(mappa);
   
    // Aggiungi il layer group dei marker alla mappa
    layerMarkers.addTo(mappa);
}

document.addEventListener("DOMContentLoaded", inizializzaMappa);

/**
 * Mostra i comuni sulla mappa con marker
 * @param {Array} comuniProvincia - Array di comuni da mostrare
 */
async function mostraComuniSuMappa(comuniProvincia) {
    // Rimuovi i marker precedenti
    layerMarkers.clearLayers();
   
    const bounds = []; // Array per calcolare i bounds della mappa
   
    // Per ogni comune, ottieni le coordinate e crea un marker
    for (const comune of comuniProvincia) {
        try {
            // Ottieni coordinate dal geocoding API
            const coords = await ottieniCoordinate(comune.nome, comune.provincia.nome, comune.regione.nome);
           
            if (coords) {
                // Crea il marker
                const marker = L.marker([coords.lat, coords.lng]);
               
                // Crea il contenuto del popup
                const popupContent = await creaContenutoPopup(comune, coords);
               
                marker.bindPopup(popupContent);
               
                // Aggiungi il marker al layer group
                layerMarkers.addLayer(marker);
               
                // Aggiungi le coordinate ai bounds
                bounds.push([coords.lat, coords.lng]);
            }
        } catch (error) {
            console.error(`Errore nel caricamento del comune ${comune.nome}:`, error);
        }
    }
   
    // Adatta la vista della mappa per mostrare tutti i marker
    if (bounds.length > 0) {
        mappa.fitBounds(bounds, { padding: [50, 50] });
    }
}

/**
 * Ottiene le coordinate di un comune tramite l'API Geocoding di Open-Meteo
 * @param {string} nomeComune - Nome del comune
 * @param {string} provincia - Nome della provincia
 * @param {string} regione - Nome della regione
 * @returns {Object} Oggetto con lat e lng
 */
async function ottieniCoordinate(nomeComune, provincia, regione) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeComune)}&count=5&language=it&format=json&countryCode=IT`;
   
    try {
        const response = await fetch(url);
        
        // ✅ PUNTO 4: Gestione errori migliorata
        if (!response.ok) {
            throw new Error(`Errore HTTP! Status: ${response.status}`);
        }
        
        const data = await response.json();
       
        if (data.results && data.results.length > 0) {
            // Cerca il risultato che corrisponde alla provincia e regione corrette
            const risultatoCorretto = data.results.find(r =>
                r.admin2 === provincia && r.admin1 === regione
            );
           
            if (risultatoCorretto) {
                return {
                    lat: risultatoCorretto.latitude,
                    lng: risultatoCorretto.longitude
                };
            }
           
            // Se non trova corrispondenza esatta, usa il primo risultato
            return {
                lat: data.results[0].latitude,
                lng: data.results[0].longitude
            };
        }
    } catch (error) {
        console.error(`Errore geocoding per ${nomeComune}:`, error);
        throw error; // Propaga l'errore per gestirlo nel chiamante
    }
   
    return null;
}

/**
 * Crea il contenuto HTML del popup per un marker
 * @param {Object} comune - Oggetto comune
 * @param {Object} coords - Coordinate {lat, lng}
 * @returns {string} HTML del popup
 */
async function creaContenutoPopup(comune, coords) {
    let html = `
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 10px 0;">${comune.nome}</h3>
            <p style="margin: 5px 0;"><strong>Provincia:</strong> ${comune.provincia.nome}</p>
            <p style="margin: 5px 0;"><strong>Regione:</strong> ${comune.regione.nome}</p>
    `;
   
    // Ottieni meteo attuale
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
   
    // Link alla pagina di dettaglio
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

/**
 * Ottiene i dati meteo attuali per una posizione
 * @param {number} lat - Latitudine
 * @param {number} lng - Longitudine
 * @returns {Object} Dati meteo
 */
async function ottieniMeteoAttuale(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`;
   
    try {
        const response = await fetch(url);
        
        // ✅ PUNTO 4: Gestione errori migliorata
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
                precipitazioni: sum(data.daily.precipitation_sum),
                probPrecipitazioni: max(data.daily.precipitation_probability_max)
            };
        }
    } catch (error) {
        console.error("Errore API meteo:", error);
        throw error; // Propaga l'errore
    }
   
    return null;
}

function sum(arr){
    let somma = 0;
    if(arr.length == 0) return 0;
    for(let i = 0; i < arr.length; i++){
        somma += arr[i];
    }
    
    return somma;
}

function max(arr){
    if(arr.length == 0) return 0;
    let massimo = -1;
    for(let i = 0; i < arr.length; i++){
        if(massimo < arr[i]) massimo = arr[i];
    }
    return massimo;
}

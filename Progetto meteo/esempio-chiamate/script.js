/* ============================================================================
   ESEMPIO DI FETCH API IN JAVASCRIPT
   - Alla pressione del primo pulsante viene caricata la lista dei comuni italiani.
   - Alla pressione del secondo pulsante viene visualizzato il meteo per Padova.
============================================================================ */

/* 
   Selezioniamo l'elemento <pre> dove stamperemo i risultati.
   Uso di getElementById: selettore base del DOM.
*/
const output = document.getElementById("output");


/* ============================================================================
   1) FUNZIONE: caricaComuni()
   ----------------------------------------------------------------------------
   Scarica il file dei comuni italiani da GitHub usando fetch().
   Il link punta al file JSON pubblico, non serve alcuna API key.
============================================================================ */
function caricaComuni() {

    // URL del file JSON esterno (raw GitHub)
    const URL_COMUNI = 
        "https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";

    output.textContent = "Caricamento dei comuni in corso...";

    /* 
       fetch(url) restituisce una Promise.
       response.json() serve per convertire i dati scaricati dal formato JSON
       ad un oggetto JavaScript (array di comuni).
    */
    fetch(URL_COMUNI)
        .then(response => response.json())
        .then(comuni => {
            output.textContent = 
                  "Numero totale di comuni: " + comuni.length +"\n"+"Apri la console per vederli tutti. "+"\n\n"
                + "Primi 5 comuni:\n"
                + comuni.slice(0, 5).map(c => "- " + c.nome).join("\n");
                console.log("Array dei comuni italiani")
                console.log(comuni)
        })
        .catch(err => {
            output.textContent = "Errore nel caricamento dei comuni.\n" + err;
        });
       
}



/* ============================================================================
   2) FUNZIONE: caricaMeteoPadova()
   ----------------------------------------------------------------------------
   Chiama l'API Open-Meteo per ottenere la temperatura e il vento di Padova.
   Non richiede chiavi, è totalmente gratuita.
============================================================================ */
function caricaMeteoPadova() {

    const lat = 45.4064;   // latitudine Padova
    const lon = 11.8768;   // longitudine Padova

    const URL_METEO = "https://api.open-meteo.com/v1/forecast?" +
        `latitude=${lat}&longitude=${lon}` +
        "&current=temperature_2m,wind_speed_10m&timezone=auto";

    output.textContent = "Caricamento meteo di Padova...";

    fetch(URL_METEO)
        .then(response => response.json())
        .then(dati => {
            const meteo = dati.current;

            console.log("Oggetto con dati meteo per Padova")
            console.log(meteo)

            output.textContent =
                "Meteo attuale a Padova:\n\n" +
                "Temperatura: " + meteo.temperature_2m + " °C\n" +
                "Vento: " + meteo.wind_speed_10m + " km/h\n" +
                "Orario rilevazione: " + meteo.time;
        })
        .catch(err => {
            output.textContent = "Errore nella chiamata meteo.\n" + err;
        });
        
}


/* ============================================================================
   3) COLLEGAMENTO PULSANTI → FUNZIONI
   ----------------------------------------------------------------------------
   Alla pressione dei pulsanti vengono chiamate le funzioni sopra definite.
============================================================================ */

document.getElementById("btnComuni")
        .addEventListener("click", caricaComuni);

document.getElementById("btnMeteo")
        .addEventListener("click", caricaMeteoPadova);

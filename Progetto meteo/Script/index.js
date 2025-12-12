/*
ALL RIGHTS RESERVED.
Authors: Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
Property: ITI F.Severi Padova && Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
*/

const output = document.getElementById("");

function caricaComuni() {

    const URL_COMUNI = 
        "https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";

    output.textContent = "Caricamento dei comuni in corso...";
    setTimeout(2000);
    const regione = document.getElementById("");

    fetch(URL_COMUNI)
        .then(response => {
            console.log(response)
            response.json()})
        .then(comuni => {
            // TODO select dei comuni

        })
        .catch(err => {
            output.textContent = "Errore nel caricamento dei comuni.\n" + err;
        });
       
}


function cercaProvince(regione, comuni){
    provinceOutput = [];
    comuni.forEach(element => {
        if(isComuneCorretto(regione, element)){
            provinceOutput.push(element);
        }
    });
    return provinceOutput;
}

function isComuneCorretto(regione, comune){
    return comune.regione.nome == regione;
}

function cercaComuni(province, comuni){
    comuniOutput = [];
    comuni.forEach(element => {
        if(isComuneCorretto(province, element)){
            comuniOutput.push(element);
        }
    });
    return comuniOutput;
}

function isComuneCorretto(province, comune){
    return comune.province.nome == province;
}

function rimuoviDuplicati(arr){
    var arr2 = [];
    for(i = 0; i < arr.length; i++){
        if(!arr2.contains(arr[i])){
            arr2.push(arr[i])
        }
    }
    return arr2;
}

/*

numElementi = 0;
const nota = document.getElementById("nota");
const btn = document.getElementById("aggiungiNota");
btn.addEventListener("click", aggiungiNota());

function aggiungiNota(){
    var elencoNote = document.getElementById("elencoNote");
    var newNode = document.createElement("div");
    newNode.className = "nota";
    newNode.innerText = nota.value.trim();
    elencoNote.appendChild(newNode);
    newNode.addEventListener("click", function(){
        newNode.style.backgroundColor = "green";
    });
    newNode.addEventListener("click", function(){
        elencoNote.removeChild(newNode);
    });
    numElementi += 1;
    nota.value = "";
}

*/

/*
ALL RIGHTS RESERVED.
Authors: Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
Property: ITI F.Severi Padova && Marco Ferraresso, Federico Chen, Gabriel Bogdan Radu
*/



let comuni = []
const regione = document.getElementById("regioni");

function caricaComuni() {
    const output = document.getElementById("selezionaRegione");
    const URL_COMUNI = 
        "https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";

    output.p.textContent = "Caricamento delle regioni in corso...";
    setTimeout(2000);

    fetch(URL_COMUNI)
        .then(response => {
            console.log(response);
            response.json();
        })
        .then(comuni => {
            // TODO select dei comuni
            this.comuni = comuni;
            output.p.textContent = "Caricamento delle regioni completato con successo!";
        })
        .catch(err => {
            output.p.textContent = "Errore nel caricamento delle regioni.\n" + err;
        });
}
document.addEventListener("DOMContentLoaded", caricaComuni);


const btnProvincie = document.getElementById("cercaRegione");
btnProvincie.addEventListener("click", function (){
    const regione = document.getElementById("regioni");
    const output = document.getElementById("selezionaRegione");
    output.p.textContent = "Caricamento delle provincie in corso...";
    setTimeout(2000);
    
    if(regione.value == "Non selezionato"){
        output.p.textContent = "Seleziona una regione!";
    }
    else{
        provinceOutput = cercaProvince(regione);
        provinciaFieldset = document.createElement("fieldset");
        provinciaLegend = document.createElement("legend");
        provinciaLegend.innerHTML = "Provincia";
        provinciaLegend.appendChild(provinciaFieldset)
        provinciaSelect = document.createElement("select");
        provinciaSelect.appendChild(provinciaFieldset)
        provinciaSelect.id = "selectProvincie";
        for(i = 0; i < provinceOutput.length; i++){
            provincia = document.createElement("option");
            provincia.value = provinceOutput[i].provincia.nome;
            provincia.appendChild(provinciaSelect)
        }
    }
})
function cercaProvince(regione){
    provinceOutput = [];
    comuni.forEach(element => {
        if(isRegioneCorretto(regione, element)){
            provinceOutput.push(element);
        }
    });
    return provinceOutput;
}

function isRegioneCorretto(regione, comune){
    return comune.regione.nome == regione.value;
}

function cercaComuni(province){
    comuniOutput = [];
    comuni.forEach(element => {
        if(isComuneCorretto(province, element)){
            comuniOutput.push(element);
        }
    });
    return comuniOutput;
}

function isComuneCorretto(province, comune){
    return comune.provincia.nome == province;
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

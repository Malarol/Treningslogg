// -------- SETUP--------
async function authenticate() { //Sjekker om det eksisterer ein session
    const response = await fetch("api/session");

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const bruker = await response.json();
    document.getElementById("Navn").innerText = "Velkommen " + bruker.brukernavn;
}

authenticate();

async function finn_oekt_id() { //Leter etter den pågående økta, og returnerer id'en til den økta
    let response = await fetch("/api/oekt");
    let data = await response.json();

    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        if (element.paagaaende === "ja") {
            return element.oekt_id;
        }
    }
}

async function eksisterer_økt() { // Når nettsida blir lasta inn på nytt igjen, fyller ut den pågående økten som ikkje er avslutta
    oekt_id = await finn_oekt_id();

    if (oekt_id !== null) {
        let response = await fetch("/api/oekt/" + oekt_id);
        let data = await response.json();

        for (let i = 0; i < data.length; i++) {
            let element = data[i];

            let ovelse = element.ovelse_navn;
            let set_nr = element.set_nr;
            let vekt = element.vekt;
            let reps = element.reps;
            let rir = element.rir;

            const setUtskrift = document.getElementById("setUtskrift");

            let set_info = document.createElement("div");
            set_info.classList.add("set");

            let ovelse_navn_i_økt = document.createElement("p");
            ovelse_navn_i_økt.innerText = "Øvelse: " + ovelse;
            set_info.appendChild(ovelse_navn_i_økt);

            let set_nr_i_økt = document.createElement("p");
            set_nr_i_økt.innerText = "Set-nr: " + set_nr;
            set_info.appendChild(set_nr_i_økt);

            let vekt_i_økt = document.createElement("p");
            vekt_i_økt.innerText = "Vekt: " + vekt + "Kg";
            set_info.appendChild(vekt_i_økt);

            let reps_i_økt = document.createElement("p");
            reps_i_økt.innerText = "Reps: " + reps;
            set_info.appendChild(reps_i_økt);

            let rir_i_økt = document.createElement("p");
            rir_i_økt.innerText = "Rir: " + rir;
            set_info.appendChild(rir_i_økt);

            setUtskrift.appendChild(set_info);

            fullfør_knapp.classList.remove("hidden");
            fullfør_knapp.classList.add("visible");

            setForm.classList.remove("hidden");
            setForm.classList.add("visible");
        }
    }
}

eksisterer_økt();

async function full_ut_tidlegare_økter() { //Fyller ut dato og type om 3 nylegaste øktane
    let response = await fetch("/api/oekt");
    let data = await response.json();

    let antall = Math.min(data.length, 3); // Finner lengden på data.length, men returnerer maks 3 
    let j = 1; // teller, for å finne id til de ulike utskriftene i html

    for (let i = data.length - 1; i >= data.length - antall; i--) {  //Reverse for løkke som finner dei 3(eller mindre) nylegaste øktene
        let element = data[i];

        let okt = document.getElementById("utskrift" + j);

        let dato = element.dato;
        let type = element.oekt_type;

        let dato_i_tabell = document.createElement("p");
        dato_i_tabell.innerText = "Dato: " + dato;
        okt.appendChild(dato_i_tabell);

        let type_i_tabell = document.createElement("p");
        type_i_tabell.innerText = "Type: " + type;
        okt.appendChild(type_i_tabell);

        j += 1;
    }
}

full_ut_tidlegare_økter();

async function full_ut_øvelser() { //Finner øvelser fra databasen og fyll dei ut i ein dropdown
    const øvelser = document.getElementById("øvelseSet");
    øvelser.innerHTML = "";

    let response = await fetch("/api/ovelser");
    let data = await response.json();

    for (let i = 0; i < data.length; i++) {
        let ovelse = data[i];

        let option = document.createElement("option");
        option.value = ovelse.ovelse_navn;
        option.textContent = ovelse.ovelse_navn;

        øvelser.appendChild(option);
    }
}

full_ut_øvelser();

// --------SETUP--------

// --------HOVEDDEL (FORMS OG KNAPPER)--------

let start_oekt_knapp = document.getElementById("oektKnapp");
let oektForm = document.getElementById("oektForm");
let setForm = document.getElementById("setForm");

start_oekt_knapp.addEventListener("click", function() { //Start økt knapp opner formen som trengs for å starte økten
    oektForm.classList.remove("hidden");
    oektForm.classList.add("visible");
});

oektForm.addEventListener("submit", async function(event) { //Informasjon om økten, altså dato og økt type
    event.preventDefault();
    let dato = document.getElementById("date").value;
    let oekt_type = document.getElementById("oektType").value;

    const response = await fetch("/api/ny_oekt", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({ dato, oekt_type })
    });
    if (!response.ok) {
        console.error("Klarte ikkje å registrere økten");
        return;
    }
    if (response.ok) {
        console.log("Økt registrert");
        setForm.classList.remove("hidden");
        setForm.classList.add("visible");

        oektForm.classList.remove("visible");
        oektForm.classList.add("hidden");

        fullfør_knapp.classList.remove("hidden");
        fullfør_knapp.classList.add("visible");
    }
});

setForm.addEventListener("submit", async function(event) { //Legger til eit nytt sett i økta og fyller det ut i pågående økt vindu
    event.preventDefault();
    let ovelse_navn = document.getElementById("øvelseSet").value;
    let set_nr = document.getElementById("set-nr").value;
    let vekt = document.getElementById("vekt").value;
    let reps = document.getElementById("reps").value;
    let rir = document.getElementById("rir").value;

    oekt_id = await finn_oekt_id();
    console.log(oekt_id);

    let response = await fetch("/api/sett_log", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({ set_nr, vekt, reps, ovelse_navn, oekt_id, rir })
    });
    if (!response.ok) {
        console.error("Klarte ikkje å registrere økten");
        return;
    }

    const setUtskrift = document.getElementById("setUtskrift");

    let set_info = document.createElement("div");
    set_info.classList.add("set");

    let ovelse_navn_i_økt = document.createElement("div");
    ovelse_navn_i_økt.innerText = "Øvelse: " + ovelse_navn;
    set_info.appendChild(ovelse_navn_i_økt);

    let set_nr_i_økt = document.createElement("div");
    set_nr_i_økt.innerText = "Set-nr: " + set_nr;
    set_info.appendChild(set_nr_i_økt);

    let vekt_i_økt = document.createElement("div");
    vekt_i_økt.innerText = "Vekt: " + vekt + "Kg";
    set_info.appendChild(vekt_i_økt);

    let reps_i_økt = document.createElement("div");
    reps_i_økt.innerText = "Reps: " + reps;
    set_info.appendChild(reps_i_økt);

    let rir_i_økt = document.createElement("div");
    rir_i_økt.innerText = "Rir: " + rir;
    set_info.appendChild(rir_i_økt);

    setUtskrift.appendChild(set_info);
});

let vis_ovelse_form = document.getElementById("ovelseKnapp");
const ovelseform = document.getElementById("ovelseForm");

vis_ovelse_form.addEventListener("click", function() { //Synleggjer form som trengs for å legge til nye øvelser
    ovelseform.classList.remove("hidden");
    ovelseform.classList.add("visible");
});

ovelseform.addEventListener("submit", async function(event) {  //Legger til nye øvelser
    event.preventDefault();

    let ovelse_navn = document.getElementById("name").value;
    let muskel = document.getElementById("muskel").value;

    let response = await fetch("/api/registrer_ovelse", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ ovelse_navn, muskel })
    });
    if (!response.ok) {
        console.error("Klarte ikkje å registrere øvelse");
        return;
    }

    const data = await response.json();
    console.log("Øvelse lagret:", data);

    full_ut_øvelser(); //Fyller ut øvelsen i dropdown

    ovelseform.classList.remove("visible");
    ovelseform.classList.add("hidden");
});

// --------HOVEDDEL (FORMS OG KNAPPER)--------

// --------AVSLUTTING--------

const fullfør_knapp = document.getElementById("fullfør_økt");

fullfør_knapp.addEventListener("click", async function() { //Finner økt ide'en til pågående økt og endrer pågående fra ja til nei
    let oekt_id = await finn_oekt_id();

    let response = await fetch("/api/avslutt_oekt", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({ oekt_id })
    });

    if (!response.ok) {
        console.error("Klarte ikkje å registrere økten");
        return;
    }

    const setUtskrift = document.getElementById("setUtskrift");

    setUtskrift.innerHTML = "";

    setForm.classList.remove("visible");
    setForm.classList.add("hidden");

    oektForm.classList.remove("visible");
    oektForm.classList.add("hidden");

    fullfør_knapp.classList.remove("visible");
    fullfør_knapp.classList.add("hidden");
});

const logut_knapp = document.getElementById("logout");

logut_knapp.addEventListener("click", async function(event) { //Logger ut av nettsida, fjerner cookien
    event.preventDefault();

    const response = await fetch("/api/logout", {
        method: "POST"
    });

    if (response.ok) {
        window.location.href = "login.html";
    }
});

//--------AVSLUTTING--------

async function authenticate() {
    const response = await fetch("api/session");

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const bruker = await response.json();
      document.getElementById("Navn").innerText = "Velkommen " + bruker.brukernavn;
}

authenticate();

async function eksisterer_økt() {
    oekt_id = await finn_oekt_id();

    if (oekt_id !== null) {
        let response = await fetch("/api/oekt/" + oekt_id)
        let data =  await response.json()

        for (let i = 0; i < data.length; i++) {
            let element = data[i]

            let ovelse = element.ovelse_navn
            let set_nr = element.set_nr
            let vekt = element.vekt
            let reps = element.reps
            let rir = element.rir

            let set_info = document.createElement("div")
            set_info.classList.add("set")

            let ovelse_navn_i_økt = document.createElement("div")
            ovelse_navn_i_økt.innerText = "Øvelse: " + ovelse
            set_info.appendChild(ovelse_navn_i_økt)

            let set_nr_i_økt = document.createElement("div")
            set_nr_i_økt.innerText = "Set-nr: " + set_nr
            set_info.appendChild(set_nr_i_økt)

            let vekt_i_økt = document.createElement("div")
            vekt_i_økt.innerText = "Vekt: " + vekt + "Kg"
            set_info.appendChild(vekt_i_økt)

            let reps_i_økt = document.createElement("div")
            reps_i_økt.innerText = "Reps: " + reps
            set_info.appendChild(reps_i_økt)

            let rir_i_økt = document.createElement("div")
            rir_i_økt.innerText = "Rir: " + rir
            set_info.appendChild(rir_i_økt)

            setUtskrift.appendChild(set_info)

            fullfør_knapp.classList.remove("hidden")
            fullfør_knapp.classList.add("visible")


        }
    }
}

eksisterer_økt();

async function full_ut_tidlegare_økter() {
    let response = await fetch("/api/oekt")
    let data = await response.json();

    let antall = Math.min(data.length, 3)
    let j = 1 //teller, for å finne id til de ulike utskriftene i html

    for (let i = data.length - 1; i >= data.length - antall; i--) {
        let element = data[i]

        let okt = document.getElementById("utskrift" + j)

        let dato = element.dato
        let type = element.oekt_type

        let dato_i_tabell = document.createElement("p");
        dato_i_tabell.innerText = "Dato: " + dato
        okt.appendChild(dato_i_tabell)
        
        let type_i_tabell = document.createElement("p")
        type_i_tabell.innerText = "Type: " + type
        okt.appendChild(type_i_tabell)

        j += 1
        }
    }
full_ut_tidlegare_økter()


async function full_ut_øvelser() {

    const øvelser = document.getElementById("øvelseSet");
    øvelser.innerHTML = ""
    
    let response = await fetch("/api/ovelser")
    let data = await response.json()

    for (let i = 0; i < data.length; i++) {
        let ovelse = data[i];

        let option = document.createElement("option");
        option.value = ovelse.ovelse_navn;
        option.textContent = ovelse.ovelse_navn;

        øvelser.appendChild(option);
    }
}

full_ut_øvelser();

let start_oekt_knapp = document.getElementById("oektKnapp")
let oektForm = document.getElementById("oektForm")
let setForm = document.getElementById("setForm")

start_oekt_knapp.addEventListener("click", function() {
    oektForm.classList.remove("hidden")
    oektForm.classList.add("visible")
})

oektForm.addEventListener("submit", async function(event) {
    event.preventDefault()
    let dato = document.getElementById("date").value
    let oekt_type = document.getElementById("oektType").value

    const response = await fetch("/api/ny_oekt", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({dato, oekt_type})
    })
    if (!response.ok) {
        console.error("Klarte ikkje å registrere økten")
        return
    }
    if (response.ok) {
        console.log("Økt registrert")
        setForm.classList.remove("hidden")
        setForm.classList.add("visible")

        oektForm.classList.remove("visible")
        oektForm.classList.add("hidden")

        fullfør_knapp.classList.remove("hidden")
        fullfør_knapp.classList.add("visible")
    }
})

async function finn_oekt_id() {
    let response = await fetch("/api/oekt")
    let data = await response.json();

    for (let i = 0; i<data.length; i++){
        let element = data[i]
        if (element.paagaaende === "ja") {
            return element.oekt_id
        }
    }
}

const setUtskrift = document.getElementById("setUtskrift")

let oekt_vindu = document.getElementById("pågåendeØkt")

setForm.addEventListener("submit", async function(event){
    event.preventDefault();
    let ovelse_navn = document.getElementById("øvelseSet").value;
    let set_nr = document.getElementById("set-nr").value;
    let vekt = document.getElementById("vekt").value
    let reps = document.getElementById("reps").value
    let rir = document.getElementById("rir").value

    oekt_id = await finn_oekt_id()
    console.log(oekt_id)

    let response = await fetch("/api/sett_log", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({set_nr, vekt, reps, ovelse_navn, oekt_id, rir})
    })
    if (!response.ok) {
    console.error("Klarte ikkje å registrere økten")
    return }

    let set_info = document.createElement("div")
    set_info.classList.add("set")

    let ovelse_navn_i_økt = document.createElement("div")
    ovelse_navn_i_økt.innerText = "Øvelse: " + ovelse_navn
    set_info.appendChild(ovelse_navn_i_økt)

    let set_nr_i_økt = document.createElement("div")
    set_nr_i_økt.innerText = "Set-nr: " + set_nr
    set_info.appendChild(set_nr_i_økt)

    let vekt_i_økt = document.createElement("div")
    vekt_i_økt.innerText = "Vekt: " + vekt + "Kg"
    set_info.appendChild(vekt_i_økt)

    let reps_i_økt = document.createElement("div")
    reps_i_økt.innerText = "Reps: " + reps
    set_info.appendChild(reps_i_økt)

    let rir_i_økt = document.createElement("div")
    rir_i_økt.innerText = "Rir: " + rir
    set_info.appendChild(rir_i_økt)

    setUtskrift.appendChild(set_info)

})

const fullfør_knapp = document.getElementById("fullfør_økt")

fullfør_knapp.addEventListener("click", async function() {

    let oekt_id = await finn_oekt_id()

    let response = await fetch("/api/avslutt_oekt", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({oekt_id})
    })

    if (!response.ok) {
    console.error("Klarte ikkje å registrere økten")
    return }

    setUtskrift.innerHTML = ""

    setForm.classList.remove("visible")
    setForm.classList.add("hidden")

    oektForm.classList.remove("visible")
    oektForm.classList.add("hidden")

    fullfør_knapp.classList.remove("visible")
    fullfør_knapp.classList.add("hidden")
  
})


let vis_ovelse_form = document.getElementById("ovelseKnapp")
const ovelseform = document.getElementById("ovelseForm")

vis_ovelse_form.addEventListener("click", function() {
    ovelseform.classList.remove("hidden")
    ovelseform.classList.add("visible")
})

ovelseform.addEventListener("submit", async function(event) {
    event.preventDefault()
    
    let ovelse_navn = document.getElementById("name").value;
    let muskel = document.getElementById("muskel").value;

    let response = await fetch("/api/registrer_ovelse", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ovelse_navn, muskel})
    })
    if (!response.ok) {
        console.error("Klarte ikkje å registrere øvelse")
        return
    }

    const data = await response.json()
    console.log("Øvelse lagret:", data)

    full_ut_øvelser()

    
    ovelseform.classList.remove("visible")
    ovelseform.classList.add("hidden")
})
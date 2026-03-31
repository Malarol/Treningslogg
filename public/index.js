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

okt1 = document.getElementById("utskrift1")
okt2 = document.getElementById("utskrift1")
okt3 = document.getElementById("utskrift1")

async function get_oekt() {
    const response = await fetch("api/oekt")
    data = await response.json()

    let counter = 0;

    for (let i = 0; i < data.length; i++)

        while (counter <= 3) {

            if (data[i].paagaaende === "nei") {

                (okt + (i+1)).innerText = data[i].oekt_type.value + " " + data[i].dato.value
            }
        }
}

let legg_til_oekt_knapp = document.getElementById("oektKnapp")

// legg_til_oekt_knapp.addEventListener("click", function() {

//     // Jobb med denne seinere
// })

let vis_ovelse_form = document.getElementById("ovelseKnapp")
const ovelseform = document.getElementById("ovelseForm")

vis_ovelse_form.addEventListener("click", function() {
    ovelseform.classList.remove("hidden")
    ovelseform.classList.add("visible")
})

ovelseform.addEventListener("submit", async function(event) {
    event.preventDefault()
    let response = await fetch("api/registrer_ovelse", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({navn, muskel})
    })
})
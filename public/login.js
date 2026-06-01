
const form = document.getElementById("authenticate"); //Behandler login form

form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const authType = document.querySelector('input[name="authType"]:checked').value; //Returnerer enten login eller signup
    const brukernavn = document.getElementById("name").value;
    const passord = document.getElementById("password").value;

// Sjekker om bruker skal logge inn eller registrere seg og går videre til funksjonen som gjør det
    if (authType === "login") {
        login(brukernavn, passord);
    }
    if (authType === "signup") {
        signup(brukernavn, passord);
    }
});

async function login(brukernavn, passord) { //Sammenligner bruker og passord i backend
    const response = await fetch('/api/login', {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({brukernavn, passord})
    });

    if (response.ok) {
        window.location.href = "index.html"; //Sender bruker til index
    }
    else {
        console.log("Feil brukernavn eller passord");
    }
}

async function signup(brukernavn, passord) {
// Poster brukernavn og passord til person i databasen min
    const response = await fetch("/api/registrer_bruker", {
        method: "POST",
        headers: {"Content-Type": "application/json"          
        },
        body: JSON.stringify({brukernavn, passord})
    });

    if (response.ok) {
        window.location.href = "login.html"; //Brukeren kommer tilbake til login.html for å logge på med den nye brukeren
    }
    else {
        console.log("Brukeren eksisterer allerede eller teknisk feil");
    }
};


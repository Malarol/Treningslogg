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
const express = require("express");
const app = express();

const PORT = 3000;

const Database = require('better-sqlite3');
const db = new Database('trening-backup.db');

// CORS-middleware for å tillate forespørsler fra andre domener
const cors = require('cors');
app.use(cors());
app.use(express.static('public'));

const bcrypt = require('bcryptjs')

const session = require('express-session')
app.use(express.json());

app.use(session({
    secret: "veldighemmeligstring",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));


app.post("/api/login", express.json(), (req, res) => {
    const {brukernavn, passord} = req.body
    const person = db
        .prepare("SELECT brukernavn FROM Person WHERE brukernavn = ? AND passord = ?")
        .get(brukernavn, passord);

    if (!person) {
        return res.status(401).json({ error: "Feil brukernavn eller passord"})
    }

    req.session.bruker = {brukernavn: person.brukernavn}
    res.json({ message: "innlogget"})
})

//Registrere ny bruker
app.post('/api/registrer_bruker', express.json(), (req, res) => {
    // Henter ut data fra request body (det som klienten har sendt inn)
    const { brukernavn, passord} = req.body;

    // Sjekk om personen eksisterer
  const person = db.prepare('SELECT * FROM Person WHERE brukernavn = ?').get(brukernavn);
    if (person) {
        return res.status(409).json({ error: 'Brukernavn finnes allerede' });
    }

    db.prepare('INSERT INTO Person (brukernavn, passord) VALUES (?, ?)').run(brukernavn, passord);
    res.status(201).json({ message: 'Bruker registrert!' });
})

app.get("/api/session", (req, res) => {
    if (!req.session.bruker) {
        return res.status(401).json({ error: "ikkje innlogga"})
    }

    res.json(req.session.bruker);
})

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logget ut" });
  });
});


app.get('/api/ovelser', (req, res) => {
    const rows = db.prepare('SELECT navn, muskel FROM Ovelse').all();
    res.json(rows);
});

app.get('/api/oekt', (req, res) => {
    if (!req.session.bruker) {
        return res.status(401).json({ error: 'Ikkje innlogga' });
    }

    const brukernavn = req.session.bruker.brukernavn;

    const rows = db.prepare(`
        SELECT oekt_id
        FROM Oekt
        WHERE brukernavn = ?
    `).all(brukernavn);
    res.json(rows);
});

app.post("/api/ny_oekt", (req, res) => {
    const {dato, oekt_type, brukernavn} = req.body;

        db.prepare('INSERT INTO Oekt (dato, oekt_type, brukernavn) VALUES (?,?, ?)').run(dato, oekt_type, brukernavn);

})

// Rute som lar oss registrere en ny fjelltur for en person
app.post('/api/registrer_ovelse', express.json(), (req, res) => {
    // Henter ut data fra request body (det som klienten har sendt inn)
    const {navn, muskel} = req.body;
    // Registrer den nye fjellturen
    db.prepare('INSERT INTO Ovelse (navn, muskel) VALUES (?, ?)').run(navn, muskel);

    res.status(201).json({ message: 'Fjellturen er registrert!' });
});



// Åpner en viss port på serveren, og starter serveren
app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});


//express - session, for å kunne fikse innloggingsystemet







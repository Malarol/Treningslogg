const express = require("express");
const app = express();

const PORT = 3000;

const Database = require('better-sqlite3');
const db = new Database('trening-backup.db');

// CORS-middleware for å tillate forespørsler fra andre domener
const cors = require('cors');
app.use(cors());
app.use(express.static('public'));

const bcrypt = require('bcryptjs');

const session = require('express-session');
app.use(express.json());

app.use(session({
    secret: "veldighemmeligstringslikatingenandrekangjøreskadeellerfåtilgangtildatabasenmin",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));


app.post("/api/login", express.json(), (req, res) => {
    const { brukernavn, passord } = req.body;

    const person = db
        .prepare("SELECT brukernavn, passord FROM Person WHERE brukernavn = ?")
        .get(brukernavn);

    if (!person) {
        return res.status(401).json({ error: "Feil brukernavn eller passord" });
    }

    const stemmerPassord = bcrypt.compareSync(passord, person.passord);

    if (!stemmerPassord) {
        return res.status(401).json({ error: "Feil brukernavn eller passord" });
    }

    req.session.bruker = { brukernavn: person.brukernavn };
    res.json({ message: "innlogget" });
});

//Registrere ny bruker
app.post('/api/registrer_bruker', express.json(), (req, res) => {
    const { brukernavn, passord } = req.body;

    // Sjekk om personen eksisterer
    const person = db.prepare('SELECT * FROM Person WHERE brukernavn = ?').get(brukernavn);
    if (person) {
        return res.status(409).json({ error: 'Brukernavn finnes allerede' });
    }

    const hashedPassord = bcrypt.hashSync(passord, 10);

    db.prepare('INSERT INTO Person (brukernavn, passord) VALUES (?, ?)').run(brukernavn, hashedPassord);
    res.status(201).json({ message: 'Bruker registrert!' });
});

app.get("/api/session", (req, res) => {
    if (!req.session.bruker) {
        return res.status(401).json({ error: "ikkje innlogga" });
    }

    res.json(req.session.bruker);
});

app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logget ut" });
  });
});


app.get('/api/ovelser', (req, res) => {
    const rows = db.prepare('SELECT ovelse_navn, muskel FROM ovelse').all();
    res.json(rows);
});

app.get('/api/oekt/', (req, res) => {
    if (!req.session.bruker) {
        return res.status(401).json({ error: 'Ikkje innlogga' });
    }

    const brukernavn = req.session.bruker.brukernavn;

    const rows = db.prepare(`
        SELECT
            oekt.oekt_id,
            oekt.oekt_type,
            oekt.dato,
            oekt.paagaaende
        FROM oekt
        WHERE oekt.brukernavn = ?
    `).all(brukernavn);
    res.json(rows);
});

app.get("/api/oekt/:oekt_id", (req, res) => {
    if (!req.session.bruker) {
        return res.status(401).json({ error: 'Ikkje innlogga' });
    }

    const brukernavn = req.session.bruker.brukernavn;
    const oekt_id = req.params.oekt_id;

    const rows = db.prepare(`
        SELECT 
            oekt.oekt_id,
            oekt.oekt_type,
            oekt.dato,
            sett_log.set_nr,
            sett_log.vekt,
            sett_log.reps,
            sett_log.ovelse_navn,
            sett_log.rir
        FROM oekt
        LEFT JOIN sett_log
            on oekt.oekt_id = sett_log.oekt_id
            WHERE oekt.brukernavn = ?
            AND oekt.oekt_id = ?
        `).all(brukernavn, oekt_id);
       
    res.json(rows);
});

app.post('/api/registrer_ovelse', express.json(), (req, res) => {
    const { ovelse_navn, muskel } = req.body;

    db.prepare('INSERT INTO ovelse (ovelse_navn, muskel) VALUES (?, ?)').run(ovelse_navn, muskel);

    res.status(201).json({
        message: 'Ovelse registrert!',
        ovelse: {ovelse_navn, muskel }
    });
});


app.post("/api/ny_oekt", (req, res) => {
    if (!req.session.bruker) {
        return res.status(401).json({ error: "Ikkje innlogga" });
    }

    const { dato, oekt_type } = req.body;
    const brukernavn = req.session.bruker.brukernavn;
    let paagaaende = "ja";

    const result = db.prepare("INSERT INTO oekt (dato, oekt_type, brukernavn, paagaaende) VALUES (?, ?, ?, ?)")
    .run(dato, oekt_type, brukernavn, paagaaende);

    res.status(201).json({
        message: "Økt oppretta",
    });

});

app.post("/api/sett_log", (req, res) => {
    const { set_nr, vekt, reps, ovelse_navn, oekt_id, rir } = req.body;
    if (!req.session.bruker) {
        return res.status(401).json({ error: "Ikkje innlogga" });
    }

    db.prepare(`
        INSERT INTO sett_log (set_nr, vekt, reps, ovelse_navn, oekt_id, rir) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(set_nr, vekt, reps, ovelse_navn, oekt_id, rir,);
    
    
    res.status(201).json({ message: "Sett lagra" });

});

app.post("/api/avslutt_oekt", (req, res) => {
    const { oekt_id } = req.body;

    if (!req.session.bruker) {
        return res.status(401).json({ error: "Ikkje innlogga" });
    }

    if (!oekt_id) {
        return res.status(400).json({ error: "Mangler oekt_id" });
    }

    const result = db.prepare(`
        UPDATE oekt
        SET paagaaende = ?
        WHERE oekt_id = ?
    `).run("nei", oekt_id);

    
    res.json({ message: "Økt avslutta", endra: result.changes });
});


app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});

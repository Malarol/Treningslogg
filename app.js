//--------Setup--------

//-------- Importar --------
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

//-------- App og konstanter --------
const app = express();
const PORT = 3000;

//Databasen eg bruker
const db = new Database("trening-backup.db");

// --------Middleware --------

// Tillat JSON i request body
app.use(express.json());

// Tillater kommunikasjon mellom frontend og backend
app.use(cors());

// Mappa backend kommuniserer med
app.use(express.static("public"));

// Session innstillinger
app.use(session({
    //Nøkkel til cookien, slik at den ikkje kan manipulerast av klient
    secret: "veldighemmeligstringslikatingenandrekangjøreskadeellerfåtilgangtildatabasenminellerskadedeifinebrukaranemine23498234092384",
    resave: false, //Session blir ikkje lagra på nytt dersom ingenting endrer seg
    saveUninitialized: false, //Ein tom session blir ikkje lagra
    cookie: {
        httpOnly: true, //cookien kan ikkje lesast av js i nettleseren
        secure: false, //cookien kan sendast over HTTP og HTTPS
        maxAge: 1000 * 60 * 60 //Lengde på session, altså 1 time
    }
}));

//--------Setup--------

//--------API-endepunkt--------

app.post("/api/login", (req, res) => {
    const { brukernavn, passord } = req.body;

    const person = db //Henter brukernavn og passord der brukernavn = det klienten sendte fra body
        .prepare("SELECT brukernavn, passord FROM Person WHERE brukernavn = ?")
        .get(brukernavn);

    if (!person) {
        return res.status(401).json({ error: "Feil brukernavn eller passord" });
    }

    const stemmerPassord = bcrypt.compareSync(passord, person.passord); //Sammenligner passord fra body og kryptert passord i databasen

    if (!stemmerPassord) {
        return res.status(401).json({ error: "Feil brukernavn eller passord" });
    }

    req.session.bruker = { brukernavn: person.brukernavn }; //Registrerer ein session til brukeren
    res.json({ message: "innlogget" });
});

//Registrere ny bruker
app.post('/api/registrer_bruker', (req, res) => {
    const { brukernavn, passord} = req.body;

    // Sjekk om personen eksisterer
  const person = db.prepare('SELECT * FROM Person WHERE brukernavn = ?').get(brukernavn);
    if (person) {
        return res.status(409).json({ error: 'Brukernavn finnes allerede' });
    }

    const hashedPassord = bcrypt.hashSync(passord, 10) //Krypterer passord for sikkerhet

    //Registrerer brukernavn og passord i databasen
    db.prepare('INSERT INTO Person (brukernavn, passord) VALUES (?, ?)').run(brukernavn, hashedPassord); 
    res.status(201).json({ message: 'Bruker registrert!' });
})

app.get("/api/session", (req, res) => { //Sjekker om brukeren er logga inn og returnerer brukeren
    if (!req.session.bruker) {
        return res.status(401).json({ error: "ikkje innlogga"})
    }

    res.json(req.session.bruker);
})

app.post("/api/logout", (req, res) => { //Fjerner session til brukeren, altså cookien som er lagra i nettsida
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logget ut" });
  });
});


app.get('/api/ovelser', (req, res) => { // Returnerer alle øvelsane fra databasen
    const rows = db.prepare('SELECT ovelse_navn, muskel FROM ovelse').all();
    res.json(rows);
});

app.get('/api/oekt/', (req, res) => { //Returnerer alle øktane til ein bestemt bruker
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

app.get("/api/oekt/:oekt_id", (req, res) => { //Returnerer både sett logg og økt til ein bestemt økt id
    if (!req.session.bruker) {
    return res.status(401).json({ error: 'Ikkje innlogga' });
    }

    const brukernavn = req.session.bruker.brukernavn;
    const oekt_id = req.params.oekt_id; //Fra nettleser-stien

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
        `).all(brukernavn, oekt_id)
       
    res.json(rows)
})

app.post('/api/registrer_ovelse', (req, res) => { //Registrer både øvelser til databasen
    const {ovelse_navn, muskel} = req.body;

    db.prepare('INSERT INTO ovelse (ovelse_navn, muskel) VALUES (?, ?)').run(ovelse_navn, muskel);

    res.status(201).json({
        message: 'Ovelse registrert!',
        ovelse: {ovelse_navn, muskel }
    });
});


app.post("/api/ny_oekt", (req, res) => { //Registrerer ein ny økt til databasen
    if (!req.session.bruker) {
    return res.status(401).json({ error: "Ikkje innlogga" });}

    const { dato, oekt_type } = req.body;
    const brukernavn = req.session.bruker.brukernavn;
    let paagaaende = "ja"; // Brukes for å handtere om økten er aktiv

    const result = db.prepare("INSERT INTO oekt (dato, oekt_type, brukernavn, paagaaende) VALUES (?, ?, ?, ?)")
    .run(dato, oekt_type, brukernavn, paagaaende);

    res.status(201).json({
        message: "Økt oppretta",
    });

})

app.post("/api/sett_log", (req, res) => { //Legger sett til i økten
    const { set_nr, vekt, reps, ovelse_navn, oekt_id, rir } = req.body;
    if (!req.session.bruker) {
        return res.status(401).json({ error: "Ikkje innlogga" });
    }

    db.prepare(`
        INSERT INTO sett_log (set_nr, vekt, reps, ovelse_navn, oekt_id, rir) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(set_nr, vekt, reps, ovelse_navn, oekt_id, rir,);
    
    
    res.status(201).json({ message: "Sett lagra" });

})

app.post("/api/avslutt_oekt", (req, res) => { //Avslutter økten, altså setter pågående til nei
    const {oekt_id} = req.body;

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
})

// --------API-endepunkt--------

//Port
app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});

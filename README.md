# Treningslogg
Lage ein app som kan lagre treningsøkter og diverse statestikk om treningsøkten.
Bruker better-sqlite3, express, express-session, cors og bcrypt


## API endepunkter
app.post("/api/login",):
Henter brukernavn og passord fra body, sjekker om dei matcher med databasen og opptretter ein session til brukernavnet

app.post('/api/registrer_bruker',):
Henter brukernavn og passord fra body, deretter sjekker om brukeren allerede eksisterer, så lagres brukernavn og passord i person

app.get("/api/session",):
Sjekker om det eksisterer ein session til brukeren

app.post("/api/logout",)
Sletter cookien som blei lagd i nettleseren, altså sessionen

app.get('/api/ovelser',)
Henter alle øvelser fra databasen

app.get('/api/oekt/')
Henter alle øktane til ein bestemt bruker

app.get("/api/oekt/:oekt_id")
Henter heile økta og settene som blei utført i økta, til ein bestemt økt id

app.post('/api/registrer_ovelse',)
Henter øvelse_navn og muskel fra body og registrerer det i øvelse

app.post("/api/ny_oekt",)
Henter dato og økt type fra body, setter påågående = ja, henter brukernavn fra session og registrerer det i økt

app.post("/api/sett_log")
Henter set nr, reps, vekt, øvelse, økt id og rir, og registrer det i sett_log

app.post("/api/avslutt_oekt")
Endrer pågående fra ja til nei til ein bestemt økt id.

## Frontend og backend
login.html, login.css og login.js handterer innlogging, med eit enkelt form på html sida og js som postar det til backend.

index.html, index.css og index.js er hovudsida. Her får brukaren informasjon fra tidlegare øktar som er henta fra backend. Brukar kan også registrere øvelsar, øktar og sett til økta i databasen fra klientsida. Bruker kan også sjå alle øvelsane som er registrert fra backend.

### 17/3
Lagt databasen

Bilde: Midlertidig bilde <img src="datamod-trening.jpg"> 
Husk rir, det er lagt til settlogg


Lagt til testdata på øvelser til ein push økt. Lagt testdata til bruker, dette er midlertidig

Også begynt på app.js, her har eg lagt ein sti til øvelser, bruker og økt til spesifikk bruker(usikker på om denne funker.)

### 20/3
Idemyldring funksjonalitet:
Brukeren skal kunne legge til økter og øvelser. Bruker skal sjå navnet sitt på forskjermen. Bruker skal kunne sjå tidlegare øvelsar for å sjå progresjon. 
Begynte på eit login system med forms, blei ikkje ferdig pga serverfeil. Uansett strategien er å la brukeren velge om han skal logge på eller registrere ved hjelp av radioknapper. Om bruker logger inn, tar eg passord fra databasen og sammenligner med det brukerene som allerede ligger inne.

### 24/3
Jobba videre på innloggingsystemet. Fekk til å registrere bruker til database, og sjekke om brukeren allereie eksisterte for å logge inn. Videre sendte eg de til ein indexfil som eg skal begynne på. Det første eg ville gjøre var å innerTexte brukernavnet til brukeren, men det blei komplikasjoner rundt korleis dette skulle fungere med å finne brukernavnet. Jo bjørnar hinta på at eg skulle bruke express-session som eg begynner på neste time.

### 31/3
Jobba med innloggingsystemet og fekk til session, har ikkje begynt fullstendig på bcrypt enda, men om det er tid til det vil eg gjere det. Eg har også begynt på indexfilen, der eg har lagt grunnmuren til htmlen, og nå gjenstår js og databasesystemet. Fekk akkurat gjort det mulig for brukeren å legge til øvelsar men eg har ikkje testa det enda, ettersom klokka er 00.30. Eg kommer til å sjå på dette i morgon.

### 1/4
Brukeren klarer å legge til øvelser. Eg har jobbet videre med index.js, der brukeren no ser navnet sitt på skjermen. Også lagt til forms til set og økt. Nå gjenstår det å håndtere de dataene og poste de til databasen.

###  7/4
Eg har lagt til stier for både øvelser og sett log, og håndterer data slik at brukeren kan registrere treningsdata fra klientsiden. Dette kommer fint fram i serversiden.

### 12/4
Gjort resterende arbeid. Jobbet mykje med appendchild slik at brukeren sin treningsdata kommer opp på skjermen. Også jobba med eit system som finner oekt_id til ein pågående økt. Fungerer slik at eg leitar etter oekt.paagaaende = "ja", deretter tar eg oekt.oekt_id fra objekt. Tanken er at brukeren bare kan ha ein aktiv økt om gangen. Med dette kan brukeren starte ein økt, gå ut av appen, deretter opne økten igjen og framleis ha dataene sine framme. Også lagt ein funksjon som faktisk skriver disse dataene til klientsiden.

### 14/4
Alt av funksjonalitet er ferdig. Fiksa på nokre foreign keys bugs, viste seg å berre vere rekkefølge som er litt irriterende. Jobba med design, altså skrive kort data om de tre siste øktene og legge de i eit eget vindu. Videre har eg også jobba litt med hvilke knapper som skal vere synlig til kvar tid. Dette er eg ikkje heilt ferdig med. Til slutt jobba eg med css. Produktet er meir eller mindre ferdig, nå gjenstår det bare å finne bugs og jobbe med knapper. Muligens legge til rute som loggar brukeren ut av session, men det er berre om eg får tid.

### 20/4
Enkel css på login sida. Implementert bcrypt til nettsida og gjort det mulig for brukeren til å logge ut av session, ikkje bare bli sendt tilbake til login sida.
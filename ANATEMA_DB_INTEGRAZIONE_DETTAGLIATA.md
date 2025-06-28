# ANATEMA – Dettaglio Funzionalità e Collegamento Database

## Scopo dell’Applicazione

Anatema è una piattaforma per la gestione collaborativa di progetti, etichette e dati tabellari (Excel), con autenticazione utenti, ruoli e permessi. Tutte le operazioni sono persistite in un database PostgreSQL, garantendo sicurezza, coerenza e tracciabilità.

---

## Funzionalità Principali

### 1. Gestione Utenti
- **Registrazione, login, logout**: autenticazione sicura tramite password hashata e JWT.
- **Ruoli**: ogni utente ha un ruolo (es. admin, user) che determina i permessi.
- **Gestione utenti**: solo gli admin possono creare, modificare o eliminare altri utenti.
- **Persistenza**: tutti i dati utenti sono salvati nella tabella `users` del database.

### 2. Gestione Progetti
- **CRUD progetti**: ogni utente può creare, visualizzare, modificare e cancellare i propri progetti.
- **Owner**: ogni progetto ha un proprietario (owner) e solo lui (o un admin) può modificarlo/eliminarlo.
- **Associazione utenti-progetti**: i progetti sono collegati agli utenti tramite chiave esterna (`user_id`).
- **Persistenza**: dati salvati nella tabella `projects`.

### 3. Gestione Etichette (Labels)
- **CRUD etichette**: le etichette sono collegate ai progetti e possono essere create, modificate, eliminate.
- **Categorie/tags**: ogni etichetta può avere una o più categorie/tags (campo `categories`).
- **Persistenza**: dati salvati nella tabella `labels`.

### 4. Caricamento e Parsing File Excel
- **Upload file**: gli utenti possono caricare file Excel tramite API.
- **Parsing**: il backend estrae e salva i dati delle tabelle Excel in `files`, `excel_sheets`, `excel_columns`, `excel_rows`.
- **Visualizzazione**: il frontend mostra i dati estratti e permette di gestirli.

### 5. Sicurezza e Permessi
- **Autenticazione JWT**: tutte le operazioni protette richiedono un token JWT valido.
- **Permessi**: solo chi ha i permessi può modificare/eliminare dati (es. solo owner può modificare il proprio progetto).

---

## Collegamento con il Database

### Backend (Node.js/Express)
- **Connessione persistente** al database PostgreSQL tramite la libreria `pg`.
- **Tutte le operazioni CRUD** (creazione, lettura, aggiornamento, cancellazione) su utenti, progetti, etichette, file Excel sono fatte tramite query SQL reali.
- **Validazione dati**: ogni endpoint valida i dati secondo lo schema del database (`DB_SCHEMA.md`).
- **Gestione errori**: il backend restituisce errori chiari in caso di problemi (permessi, dati mancanti, errori di query).
- **Endpoint RESTful**: ogni entità ha i suoi endpoint (`/api/users`, `/api/projects`, ecc.) che leggono e scrivono solo dal database.

### Frontend (React)
- **Fetch dati solo tramite API**: il frontend non gestisce dati utenti/progetti/etichette in locale o mock, ma solo tramite chiamate alle API REST.
- **Sincronizzazione stato**: lo stato locale/globale (es. context) è sempre sincronizzato con i dati reali provenienti dal backend.
- **Gestione feedback**: il frontend mostra loading, errori, conferme in base alle risposte delle API.

---

## Esempio di Flusso Utente

1. **Login**:  
   L’utente inserisce username/password → il frontend chiama `/api/login` → il backend verifica nel DB → se ok, restituisce JWT.
2. **Visualizzazione progetti**:  
   Il frontend chiama `/api/projects` passando il JWT → il backend legge i progetti dal DB per quell’utente → restituisce la lista.
3. **Creazione etichetta**:  
   L’utente crea una nuova etichetta su un progetto → il frontend invia i dati a `/api/labels` → il backend salva nel DB e restituisce la nuova etichetta.
4. **Upload Excel**:  
   L’utente carica un file → il frontend invia il file a `/api/files` → il backend salva il file e i dati estratti nelle tabelle dedicate.

---

## A cosa serve Anatema

- **Collaborazione**: permette a più utenti di lavorare su progetti e dati condivisi, con ruoli e permessi.
- **Gestione dati strutturati**: consente di caricare, visualizzare e gestire dati tabellari (Excel) in modo centralizzato e sicuro.
- **Tracciabilità e sicurezza**: ogni operazione è tracciata e protetta da autenticazione e permessi.
- **Scalabilità**: la struttura a microservizi e l’uso di PostgreSQL permettono di gestire grandi quantità di dati e utenti.

---

## Collegamento Database ⇄ Applicazione: Schema

1. **Frontend React** → chiama API REST →
2. **Backend Node.js/Express** → esegue query SQL →
3. **Database PostgreSQL** → restituisce dati →
4. **Backend** → restituisce risposta JSON →
5. **Frontend** → aggiorna UI

---

## Riferimenti
- `LABEL_DB_INTEGRATION_PLAN.md`: piano operativo step-by-step
- `DB_SCHEMA.md`: schema dettagliato delle tabelle
- `DOCKER.md`: istruzioni per l’avvio in container

---

**Ogni funzionalità deve essere testata e validata solo tramite dati reali nel database. Nessun dato deve essere gestito in locale o mockato.**

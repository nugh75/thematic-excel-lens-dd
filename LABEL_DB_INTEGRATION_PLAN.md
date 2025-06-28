# Piano di Collegamento Database ⇄ Applicazione

Questo piano guida passo-passo l'integrazione tra il database PostgreSQL (vedi `DB_SCHEMA.md`) e l'applicazione Anatema (backend Node.js/Express, frontend React).

---

## 1. Analisi e Mappatura Entità

- **users**: gestione autenticazione, ruoli, permessi
- **projects**: gestione progetti, owner, nome, date
- **labels**: etichette associate ai progetti, con categorie
- **files/excel_sheets/excel_columns/excel_rows**: caricamento e parsing file Excel

---

## 2. Passi Operativi

### Passo 1: Backend/API
- [ ] Aggiornare/creare endpoint RESTful per tutte le entità chiave (`users`, `projects`, `labels`, `files`...)
- [ ] Ogni endpoint deve leggere/scrivere i dati reali dal database PostgreSQL, usando lo schema reale
- [ ] Validare i dati in ingresso/uscita secondo lo schema
- [ ] Gestire errori e permessi (es. solo owner può modificare un progetto)

### Passo 2: Frontend
- [ ] Aggiornare i componenti React per usare le API reali (fetch/axios)
- [ ] Sincronizzare lo stato locale/globale con i dati provenienti dal backend
- [ ] Gestire feedback utente (loading, errori, conferme)

### Passo 3: Caricamento e Parsing File Excel
- [ ] Implementare upload file tramite API (`files`)
- [ ] Salvare metadati e contenuto in `files`, `excel_sheets`, `excel_columns`, `excel_rows`
- [ ] Visualizzare e gestire i dati Excel dal frontend

### Passo 4: Gestione Etichette (Labels)
- [ ] CRUD completo su `labels` (collegato a `projects`)
- [ ] Supporto a categorie/tags (campo `categories`)
- [ ] Sincronizzazione in tempo reale tra frontend e backend

### Passo 5: Gestione Utenti e Permessi
- [ ] Login/logout, registrazione, gestione sessione
- [ ] Ruoli e permessi (campo `role` in `users`)
- [ ] Permessi su progetti e dati

### Passo 6: Test e Validazione
- [ ] Testare ogni flusso: login, creazione progetto, upload Excel, gestione etichette
- [ ] Validare la persistenza e la coerenza dei dati

---

## Note
- Seguire sempre lo schema reale riportato in `DB_SCHEMA.md`
- Aggiornare questo piano man mano che si procede
- Ogni step completato va spuntato

---

**Attendi approvazione prima di procedere con l’implementazione.**

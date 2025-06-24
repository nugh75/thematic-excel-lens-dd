# Sistema di Login e Gestione Password - Anatema

## 🔐 Panoramica

Il sistema di login è stato completamente rinnovato con un approccio sicuro e user-friendly che include:

- **Gestione password sicura** con hashing SHA-256
- **Rate limiting** per prevenire attacchi brute force
- **Gestione utenti avanzata** per amministratori
- **Validazione password** con requisiti di sicurezza
- **Sessioni sicure** con gestione automatica

## 🚀 Funzionalità Principali

### 1. Sistema di Autenticazione Sicuro

#### Password Hashing
- Le password sono hashate usando SHA-256 con salt personalizzato
- Nessuna password viene mai salvata in chiaro
- Verifica sicura durante il login

#### Rate Limiting
- Massimo 5 tentativi di login falliti per utente
- Blocco account per 15 minuti dopo 5 tentativi
- Protezione contro attacchi brute force

#### Gestione Sessioni
- Sessioni automatiche con durata di 24 ore
- Estensione automatica delle sessioni attive
- Invalidazione sicura al logout

### 2. Gestione Password Avanzata

#### Requisiti di Sicurezza
- Minimo 8 caratteri
- Almeno una lettera maiuscola
- Almeno una lettera minuscola
- Almeno un numero
- Almeno un carattere speciale

#### Generatore Password
- Generazione automatica di password sicure
- Password casuali di 12 caratteri
- Charset completo con caratteri speciali

#### Validazione in Tempo Reale
- Indicatore visivo della forza password
- Feedback dettagliato sui requisiti mancanti
- Verifica della corrispondenza delle password

### 3. Gestione Utenti

#### Utente Amministratore Predefinito
Al primo avvio, viene creato automaticamente un amministratore:
- **Username**: Amministratore
- **Email**: admin@anatema.local
- **Password**: Admin123!
- **Ruolo**: admin

#### Tipi di Utente
- **admin**: Accesso completo, gestione utenti
- **annotator**: Può etichettare e modificare
- **viewer**: Solo lettura

#### Gestione Avanzata (Solo Admin)
- Visualizzazione di tutti gli utenti
- Attivazione/disattivazione account
- Reimpostazione password
- Eliminazione utenti (con protezioni)
- Statistiche utenti

## 📋 Guida Utilizzo

### Primo Accesso

1. **Avvia l'applicazione**
   - Vai alla pagina di analisi
   - Vedrai la schermata di login

2. **Login Amministratore**
   - Seleziona "Amministratore" dal dropdown
   - Inserisci la password: `Admin123!`
   - Clicca "Accedi"

3. **Creazione Primo Utente**
   - Clicca il pulsante "+" accanto ad "Accedi"
   - Compila i dati utente
   - Clicca "Crea Utente"
   - Imposta una password sicura

### Gestione Password

#### Impostare/Modificare Password
1. **Durante creazione utente**: Si apre automaticamente
2. **Per utenti esistenti**: 
   - Clicca l'icona chiave (🔑) nella barra utente
   - Oppure usa la gestione avanzata (admin)

#### Generazione Password Automatica
1. Nel dialog password, clicca "Genera Password Sicura"
2. La password viene inserita automaticamente
3. Copia e salva la password prima di confermare

### Gestione Utenti Avanzata (Admin)

#### Accesso
1. Vai nel tab "Utenti"
2. Clicca "Gestione Avanzata" (solo per admin)

#### Funzionalità Disponibili
- **Statistiche**: Totale utenti, admin, attivi, senza password
- **Gestione Stato**: Attiva/disattiva utenti
- **Reset Password**: Imposta nuove password
- **Eliminazione**: Rimuovi utenti (con protezioni)

#### Protezioni
- Non puoi eliminare te stesso
- Non puoi disattivare il tuo account
- Non puoi eliminare l'ultimo amministratore

## 🔒 Sicurezza

### Password Sicure
Il sistema valida automaticamente:
- Lunghezza minima
- Complessità caratteri
- Forza complessiva

### Protezioni Anti-Abuso
- Rate limiting sui tentativi
- Blocchi temporanei automatici
- Logging degli accessi

### Best Practices
1. **Password Amministratore**: Cambia immediatamente la password predefinita
2. **Password Utenti**: Usa il generatore automatico quando possibile
3. **Ruoli**: Assegna il ruolo minimo necessario
4. **Account Inattivi**: Disattiva account non utilizzati

## 🛡️ Troubleshooting

### Account Bloccato
- **Problema**: "Account bloccato per X minuti"
- **Soluzione**: Aspetta la scadenza del blocco o contatta un admin

### Password Dimenticata
- **Soluzione**: Un amministratore può reimpostare la password
- Vai su Gestione Avanzata → Icona chiave per l'utente

### Utente Senza Password
- **Problema**: Badge "No password" nell'elenco utenti
- **Soluzione**: Clicca l'icona chiave per impostare una password

### Errori di Validazione
- **Password troppo debole**: Segui i suggerimenti mostrati
- **Password non corrispondenti**: Verifica la digitazione

## 🔧 Configurazione Tecnica

### File Modificati/Creati
- `src/services/authService.ts` - Servizio autenticazione
- `src/components/PasswordManager.tsx` - Gestione password
- `src/components/UserManagerAdvanced.tsx` - Gestione utenti admin
- `src/components/LoginComponent.tsx` - Login rinnovato
- `src/types/analysis.ts` - Aggiunto campo passwordHash
- `src/pages/Analysis.tsx` - Integrazione gestione avanzata

### Dipendenze
- Utilizza crypto API nativo del browser
- Componenti UI esistenti (shadcn/ui)
- Zustand store per persistenza

### Persistenza
- Hash password salvati nel localStorage via Zustand
- Sessioni gestite in memoria
- Backup automatico con il sistema esistente

## 📊 Monitoraggio

### Metriche Disponibili (Gestione Avanzata)
- Totale utenti registrati
- Numero amministratori
- Utenti attivi vs inattivi
- Utenti senza password configurata

### Audit Trail
- Tentativi di login (successo/fallimento)
- Creazione/modifica utenti
- Cambio password
- Attivazione/disattivazione account

## 🎯 Prossimi Sviluppi

### Funzionalità Future
- [ ] Autenticazione a due fattori (2FA)
- [ ] Integrazione con provider esterni (OAuth)
- [ ] Criteri password personalizzabili
- [ ] Audit log dettagliato
- [ ] Notifiche di sicurezza
- [ ] Scadenza password automatica
- [ ] Backup/restore configurazioni utenti

### Miglioramenti Pianificati
- [ ] Interfaccia mobile ottimizzata
- [ ] Importazione utenti da CSV
- [ ] Gruppi e permessi granulari
- [ ] Dashboard amministrativo dedicato

---

## 💡 Supporto

Per domande o problemi:
1. Consulta questa documentazione
2. Verifica il troubleshooting
3. Contatta l'amministratore di sistema

**Versione**: 1.0.0  
**Data**: 24 Giugno 2025  
**Autore**: Sistema AI Anatema

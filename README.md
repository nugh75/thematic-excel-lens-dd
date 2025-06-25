# AnaTema - AI Assistant per Analisi Qualitativa

AnaTema è uno strumento avanzato per ricercatori che lavorano con l'analisi qualitativa dei dati. Progettato per facilitare l'analisi tematica, la codifica e l'interpretazione di dati testuali, AnaTema combina l'efficienza dell'automazione con la precisione dell'analisi umana.

## 🎯 Per Chi è AnaTema

AnaTema è pensato per:
- **Ricercatori accademici** che conducono analisi qualitative
- **Analisti sociali** che lavorano con interviste e focus group
- **Studenti di dottorato** che svolgono ricerca qualitativa
- **Professionisti della ricerca** in ambito sociologico, psicologico e antropologico

## ✨ Caratteristiche Principali

### 📊 Gestione Dati Excel
- **Import facilitato**: Carica facilmente file Excel con i tuoi dati qualitativi
- **Navigazione intuitiva**: Esplora i dati per righe, colonne o vista completa
- **Struttura flessibile**: Supporta qualsiasi formato di organizzazione dei dati

### 🏷️ Sistema di Etichettatura Avanzato
- **Etichettatura manuale**: Applica codici e temi ai tuoi dati
- **Gestione categorie**: Organizza le etichette in categorie tematiche
- **Statistiche dettagliate**: Analizza la distribuzione delle etichette per colonna
- **Tracciamento completo**: Monitora l'evoluzione del processo di codifica

### 🤖 AI Assistant Integrato
- **Suggerimenti intelligenti**: L'AI suggerisce codici e temi basati sui contenuti
- **Analisi automatica**: Identifica pattern e connessioni nei dati
- **Supporto multilingue**: Lavora con testi in diverse lingue
- **Personalizzazione**: Configura l'AI secondo le tue esigenze di ricerca

### 📈 Analisi e Reporting
- **Statistiche per colonna**: Visualizza conteggi e distribuzioni delle etichette
- **Export flessibile**: Esporta risultati in formati compatibili
- **Gestione sessioni**: Salva e riprendi il lavoro in qualsiasi momento
- **Backup automatico**: I tuoi dati sono sempre al sicuro

## 🚀 Avvio Rapido

### Prerequisiti
- Node.js 18+ e npm (per sviluppo locale)
- Docker e Docker Compose (per deployment)

### Sviluppo Locale

```bash
# Clona il repository
git clone https://github.com/yourusername/anatema.git
cd anatema

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

### Deployment con Docker

```bash
# Copia il file di configurazione
cp .env.docker.example .env.docker

# Modifica le variabili d'ambiente in .env.docker
nano .env.docker

# Avvia l'applicazione (produzione)
./docker-manage.sh start

# Per sviluppo
./docker-manage.sh dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 🔧 Configurazione

### Variabili d'Ambiente

Copia `.env.docker.example` in `.env.docker` e configura:

```env
# Database Redis
REDIS_PASSWORD=your_secure_password

# Rete Docker
DOCKER_NETWORK_SUBNET=172.20.0.0/16

# Porte (opzionale, usa i default se non specificato)
APP_PORT=3000
REDIS_PORT=6379
```

### Configurazione AI

AnaTema supporta diversi provider AI:
- **OpenRouter**: Accesso a modelli multipli
- **Modelli locali**: Supporto futuro per deployment privati

Le chiavi API vengono configurate direttamente nell'interfaccia utente per garantire la sicurezza.

## 📚 Guida all'Uso

### 1. Import dei Dati
1. Clicca su "Carica Excel" nella homepage
2. Seleziona il tuo file Excel (.xlsx, .xls)
3. Scegli il foglio di lavoro da analizzare

### 2. Esplorazione Dati
- **Vista Griglia**: Visualizza tutti i dati in formato tabellare
- **Vista Colonna**: Concentrati su una colonna specifica
- **Vista Riga**: Esamina una riga alla volta

### 3. Etichettatura
1. Seleziona celle o righe da etichettare
2. Applica etichette esistenti o creane di nuove
3. Organizza le etichette in categorie tematiche
4. Utilizza i suggerimenti AI per accelerare il processo

### 4. Analisi
- Visualizza statistiche delle etichette per colonna
- Esamina la distribuzione dei temi
- Identifica pattern e connessioni
- Esporta i risultati per ulteriori analisi

## 🛠️ Tecnologie Utilizzate

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Bundler**: Vite
- **Database**: Redis (per sessioni e cache)
- **Containerization**: Docker, Docker Compose
- **AI Integration**: OpenRouter

## 📁 Struttura del Progetto

```
anatema/
├── src/
│   ├── components/        # Componenti React riutilizzabili
│   ├── pages/            # Pagine principali dell'applicazione
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Gestione stato globale
│   ├── types/            # Definizioni TypeScript
│   └── utils/            # Utilità e servizi
├── docker/               # Configurazioni Docker
├── public/               # Asset statici
└── docs/                 # Documentazione aggiuntiva
```

## 🤝 Contribuire

AnaTema è un progetto open source. I contributi sono benvenuti!

1. Fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push del branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

Per supporto, domande o suggerimenti:
- Apri una [Issue](https://github.com/yourusername/anatema/issues) su GitHub
- Consulta la [documentazione](https://github.com/yourusername/anatema/wiki)
- Contatta il team di sviluppo

## 🔒 Privacy e Sicurezza

AnaTema è progettato con la privacy al centro:
- **Dati locali**: I tuoi dati rimangono sui tuoi server
- **Chiavi API sicure**: Le credenziali AI sono gestite in modo sicuro
- **No tracking**: Nessun tracciamento o invio di dati a terzi
- **Open source**: Codice completamente trasparente e verificabile

---

*AnaTema - Trasforma i tuoi dati qualitativi in insight significativi*

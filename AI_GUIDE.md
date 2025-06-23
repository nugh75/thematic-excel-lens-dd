# Guida alle Funzionalità AI

## Panoramica

L'applicazione di analisi tematica ora include potenti funzionalità di intelligenza artificiale tramite integrazione con Ollama. L'AI può assistere in diverse fasi del processo di analisi tematica qualitativa.

## Configurazione Ollama

### 1. Installazione di Ollama

Scarica e installa Ollama dal sito ufficiale: https://ollama.ai

### 2. Configurazione dell'API

1. **Avvia Ollama** sul tuo sistema
2. **Configura l'URL dell'API** nell'applicazione:
   - Vai alla scheda "AI Config"
   - Inserisci l'URL di Ollama (default: `http://192.168.129:11435`)
   - Clicca su "Test" per verificare la connessione

### 3. Scarica un Modello

```bash
# Esempi di modelli consigliati per l'analisi tematica
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

### 4. Seleziona il Modello

Nella scheda "AI Config":
- Clicca su "Aggiorna" per caricare i modelli disponibili
- Seleziona il modello che preferisci dal menu a tendina

## Funzionalità AI Disponibili

### 🏷️ Suggerimenti per Etichette

**Dove trovarla:**
- Scheda "Vista Singola Colonna" → pannello "Suggerimenti AI per Etichette"
- Griglia dati → icona 🤖 nell'intestazione delle colonne aperte

**Come funziona:**
1. Seleziona una colonna con domande aperte
2. Clicca su "Genera Suggerimenti AI"
3. L'AI analizza le risposte e propone etichette tematiche appropriate
4. Ogni suggerimento include:
   - Nome dell'etichetta
   - Descrizione dettagliata
   - Livello di confidenza (0-100%)
   - Ragionamento per la scelta
5. Clicca su "Aggiungi" per creare l'etichetta nel progetto

**Vantaggi:**
- Identifica pattern tematici nascosti
- Suggerisce etichette coerenti e ben definite
- Risparmia tempo nella fase di categorizzazione iniziale
- Fornisce spiegazioni per ogni suggerimento

### 🤖 Consulente AI

**Dove trovarla:**
- Scheda "AI Consulente" per sessioni approfondite
- Bottone flottante blu in basso a destra (accesso rapido)

**Come usarla:**
1. Scrivi la tua domanda o clicca su una delle domande rapide
2. L'AI fornisce consigli personalizzati basati sul contesto della tua analisi
3. Il consulente conosce:
   - Il nome del tuo progetto
   - Le dimensioni del dataset
   - Il numero di etichette attive

**Esempi di domande:**
- "Come posso migliorare la qualità delle mie etichette?"
- "Quali pattern dovrei cercare in questi dati?"
- "Come posso evitare bias nell'analisi?"
- "Suggerimenti per una categorizzazione più efficace?"
- "Come validare la consistenza delle mie etichette?"

### ⚙️ Configurazione AI

**Scheda "AI Config":**
- **Abilita/Disabilita AI**: Interruttore principale per le funzionalità AI
- **URL API**: Indirizzo del server Ollama (default: http://192.168.129:11435)
- **Test Connessione**: Verifica che Ollama sia raggiungibile
- **Selezione Modello**: Scegli tra i modelli disponibili
- **Aggiorna Modelli**: Ricarica la lista dei modelli installati

## Best Practices

### 📊 Per i Suggerimenti di Etichette

1. **Qualità dei Dati**: Assicurati che le risposte siano pulite e significative
2. **Campione Rappresentativo**: L'AI analizza le prime 20 risposte per performance
3. **Revisione Critica**: Valuta sempre i suggerimenti prima di accettarli
4. **Iterazione**: Usa i suggerimenti come punto di partenza, non come verità assoluta

### 💬 Per il Consulente AI

1. **Domande Specifiche**: Sii più specifico possibile nelle tue domande
2. **Contesto**: L'AI conosce il tuo progetto, sfrutta questa conoscenza
3. **Validazione**: Confronta sempre i consigli con le migliori pratiche accademiche
4. **Documentazione**: Annota i consigli utili per riferimenti futuri

## Risoluzione Problemi

### ❌ "AI non abilitata"
- Vai alla scheda "AI Config" e attiva l'interruttore
- Verifica che l'URL di Ollama sia corretto

### ❌ "Connessione fallita"
- Controlla che Ollama sia avviato sul tuo sistema
- Verifica l'URL (dovrebbe includere la porta, es. `:11435`)
- Assicurati che non ci siano firewall che bloccano la connessione

### ❌ "Nessun modello trovato"
- Scarica almeno un modello: `ollama pull llama2`
- Clicca su "Aggiorna" nella configurazione AI

### ❌ "Errore durante la generazione"
- Il modello potrebbe essere troppo carico, riprova tra poco
- Verifica che il modello selezionato sia effettivamente disponibile
- Controlla i log di Ollama per errori specifici

## Limitazioni e Considerazioni

### 🔒 Privacy
- I dati vengono inviati al server Ollama locale
- Nessun dato viene condiviso con servizi cloud esterni
- Assicurati che il server Ollama sia sicuro e aggiornato

### ⚡ Performance
- La velocità dipende dalla potenza del tuo sistema
- Modelli più grandi offrono risultati migliori ma sono più lenti
- Le prime richieste possono essere più lente (caricamento modello)

### 🎯 Accuratezza
- L'AI fornisce suggerimenti, non verità assolute
- Sempre necessaria validazione umana
- La qualità dipende dal modello scelto e dai dati di input

## Modelli Consigliati

| Modello | Dimensione | Velocità | Qualità | Uso Consigliato |
|---------|------------|----------|---------|------------------|
| `llama2:7b` | ~3.8GB | ⭐⭐⭐ | ⭐⭐⭐ | Uso generale, buon compromesso |
| `mistral:7b` | ~4.1GB | ⭐⭐⭐ | ⭐⭐⭐⭐ | Analisi dettagliate |
| `llama2:13b` | ~7.3GB | ⭐⭐ | ⭐⭐⭐⭐ | Progetti complessi |
| `codellama:7b` | ~3.8GB | ⭐⭐⭐ | ⭐⭐ | Se hai anche codice nei dati |

---

*Per supporto tecnico o domande specifiche, consulta la documentazione di Ollama o contatta il team di sviluppo.*

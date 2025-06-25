# API Server per Anatema

Server API Node.js per la persistenza dei dati utilizzando Redis come database.

## Funzionalità

- ✅ Salvataggio progetti persistente
- ✅ Condivisione dati tra browser
- ✅ Backup e ripristino completo
- ✅ API RESTful per CRUD progetti
- ✅ Caching Redis per performance
- ✅ Gestione errori e validazione
- ✅ Supporto operazioni offline con coda di sincronizzazione

## Setup e Avvio

### Con Docker (Raccomandato)
```bash
# Dalla directory root del progetto
docker-compose up -d
```

### Manuale
```bash
# Installa dipendenze
npm install

# Avvia Redis (richiesto)
redis-server

# Avvia API server
npm start
```

## Endpoints API

### Gestione Progetti

#### `GET /api/projects`
Lista tutti i progetti (solo metadati).

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "Progetto 1",
    "description": "Descrizione progetto",
    "createdAt": 1719235200000,
    "lastModified": 1719235200000
  }
]
```

#### `GET /api/projects/:id`
Ottiene i dati completi di un progetto specifico.

**Parameters:**
- `id` (string): UUID del progetto

**Response:**
```json
{
  "id": "uuid-1",
  "name": "Progetto 1",
  "description": "Descrizione",
  "createdAt": "2024-06-24T12:00:00Z",
  "updatedAt": "2024-06-24T12:00:00Z",
  "excelData": {
    "fileName": "data.xlsx",
    "headers": ["Col1", "Col2"],
    "rows": [["val1", "val2"]]
  },
  "config": {...},
  "labels": [...],
  "cellLabels": [...],
  "rowLabels": [...],
  "sessions": [...]
}
```

#### `POST /api/projects`
Crea un nuovo progetto.

**Body:**
```json
{
  "name": "Nome progetto",
  "description": "Descrizione",
  "excelData": {
    "fileName": "data.xlsx",
    "headers": ["Col1", "Col2"],
    "rows": [["val1", "val2"]]
  }
}
```

**Response:**
```json
{
  "id": "nuovo-uuid",
  "name": "Nome progetto",
  "description": "Descrizione",
  "createdAt": "2024-06-24T12:00:00Z",
  "updatedAt": "2024-06-24T12:00:00Z",
  // ... resto del progetto
}
```

#### `PUT /api/projects/:id`
Aggiorna un progetto esistente (merge parziale).

**Parameters:**
- `id` (string): UUID del progetto

**Body:** Oggetto con i campi da aggiornare
```json
{
  "name": "Nuovo nome",
  "labels": [...],
  "cellLabels": [...]
}
```

**Response:** Progetto aggiornato completo

#### `DELETE /api/projects/:id`
Elimina un progetto.

**Parameters:**
- `id` (string): UUID del progetto

**Response:**
```json
{
  "message": "Progetto eliminato con successo",
  "deletedId": "uuid-1"
}
```

### Backup e Import/Export

#### `GET /api/projects/:id/export`
Esporta un progetto in formato JSON per backup.

**Parameters:**
- `id` (string): UUID del progetto

**Response:** File JSON del progetto completo

#### `POST /api/projects/import`
Importa un progetto da un file di backup.

**Body:** FormData con file JSON oppure JSON diretto
```json
{
  "backupData": {
    // Struttura completa del progetto
    "name": "Progetto importato",
    "excelData": {...},
    "labels": [...],
    // etc.
  }
}
```

**Response:** Progetto importato con nuovo ID

### Statistiche

#### `GET /api/stats`
Ottiene statistiche generali del sistema.

**Response:**
```json
{
  "totalProjects": 5,
  "totalLabels": 25,
  "totalCellLabels": 150,
  "lastActivity": "2024-06-24T12:00:00Z"
}
```

## Codici di Stato HTTP

- `200 OK` - Operazione riuscita
- `201 Created` - Risorsa creata con successo
- `400 Bad Request` - Dati richiesta non validi
- `404 Not Found` - Risorsa non trovata
- `500 Internal Server Error` - Errore server/Redis

## Variabili d'Ambiente

```bash
API_PORT=3001                    # Porta del server API
REDIS_URL=redis://redis:6379     # URL connessione Redis
NODE_ENV=production              # Ambiente (development/production)
```

## Struttura Dati Progetto

```json
{
  "id": "uuid",
  "name": "Nome progetto",
  "description": "Descrizione",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "excelData": {
    "headers": ["col1", "col2"],
    "rows": [["val1", "val2"]],
    "fileName": "file.xlsx"
  },
  "config": {
    "columnMetadata": []
  },
  "labels": [],
  "cellLabels": [],
  "rowLabels": [],
  "sessions": []
}
```

## Struttura Dati Redis

I dati vengono memorizzati in Redis usando il seguente schema:

### Chiavi Redis
- `project:<uuid>` - Dati completi del progetto
- `projects:global` - Set con tutti gli ID progetti esistenti

### Formato Progetto Completo
```json
{
  "id": "uuid",
  "name": "Nome progetto",
  "description": "Descrizione",
  "createdAt": "2024-06-24T12:00:00Z",
  "updatedAt": "2024-06-24T12:00:00Z",
  "excelData": {
    "fileName": "data.xlsx",
    "headers": ["Colonna1", "Colonna2", "Colonna3"],
    "rows": [
      ["Valore1", "Valore2", "Valore3"],
      ["Valore4", "Valore5", "Valore6"]
    ]
  },
  "config": {
    "version": "1.0",
    "settings": {}
  },
  "labels": [
    {
      "id": "label-uuid",
      "name": "Etichetta",
      "color": "#ff0000",
      "description": "Descrizione etichetta"
    }
  ],
  "cellLabels": [
    {
      "cellId": "row-0-col-0",
      "labelIds": ["label-uuid"],
      "confidence": 0.9
    }
  ],
  "rowLabels": [
    {
      "rowIndex": 0,
      "labelIds": ["label-uuid"],
      "confidence": 0.85
    }
  ],
  "sessions": [
    {
      "id": "session-uuid",
      "userId": "user-uuid",
      "startTime": "2024-06-24T12:00:00Z",
      "actions": []
    }
  ]
}
```

## Esempi d'Uso

### Creare un Progetto
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Progetto di test",
    "excelData": {
      "fileName": "test.xlsx",
      "headers": ["Nome", "Età"],
      "rows": [["Mario", "30"], ["Luigi", "28"]]
    }
  }'
```

### Aggiornare un Progetto
```bash
curl -X PUT http://localhost:3001/api/projects/uuid-progetto \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuovo Nome",
    "labels": [
      {"id": "new-label", "name": "Nuova Etichetta", "color": "#00ff00"}
    ]
  }'
```

### Esportare un Progetto
```bash
curl -X GET http://localhost:3001/api/projects/uuid-progetto/export \
  -o backup-progetto.json
```

## Logging e Debugging

Il server logga le seguenti informazioni:
- Richieste HTTP in ingresso
- Operazioni Redis (successo/fallimento)
- Errori di validazione
- Health check periodici

Per debugging, impostare `NODE_ENV=development` per logs più dettagliati.

## Troubleshooting

### Errore "Redis connection failed"
- Verificare che Redis sia in esecuzione: `redis-cli ping`
- Controllare l'URL Redis nelle variabili d'ambiente
- Verificare la connettività di rete al container Redis

### Errore "Project not found"
- Verificare che l'ID progetto sia corretto
- Controllare se il progetto esiste in Redis: `redis-cli GET project:<id>`

### Performance Issues
- Monitorare l'utilizzo memoria Redis: `redis-cli INFO memory`
- Considerare la pulizia di progetti non utilizzati
- Verificare le dimensioni dei progetti (>10MB potrebbero essere problematici)

### Backup Corrotto
- Verificare che il JSON sia valido
- Controllare che tutti i campi obbligatori siano presenti
- Usare `jq` per validare il formato: `cat backup.json | jq .`

## Monitoraggio

### Statistiche
```bash
curl http://localhost:3001/api/stats
```

### Memoria Redis
```bash
redis-cli INFO memory
```

## Sicurezza

**Note di Sicurezza:**
- Il server attualmente non implementa autenticazione
- Tutti i progetti sono accessibili pubblicamente
- Non c'è validazione avanzata degli input
- Redis non è protetto da password

**Raccomandazioni per Produzione:**
- Implementare autenticazione JWT
- Aggiungere validazione input rigorosa
- Configurare Redis con autenticazione
- Utilizzare HTTPS in produzione
- Implementare rate limiting

## Sviluppo

### Test API
Usare il file `test-api.http` per testare gli endpoint (compatibile con VS Code REST Client).

### Struttura Codice
- `server.js` - Server Express principale
- `package.json` - Dipendenze e scripts
- `Dockerfile` - Configurazione container
- `README.md` - Questa documentazione

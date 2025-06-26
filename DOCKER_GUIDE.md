# Guida all'Installazione e Configurazione Docker

## Configurazione Iniziale

1. **Prerequisiti**:
   - Docker e Docker Compose installati
   - Accesso al database PostgreSQL remoto

2. **Configurazione**:
   ```bash
   ./docker-manage.sh setup
   ./docker-manage.sh start
   ```

## Configurazione Database

Le credenziali del database sono preconfigurate nel file `.env`:
```ini
POSTGRES_HOST=192.168.129.14
POSTGRES_PORT=5432
POSTGRES_USER=nugh75
POSTGRES_PASSWORD=Clasimdansim2025
POSTGRES_DB=mydatabase
```

## Comandi Principali

| Comando         | Descrizione                                  |
|-----------------|---------------------------------------------|
| `start`         | Avvia tutti i servizi                       |
| `stop`          | Arresta tutti i servizi                     |
| `restart`       | Riavvia i servizi                           |
| `rebuild-safe`  | Ricostruisce l'app preservando i dati       |
| `logs`          | Mostra i log dei container                  |
| `backup`        | Crea un backup manuale dei dati             |
| `restore`       | Ripristina da backup                        |

## Risoluzione Problemi

**Problema**: Connessione al database fallita
- Verificare:
  - Le credenziali in `.env`
  - La connettività di rete all'host 192.168.129.14
  - Che il servizio PostgreSQL sia attivo

**Problema**: Errori di avvio
- Verificare i log con:
  ```bash
  ./docker-manage.sh logs
  ```

## Manutenzione

1. **Aggiornamento**:
   ```bash
   ./docker-manage.sh update
   ```

2. **Pulizia completa** (ATTENZIONE: Cancella tutti i dati):
   ```bash
   ./docker-manage.sh clean
   ```

## Note Importanti

- I dati vengono salvati nella directory `./data`
- I backup automatici vengono salvati in `./backups`
- Per modifiche alla configurazione, editare il file `.env`

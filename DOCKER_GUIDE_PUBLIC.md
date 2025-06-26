# Guida Pubblica all'Installazione Docker

## Configurazione Iniziale

1. Copiare il file .env.example:
```bash
cp .env.example .env
```

2. Modificare .env con le proprie credenziali

## Configurazione Database

Esempio di configurazione (sostituire con i propri valori):
```ini
POSTGRES_HOST=your_database_host
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
```

## Comandi Base

```bash
# Avvio servizi
./docker-manage.sh start

# Visualizzazione log
./docker-manage.sh logs
```

## Sicurezza
- Non condividere mai il file .env
- Utilizzare password complesse
- Limitare gli accessi al database

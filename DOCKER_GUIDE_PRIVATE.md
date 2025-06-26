# Guida Privata all'Installazione Docker (Interna)

## Configurazione Database

Credenziali effettive del database (NON CONDIVIDERE):

```ini
POSTGRES_HOST=192.168.129.14
POSTGRES_PORT=5432
POSTGRES_USER=nugh75
POSTGRES_PASSWORD=Clasimdansim2025
POSTGRES_DB=anatema-db
```

## Comandi Gestione

```bash
# Avvio con credenziali reali
./docker-manage.sh start

# Backup manuale
./docker-manage.sh backup
```

## Troubleshooting

Per problemi di connessione al database:
1. Verificare le credenziali in `.env`
2. Controllare la connettività a 192.168.129.14:5432
3. Verificare che il servizio PostgreSQL sia attivo

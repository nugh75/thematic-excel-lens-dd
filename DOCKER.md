# 🐳 Docker Setup - Anatema

Questo progetto include una configurazione Docker completa per la distribuzione e lo sviluppo dell'applicazione Anatema.

## 🚀 Quick Start

### 1. Configurazione Iniziale
```bash
# Configurazione iniziale (crea directory e file di configurazione)
./docker-manage.sh setup
```

### 2. Configurazione Ambiente
Modifica il file `.env` con le tue configurazioni:
```bash
nano .env
```

### 3. Build e Avvio
```bash
# Build dell'applicazione
./docker-manage.sh build

# Avvio dei servizi
./docker-manage.sh start
```

L'applicazione sarà disponibile su: **http://localhost:3000**

## 📁 Struttura dei Volumi

### Volumi Persistenti
- `./data/` - Dati dell'applicazione (progetti, etichette, configurazioni)
- `./redis-data/` - Cache Redis e dati di sessione
- `./logs/` - Log di Nginx
- `./backups/` - Backup automatici e manuali

### Caratteristiche
- ✅ **Persistenza dati**: I dati sopravvivono ai restart dei container
- ✅ **Backup automatico**: Backup giornaliero configurabile
- ✅ **Backup manuale**: Comando per backup on-demand
- ✅ **Restore**: Ripristino da backup esistenti

## 🛠️ Comandi Disponibili

### Gestione Produzione
```bash
./docker-manage.sh start     # Avvio servizi
./docker-manage.sh stop      # Arresto servizi
./docker-manage.sh restart   # Riavvio servizi
./docker-manage.sh status    # Status servizi
```

### Gestione Sviluppo
```bash
./docker-manage.sh dev       # Avvio ambiente sviluppo
./docker-manage.sh dev-stop  # Arresto ambiente sviluppo
```

### Backup e Restore
```bash
./docker-manage.sh backup                    # Backup manuale
./docker-manage.sh restore backup_file.tar.gz  # Restore da backup
```

### Monitoring e Debug
```bash
./docker-manage.sh logs                      # Tutti i logs
./docker-manage.sh logs anatema  # Logs app
./docker-manage.sh logs redis               # Logs Redis
```

### Manutenzione
```bash
./docker-manage.sh update    # Aggiornamento completo
./docker-manage.sh clean     # Pulizia completa (ATTENZIONE!)
```

## ⚙️ Configurazione

### Variabili d'Ambiente Principali

#### Applicazione
```env
APP_PORT=3000                    # Porta dell'applicazione
VITE_APP_NAME=Anatema  # Nome dell'app
VITE_MAX_FILE_SIZE=50MB         # Dimensione massima file
VITE_AUTO_SAVE_INTERVAL=30000   # Auto-save (millisecondi)
```

#### Volumi e Percorsi
```env
DATA_PATH=./data               # Percorso dati app
REDIS_DATA_PATH=./redis-data   # Percorso dati Redis
```

#### Backup
```env
BACKUP_INTERVAL=86400          # Intervallo backup (secondi)
BACKUP_RETENTION=7             # Numero backup da mantenere
```

### Configurazione Redis (Opzionale)
```env
REDIS_PORT=6379                # Porta Redis
REDIS_PASSWORD=secure_password  # Password Redis
```

## 🏗️ Architettura

### Servizi Inclusi

#### 1. **anatema** (Applicazione Principale)
- **Base**: Nginx + App React buildato
- **Porta**: 3000 (configurabile)
- **Volumi**: Dati app, logs
- **Features**: Gzip, cache, routing SPA

#### 2. **redis** (Cache e Sessioni)
- **Base**: Redis 7 Alpine
- **Porta**: 6379 (configurabile)
- **Volumi**: Dati persistenti
- **Features**: AOF, autenticazione

#### 3. **backup** (Backup Automatico)
- **Base**: Alpine Linux
- **Funzione**: Backup automatico e pulizia
- **Schedule**: Configurabile (default 24h)
- **Features**: Rotazione backup, compression

### Rete
- **Rete personalizzata**: `thematic_network`
- **Subnet**: 172.20.0.0/16
- **Comunicazione**: Container-to-container sicura

## 🔒 Sicurezza

### Headers di Sicurezza
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

### Isolamento
- Container isolati in rete dedicata
- Volumi con permessi appropriati
- Password Redis configurabile

## 📊 Monitoring

### Health Checks
- **App**: GET /health ogni 30s
- **Redis**: Ping interno
- **Backup**: Verifica automatica

### Logs
```bash
# Logs in tempo reale
docker-compose logs -f

# Logs specifici
docker-compose logs nginx
docker-compose logs redis
```

## 🚧 Sviluppo

### Ambiente di Sviluppo
```bash
# Avvio ambiente sviluppo con hot reload
./docker-manage.sh dev
```

**Caratteristiche sviluppo:**
- Hot reload del codice
- Porta separata (8081)
- Volume mount del codice sorgente
- Redis dedicato per sviluppo

### Debug
```bash
# Accesso al container
docker exec -it anatema-app sh

# Controllo configurazione
docker exec anatema-app cat /usr/share/nginx/html/config.js
```

## 📈 Scaling

### Scaling Orizzontale
```bash
# Scala l'applicazione a 3 istanze
docker-compose up -d --scale anatema=3
```

### Load Balancer (Opzionale)
Aggiungi un load balancer (nginx-proxy, traefik) per distribuire il traffico.

## 🔄 Backup e Disaster Recovery

### Backup Automatico
- **Frequenza**: Configurabile (default 24h)
- **Retention**: Configurabile (default 7 backup)
- **Formato**: tar.gz compresso
- **Posizione**: ./backups/

### Backup Manuale
```bash
./docker-manage.sh backup
```

### Restore
```bash
./docker-manage.sh restore backups/backup_20241223_120000.tar.gz
```

### Disaster Recovery
1. **Backup dati**: Copia `./data/` e `./redis-data/`
2. **Backup configurazione**: Copia `.env` e `docker-compose.yml`
3. **Restore**: Ripristina file e esegui `./docker-manage.sh start`

## ⚡ Performance

### Ottimizzazioni Incluse
- **Gzip compression**: Riduce banda
- **Cache statico**: Assets cachati 1 anno
- **Multi-stage build**: Immagini ottimizzate
- **Resource limits**: Limiti memoria/CPU configurabili

### Monitoring Performance
```bash
# Uso risorse container
docker stats

# Spazio volumi
docker system df
```

## 🐛 Troubleshooting

### Problemi Comuni

#### Container non si avvia
```bash
# Controlla logs
./docker-manage.sh logs

# Verifica configurazione
docker-compose config
```

#### Dati persi
```bash
# Controlla volumi
docker volume ls

# Verifica mount points
docker inspect anatema-app
```

#### Permessi
```bash
# Fix permessi dati
sudo chown -R $USER:$USER ./data ./redis-data
```

### Reset Completo
```bash
# ATTENZIONE: Rimuove tutto!
./docker-manage.sh clean
./docker-manage.sh setup
./docker-manage.sh build
./docker-manage.sh start
```

## 📞 Supporto

Per problemi o domande:
1. Controlla i logs: `./docker-manage.sh logs`
2. Verifica la configurazione: `docker-compose config`
3. Consulta la documentazione Docker
4. Apri un issue su GitHub

---

**🎉 Anatema è ora pronto per la produzione con Docker!**

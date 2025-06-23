#!/bin/bash

# Script di gestione per Thematic Excel Lens Docker

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzioni di utilità
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Controlla se Docker è installato
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker non è installato. Installa Docker prima di continuare."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose non è installato. Installa Docker Compose prima di continuare."
        exit 1
    fi
}

# Crea le directory necessarie
setup_directories() {
    log_info "Creazione directory necessarie..."
    
    mkdir -p data
    mkdir -p redis-data
    mkdir -p logs
    mkdir -p backups
    mkdir -p dev-data
    
    log_success "Directory create con successo"
}

# Copia file di configurazione
setup_config() {
    if [ ! -f ".env" ]; then
        log_info "Copia del file di configurazione..."
        cp .env.docker .env
        log_warning "File .env creato da .env.docker. Modifica le configurazioni secondo le tue necessità."
    else
        log_info "File .env già esistente"
    fi
}

# Build dell'applicazione
build() {
    log_info "Build dell'applicazione Docker..."
    docker-compose build --no-cache
    log_success "Build completata con successo"
}

# Avvio dei servizi
start() {
    log_info "Avvio dei servizi..."
    docker-compose up -d
    log_success "Servizi avviati con successo"
    
    echo ""
    # Leggi IP e porta dal file di configurazione
    APP_HOST=$(grep "^APP_HOST=" .env.docker 2>/dev/null | cut -d'=' -f2) || APP_HOST="localhost"
    APP_PORT=$(grep "^APP_PORT=" .env.docker 2>/dev/null | cut -d'=' -f2) || APP_PORT="8655"
    
    log_info "🌐 Applicazione disponibile su: http://${APP_HOST}:${APP_PORT}"
    log_info "📊 Redis disponibile su: ${APP_HOST}:${REDIS_PORT:-6379}"
}

# Stop dei servizi
stop() {
    log_info "Arresto dei servizi..."
    docker-compose down
    log_success "Servizi arrestati con successo"
}

# Restart dei servizi
restart() {
    stop
    start
}

# Rebuild dell'applicazione (produzione)
rebuild() {
    log_info "Rebuild dell'applicazione (produzione)..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    log_success "Rebuild completato con successo"
    
    echo ""
    # Leggi IP e porta dal file di configurazione
    APP_HOST=$(grep "^APP_HOST=" .env.docker 2>/dev/null | cut -d'=' -f2) || APP_HOST="localhost"
    APP_PORT=$(grep "^APP_PORT=" .env.docker 2>/dev/null | cut -d'=' -f2) || APP_PORT="8655"
    
    log_info "🌐 Applicazione disponibile su: http://${APP_HOST}:${APP_PORT}"
}

# Rebuild dell'ambiente di sviluppo
rebuild_dev() {
    log_info "Rebuild dell'ambiente di sviluppo..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    log_success "Rebuild ambiente di sviluppo completato"
    
    echo ""
    # Ottieni l'IP dell'host
    HOST_IP=$(hostname -I | awk '{print $1}' 2>/dev/null) || HOST_IP="localhost"
    
    log_info "🚀 Applicazione di sviluppo disponibile su: http://${HOST_IP}:${DEV_PORT:-8081}"
}

# Avvio in modalità sviluppo
dev() {
    log_info "Avvio in modalità sviluppo..."
    docker-compose -f docker-compose.dev.yml up -d
    log_success "Ambiente di sviluppo avviato"
    
    echo ""
    # Ottieni l'IP dell'host
    HOST_IP=$(hostname -I | awk '{print $1}' 2>/dev/null) || HOST_IP="localhost"
    
    log_info "🚀 Applicazione di sviluppo disponibile su: http://${HOST_IP}:${DEV_PORT:-8081}"
}

# Stop ambiente di sviluppo
dev_stop() {
    log_info "Arresto ambiente di sviluppo..."
    docker-compose -f docker-compose.dev.yml down
    log_success "Ambiente di sviluppo arrestato"
}

# Visualizza logs
logs() {
    local service=${1:-thematic-excel-lens}
    log_info "Visualizzazione logs per il servizio: $service"
    docker-compose logs -f "$service"
}

# Backup manuale
backup() {
    log_info "Creazione backup manuale..."
    
    local backup_name="manual_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    if [ -d "data" ]; then
        tar -czf "backups/$backup_name" -C data .
        log_success "Backup creato: backups/$backup_name"
    else
        log_warning "Directory data non trovata"
    fi
}

# Restore da backup
restore() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "Specifica il file di backup da ripristinare"
        echo "Uso: $0 restore <file_backup>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "File di backup non trovato: $backup_file"
        exit 1
    fi
    
    log_warning "ATTENZIONE: Questo sovrascriverà tutti i dati esistenti!"
    read -p "Sei sicuro di voler continuare? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Ripristino backup..."
        
        # Stop dei servizi
        docker-compose down
        
        # Backup dei dati attuali
        if [ -d "data" ]; then
            mv data "data_backup_$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Restore
        mkdir -p data
        tar -xzf "$backup_file" -C data
        
        # Restart dei servizi
        docker-compose up -d
        
        log_success "Restore completato con successo"
    else
        log_info "Restore annullato"
    fi
}

# Pulizia completa
clean() {
    log_warning "ATTENZIONE: Questo rimuoverà tutti i container, volumi e immagini!"
    read -p "Sei sicuro di voler continuare? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Pulizia in corso..."
        
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -af
        
        log_success "Pulizia completata"
    else
        log_info "Pulizia annullata"
    fi
}

# Status dei servizi
status() {
    log_info "Status dei servizi:"
    docker-compose ps
    
    # Mostra l'URL se l'app è in esecuzione
    if docker-compose ps | grep -q "thematic-excel-lens.*Up"; then
        # Leggi IP e porta dal file di configurazione
        APP_HOST=$(grep "^APP_HOST=" .env.docker 2>/dev/null | cut -d'=' -f2) || APP_HOST="localhost"
        APP_PORT=$(grep "^APP_PORT=" .env.docker 2>/dev/null | cut -d'=' -f2) || APP_PORT="8655"
        echo ""
        log_success "🌐 Applicazione disponibile su: http://${APP_HOST}:${APP_PORT}"
    fi
}

# Aggiornamento
update() {
    log_info "Aggiornamento dell'applicazione..."
    
    # Pull delle ultime modifiche
    git pull
    
    # Rebuild e restart
    build
    restart
    
    log_success "Aggiornamento completato"
}

# Help
show_help() {
    echo "🐳 Script di gestione Thematic Excel Lens"
    echo ""
    echo "Utilizzo: $0 <comando>"
    echo ""
    echo "Comandi disponibili:"
    echo "  setup     - Configurazione iniziale"
    echo "  build     - Build dell'applicazione"
    echo "  start     - Avvio dei servizi di produzione"
    echo "  stop      - Arresto dei servizi"
    echo "  restart   - Riavvio dei servizi"
    echo "  rebuild   - Rebuild completo dell'applicazione (produzione)"
    echo "  dev       - Avvio ambiente di sviluppo"
    echo "  dev-stop  - Arresto ambiente di sviluppo"
    echo "  rebuild-dev - Rebuild completo ambiente di sviluppo"
    echo "  logs      - Visualizza logs [servizio]"
    echo "  backup    - Backup manuale dei dati"
    echo "  restore   - Restore da backup <file>"
    echo "  status    - Status dei servizi"
    echo "  update    - Aggiornamento applicazione"
    echo "  clean     - Pulizia completa (ATTENZIONE!)"
    echo "  help      - Mostra questo help"
    echo ""
    echo "Esempi:"
    echo "  $0 setup          # Configurazione iniziale"
    echo "  $0 start          # Avvio produzione"
    echo "  $0 rebuild        # Rebuild produzione"
    echo "  $0 dev            # Avvio sviluppo"
    echo "  $0 rebuild-dev    # Rebuild sviluppo"
    echo "  $0 logs redis     # Logs di Redis"
    echo "  $0 backup         # Backup manuale"
}

# Main
main() {
    check_docker
    
    case "${1:-help}" in
        setup)
            setup_directories
            setup_config
            log_success "Setup completato! Ora puoi eseguire 'build' e 'start'"
            ;;
        build)
            build
            ;;
        start)
            setup_directories
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        rebuild)
            rebuild
            ;;
        dev)
            setup_directories
            dev
            ;;
        dev-stop)
            dev_stop
            ;;
        rebuild-dev)
            rebuild_dev
            ;;
        logs)
            logs "$2"
            ;;
        backup)
            backup
            ;;
        restore)
            restore "$2"
            ;;
        status)
            status
            ;;
        update)
            update
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Comando non riconosciuto: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"

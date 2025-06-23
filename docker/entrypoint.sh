#!/bin/sh

# Script di entrypoint per gestire le variabili d'ambiente runtime

echo "🚀 Avvio Thematic Excel Lens..."

# Crea directory per i dati se non esiste
mkdir -p /app/data

# Sostituisce le variabili d'ambiente nei file JavaScript buildati
# Questo permette di usare variabili d'ambiente runtime con Vite
if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "📝 Configurazione variabili d'ambiente..."
    
    # Sostituisci le variabili d'ambiente nell'HTML
    sed -i "s|__VITE_APP_NAME__|${VITE_APP_NAME:-Thematic Excel Lens}|g" /usr/share/nginx/html/index.html
    sed -i "s|__VITE_API_URL__|${VITE_API_URL:-}|g" /usr/share/nginx/html/index.html
    
    # Crea un file di configurazione JavaScript runtime
    cat > /usr/share/nginx/html/config.js << EOF
window.__APP_CONFIG__ = {
    APP_NAME: "${VITE_APP_NAME:-Thematic Excel Lens}",
    API_URL: "${VITE_API_URL:-}",
    MAX_FILE_SIZE: "${VITE_MAX_FILE_SIZE:-50MB}",
    ALLOWED_FILE_TYPES: "${VITE_ALLOWED_FILE_TYPES:-xlsx,xls,csv}",
    ENABLE_ANALYTICS: ${VITE_ENABLE_ANALYTICS:-true},
    AUTO_SAVE_INTERVAL: ${VITE_AUTO_SAVE_INTERVAL:-30000},
    MAX_PROJECTS: ${VITE_MAX_PROJECTS:-10},
    MAX_LABELS: ${VITE_MAX_LABELS:-100},
    
    // Configurazione AI
    OPENROUTER_API_KEY: "${VITE_OPENROUTER_API_KEY:-}",
    OPENAI_API_KEY: "${VITE_OPENAI_API_KEY:-}",
    DEFAULT_AI_PROVIDER: "${VITE_DEFAULT_AI_PROVIDER:-openrouter}",
    DEFAULT_OPENROUTER_MODEL: "${VITE_DEFAULT_OPENROUTER_MODEL:-meta-llama/llama-3.1-8b-instruct:free}",
    DEFAULT_OPENAI_MODEL: "${VITE_DEFAULT_OPENAI_MODEL:-gpt-3.5-turbo}",
    AI_ENABLED_DEFAULT: ${VITE_AI_ENABLED_DEFAULT:-true}
};
EOF
    
    echo "✅ Configurazione completata!"
fi

# Imposta i permessi corretti per i volumi
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

# Log delle variabili d'ambiente (senza password/chiavi)
echo "🔧 Configurazione attiva:"
echo "  - APP_NAME: ${VITE_APP_NAME:-Thematic Excel Lens}"
echo "  - API_URL: ${VITE_API_URL:-Non configurato}"
echo "  - MAX_FILE_SIZE: ${VITE_MAX_FILE_SIZE:-50MB}"
echo "  - ENABLE_ANALYTICS: ${VITE_ENABLE_ANALYTICS:-true}"
echo "  - AUTO_SAVE_INTERVAL: ${VITE_AUTO_SAVE_INTERVAL:-30000}ms"
echo "  - AI_PROVIDER: ${VITE_DEFAULT_AI_PROVIDER:-openrouter}"
echo "  - OPENROUTER_MODEL: ${VITE_DEFAULT_OPENROUTER_MODEL:-meta-llama/llama-3.1-8b-instruct:free}"
echo "  - OPENAI_MODEL: ${VITE_DEFAULT_OPENAI_MODEL:-gpt-3.5-turbo}"
echo "  - AI_ENABLED: ${VITE_AI_ENABLED_DEFAULT:-true}"

# Controlla se le chiavi AI sono configurate (senza mostrarle)
if [ -n "${VITE_OPENROUTER_API_KEY}" ]; then
    echo "  - OPENROUTER_API: ✅ Configurata"
else
    echo "  - OPENROUTER_API: ❌ Non configurata"
fi

if [ -n "${VITE_OPENAI_API_KEY}" ]; then
    echo "  - OPENAI_API: ✅ Configurata"
else
    echo "  - OPENAI_API: ❌ Non configurata"
fi

echo "🌐 Avvio del server web..."

# Esegui il comando passato come argomento
exec "$@"

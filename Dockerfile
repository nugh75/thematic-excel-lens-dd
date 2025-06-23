# Multi-stage build per ottimizzare le dimensioni
FROM node:18-alpine AS builder

# Installa bun se non presente
RUN npm install -g bun || echo "Fallback a npm"

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di dipendenze
COPY package.json ./
COPY bun.lockb* ./
COPY package-lock.json* ./

# Installa le dipendenze con fallback
RUN if [ -f "bun.lockb" ] && command -v bun >/dev/null 2>&1; then \
        echo "Usando bun per installare dipendenze..."; \
        bun install --frozen-lockfile; \
    else \
        echo "Usando npm per installare dipendenze..."; \
        npm ci --only=production || npm install --production; \
    fi

# Copia il codice sorgente
COPY . .

# Build dell'applicazione per produzione con fallback
RUN if command -v bun >/dev/null 2>&1; then \
        echo "Building con bun..."; \
        bun run build; \
    else \
        echo "Building con npm..."; \
        npm run build; \
    fi

# Stage di produzione
FROM nginx:alpine AS production

# Copia la configurazione nginx personalizzata
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file buildati dal stage precedente
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia script di entrypoint per gestire le variabili d'ambiente
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Espone la porta 80
EXPOSE 80

# Entrypoint che gestisce le env vars
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

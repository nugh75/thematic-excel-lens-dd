# Dockerfile per API Server
FROM node:18-alpine

WORKDIR /app

# Copia package.json e installa dipendenze
COPY package*.json ./
RUN npm install --omit=dev

# Copia il codice sorgente
COPY . .

# Crea utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Esponi la porta
EXPOSE 3001

# Avvia l'applicazione
CMD ["npm", "start"]

# Fase di build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Fase di produzione
FROM node:18-alpine
WORKDIR /app

# Copia da builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Esponi la porta e avvia l'applicazione
EXPOSE 3001
CMD ["npm", "start"]

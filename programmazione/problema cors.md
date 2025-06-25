# Istruzioni per l’esposizione di **api-anatema.ai4educ.org** tramite Cloudflare Tunnel

> Obiettivo: rendere raggiungibile l’API in produzione, eliminando gli errori CORS/NetworkError e garantendo lo stato *healthy* dei container.

---

## 1  Verifica e configurazione del container *anatema-api*

1. **Controllo porte interne**

   ```bash
   docker inspect -f '{{ .Config.ExposedPorts }}' anatema-api
   ```
   Se l’output contiene `3001/tcp`, mappare la porta host **3007**:

   ```yaml
   # estratto docker-compose.yml
   services:
     anatema-api:
       ports:
         - "3007:3001"  # HOST:CONTAINER
   ```

---

## 2  Verifica delle porte esposte sull’host

```bash
sudo lsof -i -P -n | grep LISTEN | grep 3007
```
L’output deve mostrare **docker-proxy** in ascolto su `0.0.0.0:3007`.

---

## 3  Configurazione del tunnel Cloudflare

File `~/.cloudflared/config.yml` (oppure Dashboard → **Networks › Tunnels**):

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /home/ubuntu/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api-anatema.ai4educ.org
    service: http://192.168.129.14:3007
  - service: http_status:404
```

Poi riavviare e associare il record DNS:

```bash
sudo systemctl restart cloudflared
cloudflared tunnel route dns <TUNNEL_ID> api-anatema.ai4educ.org
```

> *Nota*: l’IP `192.168.129.14` è l’host Docker nella rete locale; adattarlo se cambia.

---

## 4  Header CORS dell’API

Se il front-end resta su `https://anatema.ai4educ.org`:

```
Access-Control-Allow-Origin: https://anatema.ai4educ.org
Access-Control-Allow-Credentials: true
Vary: Origin
```

*Backend Express.js esempio*
```js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://anatema.ai4educ.org');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  return req.method === 'OPTIONS' ? res.sendStatus(204) : next();
});
```

In alternativa, aggiungere una **Transform Rule** su Cloudflare → Rules → Transform Rules → *Modify Response Header*.

---

## 5  Aggiornamento del front-end

1. Impostare la variabile d’ambiente di build:

   ```bash
   export REACT_APP_API_URL="https://api-anatema.ai4educ.org"
   yarn build   # o npm run build
   docker compose up -d --build anatema-app
   ```

2. Incrementare la *cache-busting version* o forzare un refresh del browser.

---

## 6  Gestione dello storage offline

* Pulire la coda se supera la quota:

   ```js
   if (localStorage.length > 0) localStorage.clear();
   ```
* Implementare un flush periodico o comprimere le entry prima di salvarle.

---

## 7  Checklist finale

- [ ] Container *anatema-api* e *anatema-app* in stato **healthy**.
- [ ] Porta host **3007** in listening.
- [ ] Record DNS e tunnel attivi per `api-anatema.ai4educ.org`.
- [ ] Chiamate front-end → API puntano a `https://api-anatema.ai4educ.org`.
- [ ] Header CORS restituiti correttamente.
- [ ] Nessun errore CORS/NetworkError nella console.

---

**Conclusione**

Rialliniando porte, health-check, tunnel Cloudflare e variabili d’ambiente, l’endpoint `api-anatema.ai4educ.org` diventa pienamente operativo e le richieste dal front-end vengono risolte senza errori di rete o di sicurezza.
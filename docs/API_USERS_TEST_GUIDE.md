# Guida test API utenti (backend Anatema)

## 1. Login (ottieni token JWT)
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"NOME_UTENTE","password":"PASSWORD"}'
```
Risposta:
```json
{ "token": "JWT...", "user": { ... } }
```

## 2. Lista utenti (solo admin, serve token)
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer JWT_TOKEN"
```

## 3. Crea utente (solo admin)
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"nuovo","email":"mail@esempio.it","password":"password","role":"user"}'
```

## 4. Modifica utente (solo admin)
```bash
curl -X PUT http://localhost:3001/api/users/ID_UTENTE \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"modificato","email":"nuova@mail.it","role":"admin"}'
```

## 5. Elimina utente (solo admin)
```bash
curl -X DELETE http://localhost:3001/api/users/ID_UTENTE \
  -H "Authorization: Bearer JWT_TOKEN"
```

---

**Nota:**
- Sostituisci `JWT_TOKEN` con il token ottenuto dal login.
- Sostituisci `ID_UTENTE` con l'id reale dell'utente.
- Tutte le operazioni CRUD utenti sono riservate agli admin.

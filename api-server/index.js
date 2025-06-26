require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.API_PORT || 3001;

// Configurazione connessione PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Endpoint per le etichette
app.get('/api/labels', async (req, res) => {
  console.log('GET /api/labels chiamato');
  try {
    const result = await pool.query('SELECT * FROM labels');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching labels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/labels', async (req, res) => {
  console.log('POST /api/labels chiamato, dati:', req.body);
  const { name, description, color } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO labels (id, name, description, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [uuidv4(), name, description, color]
    );
    console.log('Label creata:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating label:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per gli utenti
app.get('/api/users', async (req, res) => {
  console.log('GET /api/users chiamato');
  try {
    const result = await pool.query('SELECT * FROM users');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  console.log('POST /api/users chiamato, dati:', req.body);
  const { username, email, password_hash } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (id, username, email, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [uuidv4(), username, email, password_hash]
    );
    console.log('Utente creato:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per i progetti
app.get('/api/projects', async (req, res) => {
  console.log('GET /api/projects chiamato');
  try {
    const result = await pool.query('SELECT * FROM projects');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  console.log('POST /api/projects chiamato, dati:', req.body);
  const { name, description, owner_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (id, name, description, owner_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [uuidv4(), name, description, owner_id]
    );
    console.log('Progetto creato:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per i file
app.get('/api/files', async (req, res) => {
  console.log('GET /api/files chiamato');
  try {
    const result = await pool.query('SELECT * FROM files');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/files', async (req, res) => {
  console.log('POST /api/files chiamato, dati:', req.body);
  const { project_id, filename, uploader_id, original_name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO files (id, project_id, filename, uploaded_at, uploader_id, original_name) VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *',
      [uuidv4(), project_id, filename, uploader_id, original_name]
    );
    console.log('File creato:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per i fogli Excel
app.get('/api/excel_sheets', async (req, res) => {
  console.log('GET /api/excel_sheets chiamato');
  try {
    const result = await pool.query('SELECT * FROM excel_sheets');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching excel_sheets:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/excel_sheets', async (req, res) => {
  console.log('POST /api/excel_sheets chiamato, dati:', req.body);
  const { file_id, name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO excel_sheets (id, file_id, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [uuidv4(), file_id, name]
    );
    console.log('Foglio creato:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating excel_sheet:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per le colonne Excel
app.get('/api/excel_columns', async (req, res) => {
  console.log('GET /api/excel_columns chiamato');
  try {
    const result = await pool.query('SELECT * FROM excel_columns');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching excel_columns:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/excel_columns', async (req, res) => {
  console.log('POST /api/excel_columns chiamato, dati:', req.body);
  const { sheet_id, name, index } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO excel_columns (id, sheet_id, name, index, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [uuidv4(), sheet_id, name, index]
    );
    console.log('Colonna creata:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating excel_column:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per le righe Excel
app.get('/api/excel_rows', async (req, res) => {
  console.log('GET /api/excel_rows chiamato');
  try {
    const result = await pool.query('SELECT * FROM excel_rows');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching excel_rows:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/excel_rows', async (req, res) => {
  console.log('POST /api/excel_rows chiamato, dati:', req.body);
  const { sheet_id, index } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO excel_rows (id, sheet_id, index, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [uuidv4(), sheet_id, index]
    );
    console.log('Riga creata:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating excel_row:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint per le celle Excel
app.get('/api/excel_cells', async (req, res) => {
  console.log('GET /api/excel_cells chiamato');
  try {
    const result = await pool.query('SELECT * FROM excel_cells');
    console.log('Risultato:', result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching excel_cells:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/excel_cells', async (req, res) => {
  console.log('POST /api/excel_cells chiamato, dati:', req.body);
  const { row_id, column_id, value } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO excel_cells (id, row_id, column_id, value, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [uuidv4(), row_id, column_id, value]
    );
    console.log('Cella creata:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating excel_cell:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Avvio server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

// Gestione chiusura
process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});

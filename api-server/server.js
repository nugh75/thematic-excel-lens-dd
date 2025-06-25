const express = require('express');
const cors = require('cors');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.API_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Configurazione middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connessione Redis
const redisClient = redis.createClient({
  url: REDIS_URL,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Il server Redis ha rifiutato la connessione');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Timeout tentativi di riconnessione Redis');
    }
    if (options.attempt > 10) {
      return new Error('Troppi tentativi di riconnessione Redis');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('error', (err) => {
  console.error('Errore Redis:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connesso a Redis');
});

// Inizializza connessione Redis
redisClient.connect().catch(console.error);

// Utility per le chiavi Redis
const getProjectKey = (projectId) => `project:${projectId}`;
const getUserProjectsKey = (userId) => `user:${userId}:projects`;
const getGlobalProjectsKey = () => 'projects:global';

// ================== API ENDPOINTS ==================

// Lista tutti i progetti
app.get('/api/projects', async (req, res) => {
  try {
    const projectIds = await redisClient.sMembers(getGlobalProjectsKey());
    const projects = [];
    
    for (const projectId of projectIds) {
      const projectData = await redisClient.get(getProjectKey(projectId));
      if (projectData) {
        const project = JSON.parse(projectData);
        projects.push({
          id: project.id,
          name: project.name,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          description: project.description,
          // Solo metadati, non i dati completi per performance
          dataInfo: {
            hasData: !!project.excelData,
            rowCount: project.excelData?.rows?.length || 0,
            columnCount: project.excelData?.headers?.length || 0,
            labelsCount: project.labels?.length || 0,
            cellLabelsCount: project.cellLabels?.length || 0
          }
        });
      }
    }
    
    res.json({ projects });
  } catch (error) {
    console.error('Errore recupero progetti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Ottieni un progetto specifico
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectData = await redisClient.get(getProjectKey(projectId));
    
    if (!projectData) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }
    
    const project = JSON.parse(projectData);
    res.json({ project });
  } catch (error) {
    console.error('Errore recupero progetto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Crea un nuovo progetto
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, excelData, config } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome progetto richiesto' });
    }
    
    const projectId = uuidv4();
    const now = new Date().toISOString();
    
    const project = {
      id: projectId,
      name,
      description: description || '',
      createdAt: now,
      updatedAt: now,
      excelData: excelData || null,
      config: config || { columnMetadata: [] },
      labels: [],
      cellLabels: [],
      rowLabels: [],
      sessions: []
    };
    
    // Salva il progetto
    await redisClient.set(getProjectKey(projectId), JSON.stringify(project));
    
    // Aggiungi alla lista globale dei progetti
    await redisClient.sAdd(getGlobalProjectsKey(), projectId);
    
    res.status(201).json({ project });
  } catch (error) {
    console.error('Errore creazione progetto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Aggiorna un progetto esistente
app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;
    
    const existingData = await redisClient.get(getProjectKey(projectId));
    if (!existingData) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }
    
    const project = JSON.parse(existingData);
    
    // Aggiorna i campi forniti
    const updatedProject = {
      ...project,
      ...updates,
      id: projectId, // Non permettere di cambiare l'ID
      updatedAt: new Date().toISOString()
    };
    
    await redisClient.set(getProjectKey(projectId), JSON.stringify(updatedProject));
    
    res.json({ project: updatedProject });
  } catch (error) {
    console.error('Errore aggiornamento progetto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Elimina un progetto
app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const deleted = await redisClient.del(getProjectKey(projectId));
    if (deleted === 0) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }
    
    // Rimuovi dalla lista globale
    await redisClient.sRem(getGlobalProjectsKey(), projectId);
    
    res.json({ message: 'Progetto eliminato con successo' });
  } catch (error) {
    console.error('Errore eliminazione progetto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Import progetto da backup
app.post('/api/projects/import', async (req, res) => {
  try {
    const { backupData, generateNewId = true } = req.body;
    
    if (!backupData || !backupData.project) {
      return res.status(400).json({ error: 'Dati di backup non validi' });
    }
    
    const projectId = generateNewId ? uuidv4() : backupData.project.id;
    const now = new Date().toISOString();
    
    const project = {
      ...backupData.project,
      id: projectId,
      updatedAt: now,
      // Mantieni la data di creazione originale se presente
      createdAt: backupData.project.createdAt || now
    };
    
    // Salva il progetto
    await redisClient.set(getProjectKey(projectId), JSON.stringify(project));
    
    // Aggiungi alla lista globale
    await redisClient.sAdd(getGlobalProjectsKey(), projectId);
    
    res.status(201).json({ project });
  } catch (error) {
    console.error('Errore import progetto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Export backup di un progetto
app.get('/api/projects/:projectId/export', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectData = await redisClient.get(getProjectKey(projectId));
    
    if (!projectData) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }
    
    const project = JSON.parse(projectData);
    
    const backupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      project,
      metadata: {
        source: 'anatema-server',
        projectId,
        description: `Backup completo del progetto "${project.name}"`
      }
    };
    
    res.json({ backupData });
  } catch (error) {
    console.error('Errore export progetto:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Statistiche generali
app.get('/api/stats', async (req, res) => {
  try {
    const projectIds = await redisClient.sMembers(getGlobalProjectsKey());
    const totalProjects = projectIds.length;
    
    let totalLabels = 0;
    let totalCellLabels = 0;
    let totalRows = 0;
    
    for (const projectId of projectIds.slice(0, 100)) { // Limita per performance
      const projectData = await redisClient.get(getProjectKey(projectId));
      if (projectData) {
        const project = JSON.parse(projectData);
        totalLabels += project.labels?.length || 0;
        totalCellLabels += project.cellLabels?.length || 0;
        totalRows += project.excelData?.rows?.length || 0;
      }
    }
    
    res.json({
      totalProjects,
      totalLabels,
      totalCellLabels,
      totalRows,
      serverUptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Errore recupero statistiche:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error('Errore non gestito:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Avvio server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server avviato su porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API: http://localhost:${PORT}/api/projects`);
});

// Gestione chiusura graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM ricevuto, chiusura server...');
  if (redisClient.isReady) {
    await redisClient.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT ricevuto, chiusura server...');
  if (redisClient.isReady) {
    await redisClient.quit();
  }
  process.exit(0);
});

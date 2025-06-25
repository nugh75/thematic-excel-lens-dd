# Piano di Riscrittura del Sistema Progetti

## Problema Identificato
- Errore `TypeError: k is undefined` quando si interagisce con la sezione Progetti
- Accessi non sicuri a proprietà di oggetti non definiti
- Problemi di tipizzazione TypeScript con `project.excelData`

## Obiettivi
1. **Eliminare completamente gli errori TypeError**
2. **Implementare null safety robusto**
3. **Migliorare la tipizzazione TypeScript**
4. **Semplificare la logica di rendering**
5. **Aggiungere fallback appropriati**

## Piano di Azione

### Fase 1: Analisi e Preparazione
- [x] Identificare tutti gli accessi non sicuri a `excelData`
- [x] Mappare le dipendenze del componente ProjectManager
- [ ] Creare nuovi tipi TypeScript più sicuri

### Fase 2: Riscrittura Componente ProjectManager
- [ ] Creare nuovo componente `ProjectManagerNew.tsx`
- [ ] Implementare null safety completo
- [ ] Aggiungere controlli defensivi per tutti gli accessi alle proprietà
- [ ] Migliorare la gestione degli stati di caricamento
- [ ] Implementare fallback UI per dati mancanti

### Fase 3: Refactoring Store e Tipi
- [ ] Aggiornare i tipi nel `analysisStore`
- [ ] Implementare controlli di sicurezza nelle funzioni del store
- [ ] Aggiungere validazione dei dati prima del rendering

### Fase 4: Testing e Sostituzione
- [ ] Testare il nuovo componente in isolamento
- [ ] Sostituire gradualmente il vecchio componente
- [ ] Verificare che non ci siano più errori TypeError

## Strategia di Implementazione

### 1. Tipi TypeScript Sicuri
```typescript
interface SafeProject {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  lastModified: number;
  createdBy: string;
  collaborators: string[];
  labels: Label[];
  cellLabels: CellLabel[];
  rowLabels: RowLabel[];
  // excelData è opzionale e ben tipizzato
  excelData?: {
    fileName: string;
    headers: string[];
    rows: any[][];
  };
}
```

### 2. Funzioni Helper per Null Safety
```typescript
const getProjectFileName = (project: SafeProject): string => {
  return project.excelData?.fileName || 'File non disponibile';
};

const getProjectDimensions = (project: SafeProject): string => {
  const rows = project.excelData?.rows?.length || 0;
  const cols = project.excelData?.headers?.length || 0;
  return `${rows} righe × ${cols} colonne`;
};
```

### 3. Componenti Defensivi
- Ogni sezione del componente avrà controlli di esistenza
- Fallback UI per dati mancanti
- Loading states appropriati
- Error boundaries per catturare errori residui

### 4. Struttura del Nuovo Componente
```
ProjectManagerNew/
├── ProjectManagerNew.tsx (componente principale)
├── ProjectCard.tsx (card singolo progetto)
├── ProjectDetails.tsx (dettagli progetto)
├── CollaboratorManager.tsx (gestione collaboratori)
├── types.ts (tipi sicuri)
└── utils.ts (funzioni helper)
```

## Checklist di Sicurezza
- [ ] Tutti gli accessi a proprietà sono con optional chaining (`?.`)
- [ ] Tutti i mapping array hanno controlli di esistenza
- [ ] Tutti i rendering condizionali hanno fallback
- [ ] Nessun accesso diretto a proprietà nidificate senza controlli
- [ ] Tutte le funzioni hanno gestione degli errori
- [ ] Stati di loading per tutte le operazioni asincrone

## Milestone
1. **M1**: Completamento nuovi tipi e helper functions
2. **M2**: Implementazione ProjectManagerNew
3. **M3**: Testing e debugging
4. **M4**: Sostituzione componente originale
5. **M5**: Pulizia e ottimizzazione

## Test di Validazione
- [ ] Caricamento pagina progetti senza errori
- [ ] Click su progetti senza TypeError
- [ ] Apertura dialog dettagli senza errori
- [ ] Gestione collaboratori funzionante
- [ ] Operazioni CRUD progetti sicure

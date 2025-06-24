import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  Settings, 
  BarChart3, 
  Users, 
  MessageSquare, 
  List,
  CheckCircle2,
  AlertCircle,
  Brain,
  Target,
  Layers
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnClassification, ColumnMetadata, ColumnType } from '../types/analysis';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import MultiSelectColumnList from './MultiSelectColumnList';
import BatchClassificationWizard from './BatchClassificationWizard';
import { ClassificationSelector } from './ClassificationSelector';

/**
 * Componente principale per la configurazione e classificazione delle colonne
 * - HUB unificato per tutti i tipi di classificazione
 * - Sistema gerarchico: anagrafica/non_anagrafica → chiusa/aperta → categorie specifiche
 * - Modalità singola e batch integrate
 * - Migrazione automatica dal vecchio sistema ColumnType
 */
export default function ColumnConfiguration() {
  const { 
    currentProject, 
    updateColumnMetadata, 
    bulkClassifyColumns,
    configureColumns 
  } = useAnalysisStore();
  const { toast } = useToast();
  
  // State per modalità singola
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [currentClassification, setCurrentClassification] = useState<ColumnClassification | null>(null);
  const [description, setDescription] = useState('');

  // State per modalità batch
  const [batchMode, setBatchMode] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set());
  const [showBatchWizard, setShowBatchWizard] = useState(false);

  const columnMetadata = currentProject?.config?.columnMetadata || [];
  const hasData = currentProject?.excelData && currentProject.excelData.rows.length > 0;

  // Migra automaticamente ColumnType legacy a ColumnClassification
  const migrateColumnType = (columnType: ColumnType): ColumnClassification => {
    switch (columnType) {
      // Demographic types → Anagrafica
      case 'demographic_age':
        return { type: 'anagrafica', subtype: 'chiusa', category: 'età', confidence: 1.0, aiGenerated: false };
      case 'demographic_gender':
        return { type: 'anagrafica', subtype: 'chiusa', category: 'genere', confidence: 1.0, aiGenerated: false };
      case 'demographic_location':
        return { type: 'anagrafica', subtype: 'aperta', category: null, confidence: 1.0, aiGenerated: false };
      case 'demographic_education':
        return { type: 'anagrafica', subtype: 'chiusa', category: 'titolo_studio', confidence: 1.0, aiGenerated: false };
      case 'demographic_profession':
        return { type: 'anagrafica', subtype: 'chiusa', category: 'professione', confidence: 1.0, aiGenerated: false };
      case 'demographic_other':
        return { type: 'anagrafica', subtype: 'aperta', category: null, confidence: 1.0, aiGenerated: false };
      
      // Closed question types → Non anagrafica + Chiusa
      case 'closed_likert':
        return { type: 'non_anagrafica', subtype: 'chiusa', category: 'scala_likert', confidence: 1.0, aiGenerated: false };
      case 'closed_numeric':
        return { type: 'non_anagrafica', subtype: 'chiusa', category: 'rating_numerico', confidence: 1.0, aiGenerated: false };
      case 'closed_singlechoice':
      case 'closed_multichoice':
        return { type: 'non_anagrafica', subtype: 'chiusa', category: 'scelta_multipla', confidence: 1.0, aiGenerated: false };
      
      // Open question types → Non anagrafica + Aperta
      case 'open':
      case 'open_unstructured':
        return { type: 'non_anagrafica', subtype: 'aperta', category: null, confidence: 1.0, aiGenerated: false };
      
      // Fallback
      default:
        return { type: 'non_classificata', subtype: null, category: null, confidence: 0.0, aiGenerated: false };
    }
  };

  // Effetto per migrazione automatica
  useEffect(() => {
    if (columnMetadata.length > 0) {
      const needsMigration = columnMetadata.some(col => !col.classification && col.type);
      if (needsMigration) {
        const migratedMetadata = columnMetadata.map(col => ({
          ...col,
          classification: col.classification || migrateColumnType(col.type)
        }));
        configureColumns(migratedMetadata);
        // Migrazione completata silenziosamente
      }
    }
  }, [columnMetadata, configureColumns]);

  // Carica classificazione colonna selezionata
  useEffect(() => {
    if (selectedColumn !== null) {
      const metadata = columnMetadata.find(col => col.index === selectedColumn);
      if (metadata) {
        setCurrentClassification(metadata.classification || {
          type: 'non_classificata',
          subtype: null,
          category: null,
          confidence: 0.0,
          aiGenerated: false
        });
        setDescription(metadata.description || '');
      }
    }
  }, [selectedColumn, columnMetadata]);

  const handleSaveClassification = () => {
    if (selectedColumn === null || !currentClassification) {
      return;
    }

    const metadata = columnMetadata.find(col => col.index === selectedColumn);
    if (metadata) {
      const updatedMetadata: ColumnMetadata = {
        ...metadata,
        classification: currentClassification,
        description,
      };
      
      updateColumnMetadata(updatedMetadata);
      toast({
        title: "Classificazione Salvata",
        description: `Colonna "${metadata.name}" classificata come ${getDisplayText(currentClassification)}`,
      });
    }
  };

  const handleBatchClassification = (columnIndexes: number[], classification: Partial<ColumnClassification>) => {
    bulkClassifyColumns(columnIndexes, classification);
    setShowBatchWizard(false);
    setSelectedColumns(new Set());
    toast({
      title: "Classificazione Batch Completata",
      description: `${columnIndexes.length} colonne classificate con successo.`,
    });
  };

  const getDisplayText = (classification: ColumnClassification): string => {
    let text = classification.type.replace('_', ' ').charAt(0).toUpperCase() + classification.type.slice(1);
    if (classification.subtype) {
      text += ` > ${classification.subtype.charAt(0).toUpperCase() + classification.subtype.slice(1)}`;
    }
    if (classification.category) {
      text += ` > ${classification.category.replace('_', ' ')}`;
    }
    return text;
  };

  const getClassificationStats = () => {
    const total = columnMetadata.length;
    const classified = columnMetadata.filter(col => col.classification?.type !== 'non_classificata').length;
    const anagrafica = columnMetadata.filter(col => col.classification?.type === 'anagrafica').length;
    const nonAnagrafica = columnMetadata.filter(col => col.classification?.type === 'non_anagrafica').length;
    
    return { total, classified, anagrafica, nonAnagrafica };
  };

  const stats = getClassificationStats();

  if (!hasData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Nessun Dato Disponibile</h3>
          <p className="text-sm text-muted-foreground">
            Carica un file Excel per iniziare la configurazione delle colonne.<br/>
            Potrai classificare le colonne secondo uno schema gerarchico unificato.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Configurazione Colonne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Colonne Totali</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{stats.classified}</p>
                <p className="text-sm text-muted-foreground">Classificate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{stats.anagrafica}</p>
                <p className="text-sm text-muted-foreground">Anagrafiche</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">{stats.nonAnagrafica}</p>
                <p className="text-sm text-muted-foreground">Non Anagrafiche</p>
              </div>
            </div>
          </div>

          {/* Toggle modalità batch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Switch
                checked={batchMode}
                onCheckedChange={setBatchMode}
                id="batch-mode"
              />
              <label htmlFor="batch-mode" className="text-sm font-medium">
                Modalità Classificazione Batch
              </label>
            </div>
            <Badge variant={batchMode ? "default" : "secondary"}>
              {batchMode ? "Multipla" : "Singola"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contenuto principale */}
      {batchMode ? (
        <BatchModeContent 
          columnMetadata={columnMetadata}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          showBatchWizard={showBatchWizard}
          setShowBatchWizard={setShowBatchWizard}
          handleBatchClassification={handleBatchClassification}
        />
      ) : (
        <SingleModeContent 
          columnMetadata={columnMetadata}
          selectedColumn={selectedColumn}
          setSelectedColumn={setSelectedColumn}
          currentClassification={currentClassification}
          setCurrentClassification={setCurrentClassification}
          description={description}
          setDescription={setDescription}
          handleSaveClassification={handleSaveClassification}
          getDisplayText={getDisplayText}
        />
      )}
    </div>
  );
}

// Componente per modalità batch
const BatchModeContent: React.FC<{
  columnMetadata: ColumnMetadata[];
  selectedColumns: Set<number>;
  setSelectedColumns: (columns: Set<number>) => void;
  showBatchWizard: boolean;
  setShowBatchWizard: (show: boolean) => void;
  handleBatchClassification: (columnIndexes: number[], classification: Partial<ColumnClassification>) => void;
}> = ({
  columnMetadata,
  selectedColumns,
  setSelectedColumns,
  showBatchWizard,
  setShowBatchWizard,
  handleBatchClassification
}) => {
  if (showBatchWizard) {
    return (
      <BatchClassificationWizard
        selectedColumns={Array.from(selectedColumns)}
        onComplete={handleBatchClassification}
        onCancel={() => setShowBatchWizard(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Classificazione Multipla
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Seleziona più colonne per classificarle in blocco. Potrai applicare la stessa classificazione a tutte o personalizzarle individualmente.
            </AlertDescription>
          </Alert>

          <MultiSelectColumnList
            selectedColumns={selectedColumns}
            onSelectionChange={setSelectedColumns}
            showPreview={true}
          />

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              {selectedColumns.size} colonne selezionate
            </div>
            <Button
              onClick={() => setShowBatchWizard(true)}
              disabled={selectedColumns.size === 0}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Avvia Classificazione Batch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente per modalità singola
const SingleModeContent: React.FC<{
  columnMetadata: ColumnMetadata[];
  selectedColumn: number | null;
  setSelectedColumn: (column: number | null) => void;
  currentClassification: ColumnClassification | null;
  setCurrentClassification: (classification: ColumnClassification | null) => void;
  description: string;
  setDescription: (description: string) => void;
  handleSaveClassification: () => void;
  getDisplayText: (classification: ColumnClassification) => string;
}> = ({
  columnMetadata,
  selectedColumn,
  setSelectedColumn,
  currentClassification,
  setCurrentClassification,
  description,
  setDescription,
  handleSaveClassification,
  getDisplayText
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lista colonne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Seleziona Colonna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {columnMetadata.map((column) => (
              <div
                key={column.index}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedColumn === column.index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedColumn(column.index)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{column.name}</span>
                  <Badge 
                    variant={column.classification?.type === 'non_classificata' ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {column.classification ? getDisplayText(column.classification) : 'Non classificata'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dettagli classificazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Classificazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedColumn === null ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Seleziona una colonna per configurare la sua classificazione
              </p>
            </div>
          ) : currentClassification ? (
            <div className="space-y-4">
              <ClassificationSelector
                classification={currentClassification}
                onChange={setCurrentClassification}
              />
              
              {/* Campo descrizione aggiuntivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione (opzionale)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Aggiungi una descrizione per questa classificazione..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              {/* Pulsante salva */}
              <Button onClick={handleSaveClassification} className="w-full">
                Salva Classificazione
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

// Form di classificazione singola
const ClassificationForm: React.FC<{
  classification: ColumnClassification;
  onChange: (classification: ColumnClassification) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
}> = ({ classification, onChange, description, onDescriptionChange, onSave }) => {
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Categorie predefinite per anagrafiche
  const demograficCategories = [
    // Dati personali di base
    { value: 'età', label: 'Età' },
    { value: 'genere', label: 'Genere' },
    { value: 'data_nascita', label: 'Data di nascita' },
    { value: 'codice_fiscale', label: 'Codice fiscale' },
    { value: 'documento_identità', label: 'Documento di identità' },
    
    // Istruzione e formazione
    { value: 'titolo_studio', label: 'Titolo di studio' },
    { value: 'scuola_università', label: 'Scuola/Università' },
    { value: 'corso_studi', label: 'Corso di studi' },
    { value: 'voto_diploma_laurea', label: 'Voto diploma/laurea' },
    { value: 'formazione_professionale', label: 'Formazione professionale' },
    { value: 'certificazioni', label: 'Certificazioni' },
    
    // Lavoro e professione
    { value: 'professione', label: 'Professione' },
    { value: 'settore_lavorativo', label: 'Settore lavorativo' },
    { value: 'esperienza_lavorativa', label: 'Esperienza lavorativa' },
    { value: 'posizione_lavorativa', label: 'Posizione lavorativa' },
    { value: 'tipo_contratto', label: 'Tipo di contratto' },
    { value: 'azienda_ente', label: 'Azienda/Ente' },
    { value: 'dimensione_azienda', label: 'Dimensione azienda' },
    
    // Situazione familiare e sociale
    { value: 'stato_civile', label: 'Stato civile' },
    { value: 'nucleo_familiare', label: 'Nucleo familiare' },
    { value: 'numero_figli', label: 'Numero di figli' },
    { value: 'età_figli', label: 'Età dei figli' },
    { value: 'convivenza', label: 'Convivenza' },
    { value: 'caregiver', label: 'Ruolo di caregiver' },
    
    // Ubicazione geografica
    { value: 'residenza', label: 'Residenza/Località' },
    { value: 'domicilio', label: 'Domicilio' },
    { value: 'provincia', label: 'Provincia' },
    { value: 'regione', label: 'Regione' },
    { value: 'nazione', label: 'Nazione' },
    { value: 'cap', label: 'CAP' },
    { value: 'zona_geografica', label: 'Zona geografica' },
    { value: 'tipo_abitazione', label: 'Tipo di abitazione' },
    
    // Aspetti culturali e linguistici
    { value: 'nazionalità', label: 'Nazionalità' },
    { value: 'cittadinanza', label: 'Cittadinanza' },
    { value: 'lingua', label: 'Lingua' },
    { value: 'lingua_madre', label: 'Lingua madre' },
    { value: 'religione', label: 'Religione' },
    { value: 'etnia', label: 'Etnia' },
    { value: 'cultura_appartenenza', label: 'Cultura di appartenenza' },
    
    // Aspetti economici
    { value: 'reddito', label: 'Reddito' },
    { value: 'fascia_reddito', label: 'Fascia di reddito' },
    { value: 'reddito_familiare', label: 'Reddito familiare' },
    { value: 'situazione_economica', label: 'Situazione economica' },
    { value: 'patrimonio', label: 'Patrimonio' },
    { value: 'spese_mensili', label: 'Spese mensili' },
    
    // Salute e benessere
    { value: 'disabilità', label: 'Disabilità/Accessibilità' },
    { value: 'stato_salute', label: 'Stato di salute' },
    { value: 'condizioni_mediche', label: 'Condizioni mediche' },
    { value: 'limitazioni_funzionali', label: 'Limitazioni funzionali' },
    { value: 'allergie', label: 'Allergie' },
    { value: 'terapie_farmaci', label: 'Terapie/Farmaci' },
    
    // Contatti e comunicazione
    { value: 'telefono', label: 'Telefono' },
    { value: 'email', label: 'Email' },
    { value: 'indirizzo_postale', label: 'Indirizzo postale' },
    { value: 'social_media', label: 'Social media' },
    { value: 'preferenze_contatto', label: 'Preferenze di contatto' },
    
    // Stile di vita e interessi
    { value: 'hobby_interessi', label: 'Hobby e interessi' },
    { value: 'attività_sportive', label: 'Attività sportive' },
    { value: 'volontariato', label: 'Volontariato' },
    { value: 'viaggi', label: 'Viaggi' },
    { value: 'lettura_media', label: 'Lettura e media' },
    { value: 'tecnologia_uso', label: 'Uso della tecnologia' },
    
    // Mobilità e trasporti
    { value: 'patente_guida', label: 'Patente di guida' },
    { value: 'veicoli_posseduti', label: 'Veicoli posseduti' },
    { value: 'mezzi_trasporto', label: 'Mezzi di trasporto utilizzati' },
    { value: 'mobilità_limitazioni', label: 'Limitazioni alla mobilità' }
  ];

  // Categorie predefinite per non anagrafiche
  const questionCategories = [
    // Scale di valutazione
    { value: 'scala_likert', label: 'Scala Likert (1-5, 1-7, etc.)' },
    { value: 'rating_numerico', label: 'Rating numerico' },
    { value: 'scala_semantica', label: 'Scala semantica differenziale' },
    { value: 'scala_visiva', label: 'Scala visiva analogica' },
    { value: 'scala_frequenza', label: 'Scala di frequenza' },
    { value: 'scala_importanza', label: 'Scala di importanza' },
    { value: 'scala_soddisfazione', label: 'Scala di soddisfazione' },
    { value: 'scala_probabilità', label: 'Scala di probabilità' },
    
    // Domande chiuse
    { value: 'scelta_multipla', label: 'Scelta multipla' },
    { value: 'scelta_singola', label: 'Scelta singola' },
    { value: 'si_no', label: 'Sì/No' },
    { value: 'vero_falso', label: 'Vero/Falso' },
    { value: 'accordo_disaccordo', label: 'Accordo/Disaccordo' },
    { value: 'presente_assente', label: 'Presente/Assente' },
    { value: 'applica_non_applica', label: 'Si applica/Non si applica' },
    
    // Domande di ordinamento e priorità
    { value: 'graduatoria', label: 'Graduatoria/Ranking' },
    { value: 'ordinamento', label: 'Ordinamento per priorità' },
    { value: 'confronto_coppie', label: 'Confronto a coppie' },
    { value: 'distribuzione_punti', label: 'Distribuzione punti' },
    
    // Domande complesse
    { value: 'matrice', label: 'Matrice di valutazione' },
    { value: 'griglia_domande', label: 'Griglia di domande' },
    { value: 'tabella_valutazione', label: 'Tabella di valutazione' },
    { value: 'matrice_correlazione', label: 'Matrice di correlazione' },
    
    // Domande aperte e testuali
    { value: 'testo_breve', label: 'Testo breve' },
    { value: 'testo_lungo', label: 'Testo lungo/Paragrafo' },
    { value: 'commento_libero', label: 'Commento libero' },
    { value: 'descrizione', label: 'Descrizione' },
    { value: 'spiegazione', label: 'Spiegazione/Motivazione' },
    { value: 'suggerimenti', label: 'Suggerimenti/Raccomandazioni' },
    
    // Domande numeriche e quantitative
    { value: 'numero_intero', label: 'Numero intero' },
    { value: 'numero_decimale', label: 'Numero decimale' },
    { value: 'percentuale', label: 'Percentuale' },
    { value: 'valuta', label: 'Valuta/Importo' },
    { value: 'quantità', label: 'Quantità' },
    { value: 'peso_misura', label: 'Peso/Misura' },
    
    // Domande temporali
    { value: 'data', label: 'Data' },
    { value: 'ora', label: 'Ora' },
    { value: 'data_ora', label: 'Data e ora' },
    { value: 'periodo', label: 'Periodo/Durata' },
    { value: 'anno', label: 'Anno' },
    { value: 'mese_anno', label: 'Mese e anno' },
    
    // Domande di contatto e localizzazione
    { value: 'email', label: 'Indirizzo email' },
    { value: 'telefono', label: 'Numero di telefono' },
    { value: 'indirizzo', label: 'Indirizzo' },
    { value: 'sito_web', label: 'Sito web/URL' },
    { value: 'coordinate', label: 'Coordinate geografiche' },
    
    // Domande di upload e allegati
    { value: 'file_upload', label: 'Upload file' },
    { value: 'immagine', label: 'Upload immagine' },
    { value: 'documento', label: 'Upload documento' },
    { value: 'audio_video', label: 'Upload audio/video' },
    
    // Domande comportamentali e psicometriche
    { value: 'comportamento', label: 'Comportamento' },
    { value: 'atteggiamento', label: 'Atteggiamento' },
    { value: 'opinione', label: 'Opinione' },
    { value: 'percezione', label: 'Percezione' },
    { value: 'intenzione', label: 'Intenzione' },
    { value: 'motivazione', label: 'Motivazione' },
    { value: 'preferenza', label: 'Preferenza' },
    { value: 'aspettativa', label: 'Aspettativa' },
    
    // Domande di valutazione e feedback
    { value: 'valutazione_prestazione', label: 'Valutazione prestazione' },
    { value: 'feedback_qualitativo', label: 'Feedback qualitativo' },
    { value: 'recensione', label: 'Recensione' },
    { value: 'testimonianza', label: 'Testimonianza' },
    { value: 'caso_studio', label: 'Caso di studio' },
    
    // Domande specialistiche
    { value: 'test_conoscenza', label: 'Test di conoscenza' },
    { value: 'competenza_skill', label: 'Competenza/Skill' },
    { value: 'certificazione', label: 'Certificazione' },
    { value: 'abilitazione', label: 'Abilitazione' },
    { value: 'autorizzazione', label: 'Autorizzazione' }
  ];

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      onChange({ 
        ...classification, 
        category: null
      });
    } else {
      setShowCustomInput(false);
      setCustomCategory('');
      onChange({ 
        ...classification, 
        category: value || null
      });
    }
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      onChange({ 
        ...classification, 
        category: customCategory.trim().toLowerCase()
      });
      setShowCustomInput(false);
    }
  };

  const handleCustomCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomCategorySubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomCategory('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tipo Principale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo Principale
        </label>
        <select
          value={classification.type}
          onChange={(e) => onChange({ 
            ...classification, 
            type: e.target.value as any,
            subtype: null,
            category: null
          })}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="non_classificata">Non classificata</option>
          <option value="anagrafica">Anagrafica</option>
          <option value="non_anagrafica">Non anagrafica</option>
        </select>
      </div>

      {/* Sottotipo */}
      {classification.type !== 'non_classificata' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sottotipo
          </label>
          <select
            value={classification.subtype || ''}
            onChange={(e) => onChange({ 
              ...classification, 
              subtype: (e.target.value as 'chiusa' | 'aperta') || null,
              category: null
            })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona sottotipo</option>
            <option value="chiusa">Chiusa (lista predefinita)</option>
            <option value="aperta">Aperta (testo libero)</option>
          </select>
        </div>
      )}

      {/* Categoria */}
      {classification.subtype === 'chiusa' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria Specifica
          </label>
          <select
            value={showCustomInput ? 'custom' : classification.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona categoria</option>
            {classification.type === 'anagrafica' ? (
              <>
                {demograficCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                <option value="custom">➕ Categoria personalizzata...</option>
              </>
            ) : (
              <>
                {questionCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                <option value="custom">➕ Categoria personalizzata...</option>
              </>
            )}
          </select>
          
          {showCustomInput && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={handleCustomCategoryKeyPress}
                placeholder="Inserisci nome categoria personalizzata..."
                className="w-full p-3 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={handleCustomCategorySubmit}
                  disabled={!customCategory.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Conferma
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Annulla
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Premi Invio per confermare, Esc per annullare
              </p>
            </div>
          )}
        </div>
      )}

      {/* Descrizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione (opzionale)
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Aggiungi una descrizione per questa colonna..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      {/* Pulsante salva */}
      <Button onClick={onSave} className="w-full">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Salva Classificazione
      </Button>
    </div>
  );
};

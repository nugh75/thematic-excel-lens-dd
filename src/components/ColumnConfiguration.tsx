import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Settings, 
  BarChart3, 
  AlertCircle
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnClassification, ColumnMetadata, ColumnType } from '../types/analysis';
import { ClassificationSelector } from './ClassificationSelector';

/**
 * Componente principale per la configurazione e classificazione delle colonne
 * - HUB unificato per tutti i tipi di classificazione
 * - Sistema gerarchico: anagrafica/non_anagrafica → chiusa/aperta → categorie specifiche
 * - Modalità singola per classificazione individuale delle colonne
 * - Migrazione automatica dal vecchio sistema ColumnType
 */
export default function ColumnConfiguration() {
  const { 
    currentProject, 
    updateColumnMetadata
  } = useAnalysisStore();
  
  // State per modalità singola e multipla
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  const [currentClassification, setCurrentClassification] = useState<ColumnClassification | null>(null);
  const [description, setDescription] = useState('');

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
        // Aggiorna direttamente i metadati senza toast
        migratedMetadata.forEach(metadata => {
          updateColumnMetadata(metadata);
        });
      }
    }
  }, [columnMetadata, updateColumnMetadata]);

  // Carica classificazione colonne selezionate
  useEffect(() => {
    if (selectedColumns.length === 1) {
      // Se una sola colonna selezionata, carica la sua classificazione
      const metadata = columnMetadata.find(col => col.index === selectedColumns[0]);
      if (metadata?.classification) {
        setCurrentClassification(metadata.classification);
        setDescription(metadata.description || '');
      } else {
        // Inizializza con classificazione vuota
        setCurrentClassification({
          type: 'non_classificata',
          subtype: null,
          category: null,
          confidence: 1.0,
          aiGenerated: false
        });
        setDescription('');
      }
    } else if (selectedColumns.length > 1) {
      // Se più colonne selezionate, inizializza con classificazione vuota
      setCurrentClassification({
        type: 'non_classificata',
        subtype: null,
        category: null,
        confidence: 1.0,
        aiGenerated: false
      });
      setDescription('');
    }
  }, [selectedColumns, columnMetadata]);

  const handleSaveClassification = () => {
    if (selectedColumns.length === 0 || !currentClassification) {
      return;
    }

    // Applica la classificazione a tutte le colonne selezionate
    selectedColumns.forEach(columnIndex => {
      const metadata = columnMetadata.find(col => col.index === columnIndex);
      if (metadata) {
        const updatedMetadata: ColumnMetadata = {
          ...metadata,
          classification: currentClassification,
          description,
        };
        
        updateColumnMetadata(updatedMetadata);
      }
    });
    
    // Reset selezione dopo il salvataggio
    setSelectedColumns([]);
    setCurrentClassification(null);
    setDescription('');
  };

  // Gestione selezione colonne (multipla)
  const handleColumnClick = (columnIndex: number) => {
    // Click normale: aggiungi/rimuovi dalla selezione multipla
    setSelectedColumns(prev => 
      prev.includes(columnIndex) 
        ? prev.filter(idx => idx !== columnIndex)
        : [...prev, columnIndex]
    );
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

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun dato disponibile</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Carica un file Excel per iniziare la configurazione delle colonne.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Classificazione Colonne</h2>
            <p className="text-sm text-muted-foreground">
              Configura la classificazione per ogni colonna del dataset
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista colonne */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Colonne Dataset ({columnMetadata.length})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedColumns(columnMetadata.map(col => col.index))}
                  disabled={selectedColumns.length === columnMetadata.length}
                >
                  Seleziona tutto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedColumns([])}
                  disabled={selectedColumns.length === 0}
                >
                  Deseleziona tutto
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {columnMetadata.map((column) => (
                <div
                  key={column.index}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedColumns.includes(column.index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleColumnClick(column.index)}
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
              {selectedColumns.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({selectedColumns.length} colonne selezionate)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedColumns.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Seleziona una o più colonne per configurare la classificazione
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Clicca per aggiungere/rimuovere colonne dalla selezione
                </p>
              </div>
            ) : currentClassification ? (
              <div className="space-y-6">
                {selectedColumns.length > 1 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Modalità multipla:</strong> La classificazione verrà applicata a tutte le {selectedColumns.length} colonne selezionate.
                    </p>
                  </div>
                )}
                
                <ClassificationSelector
                  classification={currentClassification}
                  onChange={setCurrentClassification}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione (opzionale)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Aggiungi una descrizione per questa colonna..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSaveClassification}
                  className="w-full"
                  disabled={!currentClassification || currentClassification.type === 'non_classificata'}
                >
                  Salva Classificazione{selectedColumns.length > 1 ? ` (${selectedColumns.length} colonne)` : ''}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
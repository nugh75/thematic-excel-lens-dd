import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Settings, Save, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnType, ColumnMetadata } from '../types/analysis';
import { toast } from './ui/use-toast';

export function QuestionTypesConfig() {
  const { excelData, currentProject, configureColumns, updateColumnType } = useAnalysisStore();
  const [editingColumns, setEditingColumns] = useState<ColumnMetadata[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    if (currentProject?.config.columnMetadata) {
      setEditingColumns([...currentProject.config.columnMetadata]);
    }
  }, [currentProject]);

  if (!excelData || !currentProject) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Nessun Progetto Attivo</h3>
          <p className="text-sm text-muted-foreground">
            Carica un progetto per configurare i tipi di domande
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: ColumnType) => {
    switch (type) {
      case 'demographic': return '👤';
      case 'open': return '💬';
      case 'closed': return '✅';
      case 'likert': return '📊';
      case 'checkbox': return '☑️';
      case 'yesno': return '❓';
      case 'numeric': return '🔢';
      case 'ordinal': return '📋';
      default: return '❓';
    }
  };

  const getTypeDescription = (type: ColumnType) => {
    switch (type) {
      case 'demographic': return 'Dati anagrafici (età, sesso, città, etc.)';
      case 'open': return 'Domande aperte - Risposte testuali libere';
      case 'closed': return 'Domande chiuse - Opzioni predefinite';
      case 'likert': return 'Scale Likert (1-5, 1-7, etc.)';
      case 'checkbox': return 'Risposta multipla con checkbox';
      case 'yesno': return 'Domande Sì/No o Vero/Falso';
      case 'numeric': return 'Valori numerici per statistiche';
      case 'ordinal': return 'Valori ordinali (piccolo/medio/grande)';
      default: return 'Tipo non definito';
    }
  };

  const handleTypeChange = (columnIndex: number, newType: ColumnType) => {
    const updated = editingColumns.map(col => 
      col.index === columnIndex 
        ? { ...col, type: newType, autoDetected: false }
        : col
    );
    setEditingColumns(updated);
    setHasChanges(true);
  };

  const handleDescriptionChange = (columnIndex: number, description: string) => {
    const updated = editingColumns.map(col => 
      col.index === columnIndex 
        ? { ...col, description }
        : col
    );
    setEditingColumns(updated);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    configureColumns(editingColumns);
    setHasChanges(false);
    toast({
      title: "Configurazione Salvata",
      description: "I tipi di domande sono stati aggiornati con successo.",
    });
  };

  const handleResetChanges = () => {
    if (currentProject?.config.columnMetadata) {
      setEditingColumns([...currentProject.config.columnMetadata]);
      setHasChanges(false);
    }
  };

  const getColumnStats = () => {
    const stats = editingColumns.reduce((acc, col) => {
      acc[col.type] = (acc[col.type] || 0) + 1;
      return acc;
    }, {} as Record<ColumnType, number>);
    return stats;
  };

  const stats = getColumnStats();

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Configurazione Tipi di Domande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(stats).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-2xl">{getTypeIcon(type as ColumnType)}</div>
                <div>
                  <p className="font-medium">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                </div>
              </div>
            ))}
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-800">Hai modifiche non salvate</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={handleResetChanges}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Annulla
                </Button>
                <Button size="sm" onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  Salva
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista colonne configurabili */}
      <div className="space-y-4">
        {editingColumns.map((column, index) => (
          <Card key={column.index} className="relative">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Info colonna */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(column.type)}</span>
                    <div>
                      <h4 className="font-medium">{column.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Colonna {column.index + 1}
                      </p>
                    </div>
                  </div>
                  
                  {column.autoDetected && (
                    <Badge variant="secondary" className="text-xs">
                      Auto-rilevato
                    </Badge>
                  )}
                </div>

                {/* Tipo domanda */}
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium">Tipo di Domanda</Label>
                  <Select 
                    value={column.type} 
                    onValueChange={(value) => handleTypeChange(column.index, value as ColumnType)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demographic">👤 Anagrafica</SelectItem>
                      <SelectItem value="open">💬 Aperta</SelectItem>
                      <SelectItem value="closed">✅ Chiusa</SelectItem>
                      <SelectItem value="likert">📊 Scala Likert</SelectItem>
                      <SelectItem value="checkbox">☑️ Multipla</SelectItem>
                      <SelectItem value="yesno">❓ Sì/No</SelectItem>
                      <SelectItem value="numeric">🔢 Numerica</SelectItem>
                      <SelectItem value="ordinal">📋 Ordinale</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTypeDescription(column.type)}
                  </p>
                </div>

                {/* Descrizione */}
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Descrizione (Opzionale)</Label>
                  <Textarea
                    placeholder="Aggiungi una descrizione per questa colonna..."
                    value={column.description || ''}
                    onChange={(e) => handleDescriptionChange(column.index, e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                {/* Valori campione */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Valori Campione</Label>
                  <div className="mt-1 space-y-1">
                    {column.sampleValues?.slice(0, 3).map((value, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 p-2 rounded border">
                        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                      </div>
                    ))}
                    {(column.sampleValues?.length || 0) > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{(column.sampleValues?.length || 0) - 3} altri
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guida rapida */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Guida Rapida ai Tipi di Domande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'demographic', use: 'Filtrare e segmentare i dati per caratteristiche demografiche' },
              { type: 'open', use: 'Analisi tematica qualitativa con etichettatura manuale o AI' },
              { type: 'closed', use: 'Grafici a barre, torta e analisi di frequenza' },
              { type: 'likert', use: 'Grafici a barre, analisi di distribuzione e soddisfazione' },
              { type: 'checkbox', use: 'Analisi di frequenza per risposte multiple' },
              { type: 'yesno', use: 'Grafici binari e percentuali di consenso' },
              { type: 'numeric', use: 'Statistiche descrittive, media, mediana, deviazione standard' },
              { type: 'ordinal', use: 'Grafici ordinati e analisi di ranking' }
            ].map(({ type, use }) => (
              <div key={type} className="flex gap-3 p-3 border rounded-lg">
                <span className="text-xl">{getTypeIcon(type as ColumnType)}</span>
                <div>
                  <h5 className="font-medium capitalize">{type}</h5>
                  <p className="text-sm text-muted-foreground">{use}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuestionTypesConfig;

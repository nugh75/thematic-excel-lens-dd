import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  BarChart3, 
  MessageSquare, 
  ChevronRight, 
  Check, 
  AlertCircle,
  Eye,
  Save,
  RotateCcw,
  Brain
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { 
  ColumnType, 
  ColumnClassification, 
  ColumnMetadata 
} from '../types/analysis';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';

export function ColumnClassifier() {
  const { excelData, columnMetadata, updateColumnMetadata } = useAnalysisStore();
  const { toast } = useToast();
  
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [currentClassification, setCurrentClassification] = useState<ColumnClassification | null>(null);
  const [description, setDescription] = useState('');
  const [previewData, setPreviewData] = useState<string[]>([]);

  useEffect(() => {
    if (selectedColumn !== null && excelData) {
      // Carica i dati di anteprima per la colonna selezionata
      const columnData = excelData.rows
        .map(row => row[selectedColumn])
        .filter(cell => cell && cell.toString().trim())
        .slice(0, 10);
      setPreviewData(columnData.map(cell => cell.toString()));
      
      // Carica la classificazione esistente se presente
      const existingMetadata = columnMetadata.find(m => m.index === selectedColumn);
      if (existingMetadata?.classification) {
        setCurrentClassification(existingMetadata.classification);
      } else {
        setCurrentClassification(null);
      }
      
      setDescription(existingMetadata?.description || '');
    }
  }, [selectedColumn, excelData, columnMetadata]);

  const handleLevel1Change = (level1: 'demographic' | 'non_demographic') => {
    setCurrentClassification({
      level1,
      finalType: level1 === 'demographic' ? 'demographic' : 'non_demographic',
      classifiedBy: 'user',
      classifiedAt: Date.now()
    });
  };

  const handleLevel2Change = (level2: string) => {
    if (!currentClassification) return;
    
    let finalType: ColumnType;
    if (currentClassification.level1 === 'demographic') {
      switch (level2) {
        case 'age': finalType = 'demographic_age'; break;
        case 'gender': finalType = 'demographic_gender'; break;
        case 'location': finalType = 'demographic_location'; break;
        case 'education': finalType = 'demographic_education'; break;
        case 'profession': finalType = 'demographic_profession'; break;
        default: finalType = 'demographic_other';
      }
    } else {
      finalType = level2 as ColumnType;
    }

    setCurrentClassification({
      ...currentClassification,
      level2: level2 as any,
      finalType,
      classifiedAt: Date.now()
    });
  };

  const handleLevel3Change = (level3: string) => {
    if (!currentClassification) return;
    
    let finalType: ColumnType;
    if (currentClassification.level2 === 'open') {
      finalType = level3 === 'structured' ? 'open_structured' : 'open_unstructured';
    } else if (currentClassification.level2 === 'closed') {
      switch (level3) {
        case 'numeric': finalType = 'closed_numeric'; break;
        case 'likert': finalType = 'closed_likert'; break;
        case 'yesno': finalType = 'closed_yesno'; break;
        case 'multichoice': finalType = 'closed_multichoice'; break;
        case 'singlechoice': finalType = 'closed_singlechoice'; break;
        default: finalType = 'closed';
      }
    } else {
      finalType = currentClassification.finalType;
    }

    setCurrentClassification({
      ...currentClassification,
      level3: level3 as any,
      finalType,
      classifiedAt: Date.now()
    });
  };

  const saveClassification = () => {
    if (selectedColumn === null || !currentClassification) {
      toast({
        title: "Errore",
        description: "Seleziona una colonna e completa la classificazione",
        variant: "destructive"
      });
      return;
    }

    const metadata: ColumnMetadata = {
      index: selectedColumn,
      name: excelData?.headers[selectedColumn] || '',
      type: currentClassification.finalType,
      classification: currentClassification,
      description: description.trim() || undefined,
      sampleValues: previewData
    };

    updateColumnMetadata(metadata);
    
    toast({
      title: "Classificazione salvata",
      description: `La colonna "${metadata.name}" è stata classificata come ${getTypeLabel(currentClassification.finalType)}`,
    });
  };

  const resetClassification = () => {
    setCurrentClassification(null);
    setDescription('');
  };

  const getTypeLabel = (type: ColumnType): string => {
    const labels: Record<ColumnType, string> = {
      'demographic': 'Anagrafica',
      'non_demographic': 'Non Anagrafica',
      'closed': 'Chiusa',
      'open': 'Aperta',
      'open_structured': 'Aperta Strutturata',
      'open_unstructured': 'Aperta Non Strutturata',
      'closed_numeric': 'Chiusa Numerica',
      'closed_likert': 'Chiusa Likert',
      'closed_yesno': 'Chiusa Sì/No',
      'closed_multichoice': 'Chiusa Scelta Multipla',
      'closed_singlechoice': 'Chiusa Scelta Singola',
      'demographic_age': 'Anagrafica - Età',
      'demographic_gender': 'Anagrafica - Genere',
      'demographic_location': 'Anagrafica - Località',
      'demographic_education': 'Anagrafica - Istruzione',
      'demographic_profession': 'Anagrafica - Professione',
      'demographic_other': 'Anagrafica - Altro'
    };
    return labels[type] || type;
  };

  const getClassificationProgress = (): number => {
    if (!currentClassification) return 0;
    
    if (currentClassification.level1 === 'demographic') {
      return currentClassification.level2 ? 100 : 50;
    }
    
    if (currentClassification.level1 === 'non_demographic') {
      if (!currentClassification.level2) return 33;
      if (currentClassification.level2 === 'open' || currentClassification.level2 === 'closed') {
        return currentClassification.level3 ? 100 : 66;
      }
      return 100;
    }
    
    return 0;
  };

  if (!excelData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Carica prima un file Excel per classificare le colonne.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Classificazione delle Colonne</h3>
          <p className="text-sm text-muted-foreground">
            Classifica ogni colonna secondo lo schema: Anagrafiche/Non Anagrafiche → Chiuse/Aperte → Sottotipi specifici
          </p>
        </div>

        {/* Selezione colonna */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Seleziona Colonna da Classificare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedColumn?.toString() || ""} 
              onValueChange={(value) => setSelectedColumn(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una colonna..." />
              </SelectTrigger>
              <SelectContent>
                {excelData.headers.map((header, index) => {
                  const existing = columnMetadata.find(m => m.index === index);
                  return (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{header}</span>
                        {existing?.classification && (
                          <Badge variant="secondary" className="ml-2">
                            {getTypeLabel(existing.type)}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Anteprima dati */}
        {selectedColumn !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Anteprima Dati - {excelData.headers[selectedColumn]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                {previewData.length > 0 ? (
                  <div className="space-y-1">
                    {previewData.map((value, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-500">#{index + 1}:</span> {value}
                      </div>
                    ))}
                    {excelData.rows.length > 10 && (
                      <div className="text-xs text-gray-500 mt-2">
                        ... e altri {excelData.rows.length - 10} valori
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nessun dato disponibile per questa colonna</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processo di classificazione */}
        {selectedColumn !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Classificazione - {excelData.headers[selectedColumn]}
                {currentClassification && (
                  <Badge variant="outline">
                    {getClassificationProgress()}% completato
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Livello 1: Anagrafica/Non Anagrafica */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">1. Tipo di domanda principale</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={currentClassification?.level1 === 'demographic' ? 'default' : 'outline'}
                    onClick={() => handleLevel1Change('demographic')}
                    className="flex items-center gap-2 h-auto py-4"
                  >
                    <Users className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Anagrafica</div>
                      <div className="text-xs opacity-75">Età, genere, località, ecc.</div>
                    </div>
                  </Button>
                  <Button
                    variant={currentClassification?.level1 === 'non_demographic' ? 'default' : 'outline'}
                    onClick={() => handleLevel1Change('non_demographic')}
                    className="flex items-center gap-2 h-auto py-4"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Non Anagrafica</div>
                      <div className="text-xs opacity-75">Opinioni, feedback, valutazioni</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Livello 2: Sottocategorie */}
              {currentClassification?.level1 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    2. {currentClassification.level1 === 'demographic' ? 'Tipo di informazione anagrafica' : 'Formato della domanda'}
                  </Label>
                  
                  {currentClassification.level1 === 'demographic' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'age', label: 'Età', desc: 'Anni, data di nascita' },
                        { value: 'gender', label: 'Genere', desc: 'M/F, identità di genere' },
                        { value: 'location', label: 'Località', desc: 'Città, regione, paese' },
                        { value: 'education', label: 'Istruzione', desc: 'Titolo di studio' },
                        { value: 'profession', label: 'Professione', desc: 'Lavoro, settore' },
                        { value: 'other', label: 'Altro', desc: 'Altre info anagrafiche' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={currentClassification.level2 === option.value ? 'default' : 'outline'}
                          onClick={() => handleLevel2Change(option.value)}
                          className="h-auto py-3 text-left justify-start"
                        >
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs opacity-75">{option.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={currentClassification.level2 === 'closed' ? 'default' : 'outline'}
                        onClick={() => handleLevel2Change('closed')}
                        className="flex items-center gap-2 h-auto py-4"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Chiusa</div>
                          <div className="text-xs opacity-75">Opzioni predefinite</div>
                        </div>
                      </Button>
                      <Button
                        variant={currentClassification.level2 === 'open' ? 'default' : 'outline'}
                        onClick={() => handleLevel2Change('open')}
                        className="flex items-center gap-2 h-auto py-4"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Aperta</div>
                          <div className="text-xs opacity-75">Testo libero</div>
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Livello 3: Sottotipi specifici */}
              {currentClassification?.level2 === 'open' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">3. Struttura della risposta aperta</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={currentClassification.level3 === 'structured' ? 'default' : 'outline'}
                      onClick={() => handleLevel3Change('structured')}
                      className="h-auto py-3 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">Strutturata</div>
                        <div className="text-xs opacity-75">Format specifico, codici</div>
                      </div>
                    </Button>
                    <Button
                      variant={currentClassification.level3 === 'unstructured' ? 'default' : 'outline'}
                      onClick={() => handleLevel3Change('unstructured')}
                      className="h-auto py-3 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">Non Strutturata</div>
                        <div className="text-xs opacity-75">Testo completamente libero</div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              {currentClassification?.level2 === 'closed' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">3. Tipo di domanda chiusa</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'numeric', label: 'Numerica', desc: 'Numeri, quantità' },
                      { value: 'likert', label: 'Likert/Scale', desc: '1-5, molto/poco' },
                      { value: 'yesno', label: 'Sì e No', desc: 'Binaria, vero/falso' },
                      { value: 'multichoice', label: 'Scelta Multipla', desc: 'Più opzioni selezionabili' },
                      { value: 'singlechoice', label: 'Scelta Singola', desc: 'Una sola opzione' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={currentClassification.level3 === option.value ? 'default' : 'outline'}
                        onClick={() => handleLevel3Change(option.value)}
                        className="h-auto py-3 text-left justify-start"
                      >
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs opacity-75">{option.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Descrizione opzionale */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione aggiuntiva (opzionale)</Label>
                <Textarea
                  id="description"
                  placeholder="Aggiungi note o dettagli specifici per questa colonna..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Riepilogo classificazione */}
              {currentClassification && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Classificazione attuale:</strong> {getTypeLabel(currentClassification.finalType)}
                    {description && (
                      <>
                        <br />
                        <strong>Descrizione:</strong> {description}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Pulsanti azione */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={saveClassification}
                  disabled={!currentClassification || getClassificationProgress() < 100}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salva Classificazione
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetClassification}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Riepilogo delle classificazioni */}
        {columnMetadata.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Riepilogo Classificazioni</CardTitle>
              <CardDescription>
                {columnMetadata.length} su {excelData.headers.length} colonne classificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {excelData.headers.map((header, index) => {
                  const metadata = columnMetadata.find(m => m.index === index);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{header}</span>
                        {metadata ? (
                          <Badge variant="secondary">
                            {getTypeLabel(metadata.type)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non classificata</Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedColumn(index)}
                      >
                        {metadata ? 'Modifica' : 'Classifica'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ColumnClassifier;

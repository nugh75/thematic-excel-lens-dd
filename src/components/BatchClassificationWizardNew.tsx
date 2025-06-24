import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, AlertTriangle, Eye } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnClassification, ColumnMetadata, ColumnType } from '../types/analysis';

interface BatchClassificationWizardProps {
  selectedColumns: number[];
  onComplete: (columnIndexes: number[], classification: Partial<ColumnClassification>) => void;
  onCancel: () => void;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const BatchClassificationWizard: React.FC<BatchClassificationWizardProps> = ({
  selectedColumns,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [classificationMode, setClassificationMode] = useState<'uniform' | 'individual'>('uniform');
  const [uniformClassification, setUniformClassification] = useState<Partial<ColumnClassification>>({
    level1: 'non_demographic'
  });
  const [individualClassifications, setIndividualClassifications] = useState<Record<number, Partial<ColumnClassification>>>({});

  const { currentProject, bulkClassifyColumns } = useAnalysisStore();

  const selectedColumnData = currentProject?.config.columnMetadata.filter(col => selectedColumns.includes(col.index)) || [];

  // Step 1: Conferma Selezione
  const StepConfirmSelection: React.FC = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Conferma Selezione Colonne
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Hai selezionato {selectedColumns.length} colonne per la classificazione batch
        </p>
      </div>

      <div className="max-h-60 overflow-y-auto border rounded-lg">
        {selectedColumnData.map((column, index) => (
          <div key={column.index} className="flex items-center justify-between p-3 border-b last:border-b-0">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                {index + 1}
              </Badge>
              <span className="font-medium">{column.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              {getDisplayType(column.classification)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Pronto per la classificazione
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Nel prossimo step potrai scegliere se applicare la stessa classificazione a tutte le colonne o personalizzarle individualmente.
        </p>
      </div>
    </div>
  );

  // Step 2: Modalità di Classificazione
  const StepClassificationMode: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Modalità di Classificazione
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Scegli come vuoi classificare le colonne selezionate
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer border-2 transition-all ${
            classificationMode === 'uniform' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setClassificationMode('uniform')}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Classificazione Uniforme</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm text-gray-600">
              Applica la stessa classificazione a tutte le {selectedColumns.length} colonne selezionate.
            </div>
            <div className="mt-3 text-xs text-green-600 font-medium">
              ✓ Veloce e efficiente
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer border-2 transition-all ${
            classificationMode === 'individual' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setClassificationMode('individual')}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Classificazione Individuale</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm text-gray-600">
              Personalizza la classificazione per ogni singola colonna.
            </div>
            <div className="mt-3 text-xs text-blue-600 font-medium">
              ✓ Controllo granulare
            </div>
          </CardContent>
        </Card>
      </div>

      {classificationMode === 'uniform' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Configurazione Uniforme</h4>
          <ClassificationSelector 
            classification={uniformClassification}
            onChange={setUniformClassification}
          />
        </div>
      )}
    </div>
  );

  // Step 3: Configurazione
  const StepConfiguration: React.FC = () => {
    if (classificationMode === 'uniform') {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Configurazione Uniforme
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              La seguente classificazione sarà applicata a tutte le {selectedColumns.length} colonne
            </p>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <ClassificationSummary classification={uniformClassification} />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Colonne interessate:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {selectedColumnData.map(column => (
                <div key={column.index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm font-medium">{column.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {getDisplayType(column.classification)} → {getDisplayType(uniformClassification)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Configurazione Individuale
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Personalizza la classificazione per ogni colonna
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedColumnData.map((column, index) => (
            <Card key={column.index} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <span className="font-medium">{column.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getDisplayType(column.classification)}
                  </Badge>
                </div>
                <ClassificationSelector 
                  classification={
                    individualClassifications[column.index] || 
                    uniformClassification
                  }
                  onChange={(classification) => {
                    setIndividualClassifications(prev => ({
                      ...prev,
                      [column.index]: classification
                    }));
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Step 4: Anteprima
  const StepPreview: React.FC = () => {
    const changes = selectedColumnData.map(column => {
      const newClassification = classificationMode === 'uniform' 
        ? uniformClassification 
        : individualClassifications[column.index] || uniformClassification;
      
      return {
        column,
        from: column.classification,
        to: newClassification
      };
    });

    const stats = {
      total: changes.length,
      modified: changes.filter(change => 
        getDisplayType(change.from) !== getDisplayType(change.to)
      ).length,
      demographic: changes.filter(change => change.to.level1 === 'demographic').length,
      nonDemographic: changes.filter(change => change.to.level1 === 'non_demographic').length
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Anteprima Modifiche
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Verifica le modifiche prima di applicarle
          </p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Totale colonne</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.modified}</div>
              <div className="text-xs text-gray-600">Modificate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.demographic}</div>
              <div className="text-xs text-gray-600">Demografiche</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.nonDemographic}</div>
              <div className="text-xs text-gray-600">Non demografiche</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista modifiche */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Dettaglio modifiche</span>
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {changes.map(change => (
              <div key={change.column.index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <span className="font-medium">{change.column.name}</span>
                <div className="flex items-center space-x-2 text-sm">
                  <Badge variant="outline">{getDisplayType(change.from)}</Badge>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <Badge variant="default">{getDisplayType(change.to)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats.modified === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                Nessuna modifica rilevata
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Le classificazioni selezionate corrispondono a quelle attuali delle colonne.
            </p>
          </div>
        )}
      </div>
    );
  };

  const steps: WizardStep[] = [
    {
      id: 0,
      title: 'Conferma Selezione',
      description: 'Verifica le colonne selezionate',
      component: StepConfirmSelection
    },
    {
      id: 1,
      title: 'Modalità',
      description: 'Scegli il tipo di classificazione',
      component: StepClassificationMode
    },
    {
      id: 2,
      title: 'Configurazione',
      description: 'Imposta le classificazioni',
      component: StepConfiguration
    },
    {
      id: 3,
      title: 'Anteprima',
      description: 'Verifica le modifiche',
      component: StepPreview
    }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedColumns.length > 0;
      case 1:
        return classificationMode && (
          classificationMode === 'individual' || 
          (classificationMode === 'uniform' && uniformClassification.level1)
        );
      case 2:
        return classificationMode === 'uniform' || 
          selectedColumns.every(colIndex => individualClassifications[colIndex]);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const finalClassification = classificationMode === 'uniform' 
      ? uniformClassification 
      : uniformClassification; // Per ora usiamo uniforme, poi potremo estendere per individuale

    onComplete(selectedColumns, finalClassification);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index <= currentStep 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-300'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="ml-3 text-sm">
                <div className={`font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </div>
                <div className={`text-xs ${index <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-0.5 w-16 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <CurrentStepComponent />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 0 ? 'Annulla' : 'Indietro'}</span>
        </Button>

        <div className="text-sm text-gray-500">
          Step {currentStep + 1} di {steps.length}
        </div>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Applica Modifiche</span>
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2"
          >
            <span>Avanti</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getDisplayType = (classification?: Partial<ColumnClassification>): string => {
  if (!classification?.level1) return 'Non classificata';
  let display = classification.level1 === 'demographic' ? 'Demografica' : 'Non demografica';
  if (classification.level2) {
    display += ` > ${classification.level2}`;
  }
  if (classification.level3) {
    display += ` > ${classification.level3}`;
  }
  return display;
};

// Componente helper per selezionare la classificazione
const ClassificationSelector: React.FC<{
  classification: Partial<ColumnClassification>;
  onChange: (classification: Partial<ColumnClassification>) => void;
}> = ({ classification, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Livello 1 - Categoria Principale
        </label>
        <select
          value={classification.level1 || ''}
          onChange={(e) => onChange({ 
            ...classification, 
            level1: e.target.value as 'demographic' | 'non_demographic',
            level2: undefined,
            level3: undefined,
            finalType: e.target.value as ColumnType
          })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Seleziona categoria</option>
          <option value="demographic">Demografica</option>
          <option value="non_demographic">Non demografica</option>
        </select>
      </div>

      {classification.level1 === 'non_demographic' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Livello 2 - Sottocategoria
          </label>
          <select
            value={classification.level2 || ''}
            onChange={(e) => onChange({ 
              ...classification, 
              level2: e.target.value as 'closed' | 'open',
              level3: undefined,
              finalType: e.target.value as ColumnType
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona sottocategoria</option>
            <option value="closed">Chiusa (risposta predefinita)</option>
            <option value="open">Aperta (testo libero)</option>
          </select>
        </div>
      )}

      {classification.level1 === 'demographic' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Livello 2 - Tipo Demografico
          </label>
          <select
            value={classification.level2 || ''}
            onChange={(e) => onChange({ 
              ...classification, 
              level2: e.target.value as any,
              level3: undefined,
              finalType: (`demographic_${e.target.value}`) as ColumnType
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona tipo demografico</option>
            <option value="age">Età</option>
            <option value="gender">Genere</option>
            <option value="location">Posizione geografica</option>
            <option value="education">Livello di istruzione</option>
            <option value="profession">Professione</option>
            <option value="other">Altro</option>
          </select>
        </div>
      )}

      {classification.level1 === 'non_demographic' && classification.level2 === 'closed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Livello 3 - Tipo Specifico
          </label>
          <select
            value={classification.level3 || ''}
            onChange={(e) => onChange({ 
              ...classification, 
              level3: e.target.value as any,
              finalType: (`closed_${e.target.value}`) as ColumnType
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona tipo specifico</option>
            <option value="numeric">Numerica</option>
            <option value="likert">Scala Likert</option>
            <option value="yesno">Sì/No</option>
            <option value="multichoice">Scelta multipla</option>
            <option value="singlechoice">Scelta singola</option>
          </select>
        </div>
      )}

      {classification.level1 === 'non_demographic' && classification.level2 === 'open' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Livello 3 - Struttura
          </label>
          <select
            value={classification.level3 || ''}
            onChange={(e) => onChange({ 
              ...classification, 
              level3: e.target.value as any,
              finalType: (`open_${e.target.value}`) as ColumnType
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona struttura</option>
            <option value="structured">Strutturata</option>
            <option value="unstructured">Non strutturata</option>
          </select>
        </div>
      )}
    </div>
  );
};

// Componente helper per visualizzare un riassunto della classificazione
const ClassificationSummary: React.FC<{ classification: Partial<ColumnClassification> }> = ({ classification }) => {
  return (
    <div className="flex items-center space-x-3">
      <Badge variant="default" className="text-sm">
        {getDisplayType(classification)}
      </Badge>
      <div className="text-xs text-gray-600">
        Confidenza: {Math.round((classification.confidence || 0.8) * 100)}%
      </div>
    </div>
  );
};

export default BatchClassificationWizard;

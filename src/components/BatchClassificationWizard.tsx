import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckCircle, ArrowRight, ArrowLeft, AlertTriangle, Eye } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnClassification, BatchClassificationOperation, ColumnMetadata, ColumnType } from '../types/analysis';
import { ClassificationSelector } from './ClassificationSelector';

interface BatchClassificationWizardProps {
  selectedColumns: number[]; // Indicizzazione per colonna basata su numero
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
  const [individualOperations, setIndividualOperations] = useState<Map<number, ColumnClassification>>(new Map());
  const [classificationMode, setClassificationMode] = useState<'uniform' | 'individual'>('uniform');
  const [uniformClassification, setUniformClassification] = useState<ColumnClassification>({
    type: 'non_classificata',
    subtype: null,
    category: null,
    confidence: 1.0,
    aiGenerated: false
  });

  const { columnMetadata, previewBatchClassification } = useAnalysisStore();

  const selectedColumnData = columnMetadata.filter((col, index) => selectedColumns.includes(index));

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
          <div key={column.name} className="flex items-center justify-between p-3 border-b last:border-b-0">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                {index + 1}
              </Badge>
              <span className="font-medium">{column.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              {column.classification?.type || 'Non classificata'}
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

  // Step 3: Configurazione (Individuale o Uniforme)
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
                <div key={column.name} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm font-medium">{column.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {column.classification?.type || 'Non classificata'} → {uniformClassification.type}
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
            <Card key={column.name} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <span className="font-medium">{column.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.classification?.type || 'Non classificata'}
                  </Badge>
                </div>
                <ClassificationSelector 
                  classification={
                    individualOperations.get(column.index) || 
                    column.classification || 
                    uniformClassification
                  }
                  onChange={(classification) => {
                    setIndividualOperations(prev => {
                      const newMap = new Map(prev);
                      newMap.set(column.index, classification);
                      return newMap;
                    });
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
    const previewOps = classificationMode === 'uniform' 
      ? selectedColumns.map(colIndex => ({
          columnIndex: colIndex,
          classification: uniformClassification
        }))
      : selectedColumns.map(colIndex => ({
          columnIndex: colIndex,
          classification: individualOperations.get(colIndex) || uniformClassification
        }));

    const changes = previewOps.map(op => {
      const column = columnMetadata.find(col => col.index === op.columnIndex);
      if (!column) {
        return null;
      }
      return {
        column: column,
        from: column.classification || { type: 'non_classificata', subtype: null, category: null, confidence: 0, aiGenerated: false },
        to: op.classification
      };
    }).filter(Boolean) as Array<{
      column: any;
      from: any;
      to: any;
    }>;

    const stats = {
      total: changes.length,
      modified: changes.filter(change => change.from.type !== change.to.type).length,
      anagrafica: changes.filter(change => change.to.type === 'anagrafica').length,
      nonAnagrafica: changes.filter(change => change.to.type === 'non_anagrafica').length
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
              <div className="text-2xl font-bold text-purple-600">{stats.anagrafica}</div>
              <div className="text-xs text-gray-600">Anagrafiche</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.nonAnagrafica}</div>
              <div className="text-xs text-gray-600">Non anagrafiche</div>
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
              <div key={change.column.name} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <span className="font-medium">{change.column.name}</span>
                <div className="flex items-center space-x-2 text-sm">
                  <Badge variant="outline">{change.from.type}</Badge>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <Badge variant="default">{change.to.type}</Badge>
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
          (classificationMode === 'uniform' && uniformClassification.type !== 'non_classificata')
        );
      case 2:
        return classificationMode === 'uniform' || individualOperations.size === selectedColumns.length;
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
      : individualOperations.get(selectedColumns[0]) || uniformClassification;

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

// Componente helper per visualizzare un riassunto della classificazione
const ClassificationSummary: React.FC<{ classification: ColumnClassification }> = ({ classification }) => {
  const getDisplayText = () => {
    let text = classification.type.replace('_', ' ').charAt(0).toUpperCase() + classification.type.slice(1);
    if (classification.subtype) {
      text += ` > ${classification.subtype.charAt(0).toUpperCase() + classification.subtype.slice(1)}`;
    }
    if (classification.category) {
      text += ` > ${classification.category.replace('_', ' ')}`;
    }
    return text;
  };

  return (
    <div className="flex items-center space-x-3">
      <Badge variant="default" className="text-sm">
        {getDisplayText()}
      </Badge>
      <div className="text-xs text-gray-600">
        Confidenza: {Math.round(classification.confidence * 100)}%
      </div>
    </div>
  );
};

export default BatchClassificationWizard;

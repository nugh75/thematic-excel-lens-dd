import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  User, 
  BarChart3, 
  MessageSquare, 
  Eye, 
  Edit, 
  Check, 
  X,
  Info,
  Lightbulb,
  Save
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import { ColumnType, ColumnMetadata } from '../types/analysis';

const ColumnConfigurator = () => {
  const { 
    currentProject, 
    configureColumns, 
    updateColumnType,
    getOpenQuestionColumns,
    getClosedQuestionColumns,
    getDemographicColumns
  } = useAnalysisStore();
  
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [tempDescription, setTempDescription] = useState('');
  
  if (!currentProject) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Carica un progetto per configurare le colonne</p>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: ColumnType) => {
    switch (type) {
      case 'demographic':
        return <User className="h-4 w-4" />;
      case 'closed':
        return <BarChart3 className="h-4 w-4" />;
      case 'open':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ColumnType) => {
    switch (type) {
      case 'demographic':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'closed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'open':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getTypeDescription = (type: ColumnType) => {
    switch (type) {
      case 'demographic':
        return 'Dati anagrafici - Non vengono etichettati';
      case 'closed':
        return 'Domande chiuse - Per analisi statistica';
      case 'open':
        return 'Domande aperte - Per etichettatura tematica';
    }
  };

  const handleTypeChange = (columnIndex: number, newType: ColumnType) => {
    updateColumnType(columnIndex, newType);
    toast({
      title: "Tipo colonna aggiornato",
      description: `La colonna è stata configurata come "${getTypeDescription(newType)}"`,
    });
  };

  const handleSaveDescription = (columnIndex: number) => {
    // In futuro potremo aggiungere una funzione per aggiornare la descrizione
    setEditingColumn(null);
    setTempDescription('');
    toast({
      title: "Descrizione salvata",
      description: "La descrizione della colonna è stata aggiornata",
    });
  };

  const handleConfirmConfiguration = () => {
    const updatedMetadata = currentProject.config.columnMetadata.map(col => ({
      ...col,
      isRequired: col.type === 'open', // Le domande aperte sono richieste per l'etichettatura
    }));
    
    configureColumns(updatedMetadata);
    toast({
      title: "Configurazione salvata",
      description: "La configurazione delle colonne è stata salvata con successo",
    });
  };

  const openQuestions = getOpenQuestionColumns();
  const closedQuestions = getClosedQuestionColumns(); 
  const demographicQuestions = getDemographicColumns();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configurazione Colonne</h2>
          <p className="text-gray-600">
            Configura il tipo di ogni colonna per ottimizzare l'analisi
          </p>
        </div>
        <Button onClick={handleConfirmConfiguration} className="gap-2">
          <Save className="h-4 w-4" />
          Salva Configurazione
        </Button>
      </div>

      {/* Stato configurazione */}
      <Card className={currentProject.config.isConfigured ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            {currentProject.config.isConfigured ? (
              <>
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Configurazione completata</span>
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Configurazione automatica rilevata - Verifica e conferma</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{demographicQuestions.length}</p>
                <p className="text-sm text-gray-600">Dati Anagrafici</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{closedQuestions.length}</p>
                <p className="text-sm text-gray-600">Domande Chiuse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{openQuestions.length}</p>
                <p className="text-sm text-gray-600">Domande Aperte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs per tipo di colonna */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tutte ({currentProject.config.columnMetadata.length})</TabsTrigger>
          <TabsTrigger value="open">Aperte ({openQuestions.length})</TabsTrigger>
          <TabsTrigger value="closed">Chiuse ({closedQuestions.length})</TabsTrigger>
          <TabsTrigger value="demographic">Anagrafiche ({demographicQuestions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ColumnsList 
            columns={currentProject.config.columnMetadata}
            onTypeChange={handleTypeChange}
            editingColumn={editingColumn}
            setEditingColumn={setEditingColumn}
            tempDescription={tempDescription}
            setTempDescription={setTempDescription}
            onSaveDescription={handleSaveDescription}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getTypeDescription={getTypeDescription}
          />
        </TabsContent>

        <TabsContent value="open">
          <ColumnsList 
            columns={openQuestions}
            onTypeChange={handleTypeChange}
            editingColumn={editingColumn}
            setEditingColumn={setEditingColumn}
            tempDescription={tempDescription}
            setTempDescription={setTempDescription}
            onSaveDescription={handleSaveDescription}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getTypeDescription={getTypeDescription}
          />
        </TabsContent>

        <TabsContent value="closed">
          <ColumnsList 
            columns={closedQuestions}
            onTypeChange={handleTypeChange}
            editingColumn={editingColumn}
            setEditingColumn={setEditingColumn}
            tempDescription={tempDescription}
            setTempDescription={setTempDescription}
            onSaveDescription={handleSaveDescription}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getTypeDescription={getTypeDescription}
          />
        </TabsContent>

        <TabsContent value="demographic">
          <ColumnsList 
            columns={demographicQuestions}
            onTypeChange={handleTypeChange}
            editingColumn={editingColumn}
            setEditingColumn={setEditingColumn}
            tempDescription={tempDescription}
            setTempDescription={setTempDescription}
            onSaveDescription={handleSaveDescription}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getTypeDescription={getTypeDescription}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente per la lista delle colonne
interface ColumnsListProps {
  columns: ColumnMetadata[];
  onTypeChange: (columnIndex: number, newType: ColumnType) => void;
  editingColumn: number | null;
  setEditingColumn: (index: number | null) => void;
  tempDescription: string;
  setTempDescription: (desc: string) => void;
  onSaveDescription: (columnIndex: number) => void;
  getTypeIcon: (type: ColumnType) => React.ReactNode;
  getTypeColor: (type: ColumnType) => string;
  getTypeDescription: (type: ColumnType) => string;
}

const ColumnsList: React.FC<ColumnsListProps> = ({
  columns,
  onTypeChange,
  editingColumn,
  setEditingColumn,
  tempDescription,
  setTempDescription,
  onSaveDescription,
  getTypeIcon,
  getTypeColor,
  getTypeDescription,
}) => {
  return (
    <div className="space-y-3">
      {columns.map((column) => (
        <Card key={column.index} className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{column.name}</h3>
                  <Badge className={`gap-1 ${getTypeColor(column.type)}`}>
                    {getTypeIcon(column.type)}
                    {column.type}
                  </Badge>
                  {column.autoDetected && (
                    <Badge variant="outline" className="text-xs">
                      Auto-rilevato
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {getTypeDescription(column.type)}
                </p>

                {column.sampleValues && column.sampleValues.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Valori di esempio:</p>
                    <div className="flex flex-wrap gap-1">
                      {column.sampleValues.slice(0, 3).map((value, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {value.length > 30 ? value.slice(0, 30) + '...' : value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {editingColumn === column.index ? (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Aggiungi una descrizione..."
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => onSaveDescription(column.index)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingColumn(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {column.description ? (
                      <p className="text-sm text-gray-700">{column.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Nessuna descrizione</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Select
                  value={column.type}
                  onValueChange={(value: ColumnType) => onTypeChange(column.index, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demographic">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Anagrafica
                      </div>
                    </SelectItem>
                    <SelectItem value="closed">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Chiusa
                      </div>
                    </SelectItem>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Aperta
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingColumn(column.index);
                    setTempDescription(column.description || '');
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ColumnConfigurator;

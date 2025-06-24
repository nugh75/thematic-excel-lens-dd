import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Target,
  Hash,
  Type
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnType, SmartSelectionOptions } from '../types/analysis';

interface MultiSelectColumnListProps {
  selectedColumns: Set<number>;
  onSelectionChange: (selectedColumns: Set<number>) => void;
  showPreview?: boolean;
}

export function MultiSelectColumnList({ 
  selectedColumns, 
  onSelectionChange,
  showPreview = true 
}: MultiSelectColumnListProps) {
  const { 
    excelData, 
    columnMetadata, 
    selectColumnsByPattern,
    selectColumnsByType,
    selectColumnsByRange 
  } = useAnalysisStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ColumnType | 'all'>('all');
  const [smartSelectionMode, setSmartSelectionMode] = useState<'manual' | 'pattern' | 'type' | 'range'>('manual');
  const [patternInput, setPatternInput] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  if (!excelData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Carica un file Excel per vedere le colonne</p>
        </CardContent>
      </Card>
    );
  }

  const filteredColumns = excelData.headers
    .map((header, index) => {
      const metadata = columnMetadata.find(m => m.index === index);
      return {
        index,
        name: header,
        type: metadata?.type || 'non_demographic',
        classified: !!metadata?.classification,
        autoDetected: metadata?.autoDetected || false
      };
    })
    .filter(col => {
      // Filtro per termine di ricerca
      if (searchTerm && !col.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro per tipo
      if (filterType !== 'all' && col.type !== filterType) {
        return false;
      }
      
      return true;
    });

  const handleColumnToggle = (columnIndex: number) => {
    const newSelection = new Set(selectedColumns);
    if (newSelection.has(columnIndex)) {
      newSelection.delete(columnIndex);
    } else {
      newSelection.add(columnIndex);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allFilteredIndexes = new Set(filteredColumns.map(col => col.index));
    onSelectionChange(allFilteredIndexes);
  };

  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };

  const handleSmartSelection = () => {
    let selectedIndexes: number[] = [];
    
    switch (smartSelectionMode) {
      case 'pattern':
        if (patternInput.trim()) {
          selectedIndexes = selectColumnsByPattern(patternInput.trim());
        }
        break;
      case 'type':
        if (filterType !== 'all') {
          selectedIndexes = selectColumnsByType(filterType as ColumnType, true);
        }
        break;
      case 'range':
        const start = parseInt(rangeStart);
        const end = parseInt(rangeEnd);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          selectedIndexes = selectColumnsByRange(start, end);
        }
        break;
    }
    
    onSelectionChange(new Set(selectedIndexes));
  };

  const getTypeColor = (type: ColumnType): string => {
    const colors: Record<string, string> = {
      'demographic': 'bg-blue-100 text-blue-800',
      'demographic_age': 'bg-blue-100 text-blue-800',
      'demographic_gender': 'bg-blue-100 text-blue-800',
      'demographic_location': 'bg-blue-100 text-blue-800',
      'demographic_education': 'bg-blue-100 text-blue-800',
      'demographic_profession': 'bg-blue-100 text-blue-800',
      'demographic_other': 'bg-blue-100 text-blue-800',
      'closed': 'bg-green-100 text-green-800',
      'closed_numeric': 'bg-green-100 text-green-800',
      'closed_likert': 'bg-green-100 text-green-800',
      'closed_yesno': 'bg-green-100 text-green-800',
      'closed_multichoice': 'bg-green-100 text-green-800',
      'closed_singlechoice': 'bg-green-100 text-green-800',
      'open': 'bg-orange-100 text-orange-800',
      'open_structured': 'bg-orange-100 text-orange-800',
      'open_unstructured': 'bg-orange-100 text-orange-800',
      'non_demographic': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: ColumnType): string => {
    const labels: Record<ColumnType, string> = {
      'demographic': 'Anagrafica',
      'non_demographic': 'Non Anagrafica',
      'closed': 'Chiusa',
      'open': 'Aperta',
      'open_structured': 'Aperta Strutturata',
      'open_unstructured': 'Aperta Non Strutturata',
      'closed_numeric': 'Numerica',
      'closed_likert': 'Likert',
      'closed_yesno': 'Sì/No',
      'closed_multichoice': 'Scelta Multipla',
      'closed_singlechoice': 'Scelta Singola',
      'demographic_age': 'Età',
      'demographic_gender': 'Genere',
      'demographic_location': 'Località',
      'demographic_education': 'Istruzione',
      'demographic_profession': 'Professione',
      'demographic_other': 'Altro Anagrafico'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Selezione Colonne Multiple
          {selectedColumns.size > 0 && (
            <Badge variant="secondary">
              {selectedColumns.size} selezionate
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Filtri e Ricerca */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cerca colonne</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Nome colonna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Filtra per tipo</Label>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as ColumnType | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="demographic">Anagrafiche</SelectItem>
                <SelectItem value="closed">Chiuse</SelectItem>
                <SelectItem value="open">Aperte</SelectItem>
                <SelectItem value="non_demographic">Non Classificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selezione Intelligente */}
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <Label className="text-sm font-medium">Selezione Intelligente</Label>
          
          <div className="grid grid-cols-4 gap-2">
            <Button
              size="sm"
              variant={smartSelectionMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setSmartSelectionMode('manual')}
            >
              Manuale
            </Button>
            <Button
              size="sm"
              variant={smartSelectionMode === 'pattern' ? 'default' : 'outline'}
              onClick={() => setSmartSelectionMode('pattern')}
              className="flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              Pattern
            </Button>
            <Button
              size="sm"
              variant={smartSelectionMode === 'type' ? 'default' : 'outline'}
              onClick={() => setSmartSelectionMode('type')}
              className="flex items-center gap-1"
            >
              <Type className="h-3 w-3" />
              Tipo
            </Button>
            <Button
              size="sm"
              variant={smartSelectionMode === 'range' ? 'default' : 'outline'}
              onClick={() => setSmartSelectionMode('range')}
              className="flex items-center gap-1"
            >
              <Hash className="h-3 w-3" />
              Range
            </Button>
          </div>

          {smartSelectionMode === 'pattern' && (
            <div className="flex gap-2">
              <Input
                placeholder="es. 'età', 'nome', 'rating'"
                value={patternInput}
                onChange={(e) => setPatternInput(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSmartSelection}>
                Seleziona
              </Button>
            </div>
          )}

          {smartSelectionMode === 'range' && (
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Da"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                type="number"
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">a</span>
              <Input
                placeholder="A"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                type="number"
                className="w-20"
              />
              <Button size="sm" onClick={handleSmartSelection}>
                Seleziona
              </Button>
            </div>
          )}

          {smartSelectionMode === 'type' && (
            <Button size="sm" onClick={handleSmartSelection}>
              Seleziona per tipo attuale
            </Button>
          )}
        </div>

        {/* Azioni Globali */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSelectAll}
            className="flex items-center gap-1"
          >
            <CheckSquare className="h-3 w-3" />
            Seleziona Tutte ({filteredColumns.length})
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleDeselectAll}
            className="flex items-center gap-1"
          >
            <Square className="h-3 w-3" />
            Deseleziona Tutte
          </Button>
        </div>

        {/* Lista Colonne */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredColumns.map((column) => (
            <div
              key={column.index}
              className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                selectedColumns.has(column.index)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleColumnToggle(column.index)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedColumns.has(column.index)}
                  onChange={() => handleColumnToggle(column.index)}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{column.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Colonna {column.index + 1}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(column.type)}>
                  {getTypeLabel(column.type)}
                </Badge>
                {column.autoDetected && (
                  <Badge variant="outline" className="text-xs">
                    Auto
                  </Badge>
                )}
                {!column.classified && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Non classificata
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Riepilogo Selezione */}
        {showPreview && selectedColumns.size > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Selezione Attuale ({selectedColumns.size} colonne)
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedColumns)
                .slice(0, 5)
                .map(index => {
                  const column = filteredColumns.find(c => c.index === index);
                  return column ? (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {column.name}
                    </Badge>
                  ) : null;
                })}
              {selectedColumns.size > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedColumns.size - 5} altre
                </Badge>
              )}
            </div>
          </div>
        )}

        {filteredColumns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessuna colonna trovata con i filtri attuali</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MultiSelectColumnList;

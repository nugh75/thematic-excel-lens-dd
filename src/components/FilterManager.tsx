import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Trash2, Filter, Plus, X } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { AnalysisFilter, ColumnType } from '../types/analysis';

export function FilterManager() {
  const store = useAnalysisStore();
  
  // Controlli di sicurezza per evitare errori
  if (!store) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Store non disponibile</h3>
          <p className="text-sm text-muted-foreground">
            Errore nel caricamento dello store
          </p>
        </CardContent>
      </Card>
    );
  }

  const { excelData, currentProject } = store;
  const filters = store.filters || [];
  const setFilters = store.setFilters;
  
  const [isCreatingFilter, setIsCreatingFilter] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<AnalysisFilter>>({
    columnIndex: 0,
    type: 'equals',
    value: '',
    active: true
  });

  // Safety check per assicurarci che setFilters esista
  const safeSetFilters = setFilters || (() => {
    console.warn('setFilters not available in store');
  });

  if (!excelData || !currentProject || !currentProject.config || !currentProject.config.columnMetadata) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Nessun Progetto Attivo</h3>
          <p className="text-sm text-muted-foreground">
            Carica un progetto per gestire i filtri
          </p>
        </CardContent>
      </Card>
    );
  }

  // Controllo sicuro per le colonne demografiche
  const getDemographicColumns = () => {
    try {
      const metadata = currentProject?.config?.columnMetadata;
      if (!metadata || !Array.isArray(metadata)) return [];
      
      return metadata.filter(col => 
        col && col.type && (
          col.type === 'demographic' || 
          col.type === 'demographic_multiplechoice' || 
          col.type === 'demographic_numeric' || 
          col.type === 'demographic_code'
        )
      );
    } catch (error) {
      console.warn('Error filtering demographic columns:', error);
      return [];
    }
  };

  const demographicColumns = getDemographicColumns();

  const getColumnType = (columnIndex: number): ColumnType => {
    try {
      if (!currentProject?.config?.columnMetadata) return 'open';
      const metadata = currentProject.config.columnMetadata.find(col => col.index === columnIndex);
      return metadata?.type || 'open';
    } catch (error) {
      console.warn('Error getting column type:', error);
      return 'open';
    }
  };

  const getUniqueValues = (columnIndex: number): string[] => {
    try {
      if (!excelData?.rows) return [];
      const values = excelData.rows.map(row => row[columnIndex]).filter(val => val && val.trim());
      return [...new Set(values)].slice(0, 20); // Limita a 20 per performance
    } catch (error) {
      console.warn('Error getting unique values:', error);
      return [];
    }
  };

  const handleCreateFilter = () => {
    try {
      if (!newFilter.columnIndex && newFilter.columnIndex !== 0) return;
      if (!excelData?.headers) return;
      
      const columnName = excelData.headers[newFilter.columnIndex];
      if (!columnName) return;
      
      const filter: AnalysisFilter = {
        id: Date.now().toString(),
        columnIndex: newFilter.columnIndex,
        columnName,
        type: newFilter.type || 'equals',
        value: newFilter.value || '',
        active: true
      };

      safeSetFilters([...filters, filter]);
      setNewFilter({ columnIndex: 0, type: 'equals', value: '', active: true });
      setIsCreatingFilter(false);
    } catch (error) {
      console.error('Error creating filter:', error);
    }
  };

  const handleDeleteFilter = (filterId: string) => {
    try {
      safeSetFilters(filters.filter(f => f.id !== filterId));
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  };

  const handleToggleFilter = (filterId: string) => {
    try {
      safeSetFilters(filters.map(f => 
        f.id === filterId ? { ...f, active: !f.active } : f
      ));
    } catch (error) {
      console.error('Error toggling filter:', error);
    }
  };

  const renderFilterValue = (filter: AnalysisFilter) => {
    try {
      if (Array.isArray(filter.value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {filter.value.slice(0, 3).map((val, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {val}
              </Badge>
            ))}
            {filter.value.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{filter.value.length - 3}
              </Badge>
            )}
          </div>
        );
      }

      return (
        <Badge variant="secondary" className="text-xs">
          {filter.value.toString()}
        </Badge>
      );
    } catch (error) {
      console.warn('Error rendering filter value:', error);
      return (
        <Badge variant="secondary" className="text-xs">
          Errore
        </Badge>
      );
    }
  };

  const renderFilterForm = () => {
    if (demographicColumns.length === 0) {
      return (
        <Card className="border-2 border-dashed border-orange-200">
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">Nessuna Colonna Anagrafica</h3>
            <p className="text-sm text-muted-foreground">
              Configura almeno una colonna come "Anagrafica" nella sezione Config Colonne per creare filtri.
            </p>
          </CardContent>
        </Card>
      );
    }

    const selectedColumnType = getColumnType(newFilter.columnIndex || 0);
    const uniqueValues = getUniqueValues(newFilter.columnIndex || 0);

    return (
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuovo Filtro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Colonna da Filtrare</Label>
              <Select 
                value={newFilter.columnIndex?.toString()} 
                onValueChange={(value) => setNewFilter({...newFilter, columnIndex: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona colonna" />
                </SelectTrigger>
                <SelectContent>
                  {demographicColumns.map((col) => (
                    <SelectItem key={col.index} value={col.index.toString()}>
                      {col.name} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo di Filtro</Label>
              <Select 
                value={newFilter.type} 
                onValueChange={(value) => setNewFilter({...newFilter, type: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Uguale a</SelectItem>
                  <SelectItem value="contains">Contiene</SelectItem>
                  <SelectItem value="in">È uno di</SelectItem>
                  <SelectItem value="not_in">Non è uno di</SelectItem>
                  {selectedColumnType === 'numeric' && (
                    <SelectItem value="range">Intervallo</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valore del filtro */}
          <div className="space-y-2">
            <Label>Valore</Label>
            {newFilter.type === 'in' || newFilter.type === 'not_in' ? (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Seleziona i valori (max 10):
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {uniqueValues.map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={Array.isArray(newFilter.value) && newFilter.value.some(v => v.toString() === value)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(newFilter.value) ? newFilter.value : [];
                          if (checked) {
                            if (currentValues.length < 10) {
                              setNewFilter({...newFilter, value: [...currentValues, value]});
                            }
                          } else {
                            setNewFilter({...newFilter, value: currentValues.filter(v => v.toString() !== value)});
                          }
                        }}
                      />
                      <Label htmlFor={value} className="text-sm truncate">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : newFilter.type === 'range' && selectedColumnType === 'numeric' ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={Array.isArray(newFilter.value) ? newFilter.value[0]?.toString() || '' : ''}
                  onChange={(e) => {
                    const current = Array.isArray(newFilter.value) ? newFilter.value : ['', ''];
                    setNewFilter({...newFilter, value: [e.target.value, current[1] || '']});
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={Array.isArray(newFilter.value) ? newFilter.value[1]?.toString() || '' : ''}
                  onChange={(e) => {
                    const current = Array.isArray(newFilter.value) ? newFilter.value : ['', ''];
                    setNewFilter({...newFilter, value: [current[0] || '', e.target.value]});
                  }}
                />
              </div>
            ) : (
              <Input
                placeholder="Inserisci valore"
                value={typeof newFilter.value === 'string' ? newFilter.value : ''}
                onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreateFilter} disabled={!newFilter.value}>
              <Plus className="h-4 w-4 mr-2" />
              Crea Filtro
            </Button>
            <Button variant="outline" onClick={() => setIsCreatingFilter(false)}>
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-6 w-6 text-primary" />
            Gestione Filtri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{filters.length}</p>
                <p className="text-sm text-muted-foreground">Filtri Totali</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Filter className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{filters.filter(f => f.active).length}</p>
                <p className="text-sm text-muted-foreground">Filtri Attivi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{demographicColumns.length}</p>
                <p className="text-sm text-muted-foreground">Colonne Disponibili</p>
              </div>
            </div>
          </div>

          {!isCreatingFilter && (
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setIsCreatingFilter(true)}
                disabled={demographicColumns.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Filtro
              </Button>
            </div>
          )}

          {demographicColumns.length === 0 && !isCreatingFilter && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <h4 className="font-medium text-orange-900 mb-2">Configurazione Richiesta</h4>
                <p className="text-sm text-orange-800">
                  Per creare filtri, configura almeno una colonna come "Anagrafica" nella sezione 
                  Config Colonne del tab Gestione Etichette.
                </p>
              </CardContent>
            </Card>
          )}

          {isCreatingFilter && renderFilterForm()}

          {/* Lista filtri esistenti */}
          {filters.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Filtri Esistenti</h3>
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={filter.active}
                      onCheckedChange={() => handleToggleFilter(filter.id)}
                    />
                    <div>
                      <div className="font-medium">
                        {filter.columnName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {filter.type} {renderFilterValue(filter)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFilter(filter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FilterManager;

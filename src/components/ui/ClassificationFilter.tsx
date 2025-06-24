import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Search, Filter, X } from 'lucide-react';
import { ColumnClassification } from '../../types/analysis';
import { ClassificationBadge } from './ClassificationBadge';
import { 
  filterColumnsByClassification, 
  searchInClassifications,
  getClassificationStats 
} from '../../utils/classificationDisplay';

interface ClassificationFilterProps {
  columns: Array<{ 
    index: number;
    name: string; 
    classification?: ColumnClassification 
  }>;
  onFilteredColumnsChange: (filteredColumns: typeof columns) => void;
  showStats?: boolean;
  compact?: boolean;
}

export const ClassificationFilter: React.FC<ClassificationFilterProps> = ({
  columns,
  onFilteredColumnsChange,
  showStats = true,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata'>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<'all' | 'chiusa' | 'aperta'>('all');

  // Applica filtri e ricerca
  React.useEffect(() => {
    let filtered = filterColumnsByClassification(columns, typeFilter);
    
    // Filtro per sottotipo
    if (subtypeFilter !== 'all') {
      filtered = filtered.filter(col => col.classification?.subtype === subtypeFilter);
    }
    
    // Ricerca
    filtered = searchInClassifications(filtered, searchTerm);
    
    onFilteredColumnsChange(filtered);
  }, [columns, typeFilter, subtypeFilter, searchTerm, onFilteredColumnsChange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSubtypeFilter('all');
  };

  const stats = getClassificationStats(columns);
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || subtypeFilter !== 'all';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Ricerca compatta */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-40"
          />
        </div>

        {/* Filtro tipo compatto */}
        <Select value={typeFilter} onValueChange={(value: typeof typeFilter) => setTypeFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti ({columns.length})</SelectItem>
            <SelectItem value="anagrafica">👤 Ana ({stats.anagrafica})</SelectItem>
            <SelectItem value="non_anagrafica">📊 Non-Ana ({stats.non_anagrafica})</SelectItem>
            <SelectItem value="non_classificata">❓ N/C ({stats.non_classificata})</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset filtri */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filtri Classificazione
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ricerca */}
        <div className="space-y-2">
          <Label>Ricerca</Label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o classificazione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtro per tipo principale */}
        <div className="space-y-2">
          <Label>Tipo Principale</Label>
          <Select value={typeFilter} onValueChange={(value: typeof typeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  Tutti i tipi
                  <Badge variant="secondary">{columns.length}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="anagrafica">
                <div className="flex items-center gap-2">
                  <ClassificationBadge 
                    classification={{ type: 'anagrafica', subtype: null, category: null, confidence: 1, aiGenerated: false }} 
                    variant="icon-only" 
                    showTooltip={false} 
                  />
                  Anagrafiche
                  <Badge variant="secondary">{stats.anagrafica}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="non_anagrafica">
                <div className="flex items-center gap-2">
                  <ClassificationBadge 
                    classification={{ type: 'non_anagrafica', subtype: null, category: null, confidence: 1, aiGenerated: false }} 
                    variant="icon-only" 
                    showTooltip={false} 
                  />
                  Non anagrafiche
                  <Badge variant="secondary">{stats.non_anagrafica}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="non_classificata">
                <div className="flex items-center gap-2">
                  <ClassificationBadge variant="icon-only" showTooltip={false} />
                  Non classificate
                  <Badge variant="secondary">{stats.non_classificata}</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro per sottotipo */}
        {typeFilter !== 'all' && typeFilter !== 'non_classificata' && (
          <div className="space-y-2">
            <Label>Sottotipo</Label>
            <Select value={subtypeFilter} onValueChange={(value: typeof subtypeFilter) => setSubtypeFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i sottotipi</SelectItem>
                <SelectItem value="chiusa">Chiusa (lista predefinita)</SelectItem>
                <SelectItem value="aperta">Aperta (testo libero)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Statistiche filtri attivi */}
        {showStats && hasActiveFilters && (
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Filtri attivi: {hasActiveFilters ? 'Sì' : 'No'}
            </div>
          </div>
        )}

        {/* Reset filtri */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Reset filtri
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

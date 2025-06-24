import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import { BarChart3, Filter, Eye, EyeOff } from 'lucide-react';
import { ColumnClassification } from '../../types/analysis';
import { getClassificationStats, getClassificationIcon } from '../../utils/classificationDisplay';

interface ClassificationStatsProps {
  columns: Array<{ 
    index: number;
    name: string; 
    classification?: ColumnClassification 
  }>;
  onFilterChange?: (filter: 'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata') => void;
  currentFilter?: 'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata';
  onToggleVisibility?: (type: 'anagrafica' | 'non_anagrafica' | 'non_classificata', visible: boolean) => void;
  hiddenTypes?: Array<'anagrafica' | 'non_anagrafica' | 'non_classificata'>;
}

export const ClassificationStats: React.FC<ClassificationStatsProps> = ({
  columns,
  onFilterChange,
  currentFilter = 'all',
  onToggleVisibility,
  hiddenTypes = []
}) => {
  const stats = getClassificationStats(columns);

  const handleFilterClick = (filter: typeof currentFilter) => {
    if (onFilterChange) {
      onFilterChange(filter === currentFilter ? 'all' : filter);
    }
  };

  const handleToggleVisibility = (type: 'anagrafica' | 'non_anagrafica' | 'non_classificata') => {
    if (onToggleVisibility) {
      const isHidden = hiddenTypes.includes(type);
      onToggleVisibility(type, isHidden);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Statistiche Classificazioni
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progresso generale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Completamento classificazione</span>
            <span className="font-medium">{stats.completionPercentage}%</span>
          </div>
          <Progress value={stats.completionPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {stats.anagrafica + stats.non_anagrafica} di {stats.total} colonne classificate
          </div>
        </div>

        {/* Contatori per tipo */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Tipi di classificazione</div>
          
          {/* Anagrafica */}
          <div className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getClassificationIcon('anagrafica')}</span>
              <div>
                <div className="font-medium text-sm">Anagrafiche</div>
                <div className="text-xs text-muted-foreground">
                  {stats.anagrafica} colonne
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant={currentFilter === 'anagrafica' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => handleFilterClick('anagrafica')}
              >
                <Filter className="h-3 w-3 mr-1" />
                {stats.anagrafica}
              </Badge>
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleToggleVisibility('anagrafica')}
                >
                  {hiddenTypes.includes('anagrafica') ? 
                    <EyeOff className="h-3 w-3" /> : 
                    <Eye className="h-3 w-3" />
                  }
                </Button>
              )}
            </div>
          </div>

          {/* Non anagrafica */}
          <div className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getClassificationIcon('non_anagrafica')}</span>
              <div>
                <div className="font-medium text-sm">Non anagrafiche</div>
                <div className="text-xs text-muted-foreground">
                  {stats.non_anagrafica} colonne
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant={currentFilter === 'non_anagrafica' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => handleFilterClick('non_anagrafica')}
              >
                <Filter className="h-3 w-3 mr-1" />
                {stats.non_anagrafica}
              </Badge>
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleToggleVisibility('non_anagrafica')}
                >
                  {hiddenTypes.includes('non_anagrafica') ? 
                    <EyeOff className="h-3 w-3" /> : 
                    <Eye className="h-3 w-3" />
                  }
                </Button>
              )}
            </div>
          </div>

          {/* Non classificata */}
          <div className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getClassificationIcon('non_classificata')}</span>
              <div>
                <div className="font-medium text-sm">Non classificate</div>
                <div className="text-xs text-muted-foreground">
                  {stats.non_classificata} colonne
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant={currentFilter === 'non_classificata' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => handleFilterClick('non_classificata')}
              >
                <Filter className="h-3 w-3 mr-1" />
                {stats.non_classificata}
              </Badge>
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleToggleVisibility('non_classificata')}
                >
                  {hiddenTypes.includes('non_classificata') ? 
                    <EyeOff className="h-3 w-3" /> : 
                    <Eye className="h-3 w-3" />
                  }
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Azioni rapide */}
        {(onFilterChange || onToggleVisibility) && (
          <div className="pt-2 border-t space-y-2">
            {onFilterChange && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onFilterChange('all')}
                disabled={currentFilter === 'all'}
              >
                Mostra tutte le colonne
              </Button>
            )}
            {onToggleVisibility && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Toggle all visibility
                  const allHidden = hiddenTypes.length === 3;
                  ['anagrafica', 'non_anagrafica', 'non_classificata'].forEach(type => {
                    onToggleVisibility(type as any, allHidden);
                  });
                }}
              >
                {hiddenTypes.length === 3 ? 'Mostra tutti i tipi' : 'Nascondi tutti i tipi'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Columns3, Eye, EyeOff } from 'lucide-react';

interface ColumnSelectorProps {
  headers: string[];
  visibleColumns: boolean[];
  onColumnToggle: (index: number, visible: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ColumnSelector = ({ 
  headers, 
  visibleColumns, 
  onColumnToggle, 
  onSelectAll, 
  onDeselectAll 
}: ColumnSelectorProps) => {
  const visibleCount = visibleColumns.filter(Boolean).length;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Columns3 className="h-5 w-5 text-primary" />
            Selezione Colonne
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {visibleCount} di {headers.length} colonne visibili
            </Badge>
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              <Eye className="h-4 w-4 mr-1" />
              Tutte
            </Button>
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              <EyeOff className="h-4 w-4 mr-1" />
              Nessuna
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {headers.map((header, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg">
              <Checkbox
                id={`column-${index}`}
                checked={visibleColumns[index]}
                onCheckedChange={(checked) => onColumnToggle(index, checked as boolean)}
              />
              <label htmlFor={`column-${index}`} className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">
                  {header || `Colonna ${index + 1}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  Colonna {index + 1}
                </div>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnSelector;

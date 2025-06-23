
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, Columns, Rows } from 'lucide-react';

interface DataViewSelectorProps {
  currentView: 'grid' | 'column' | 'row';
  onViewChange: (view: 'grid' | 'column' | 'row') => void;
}

const DataViewSelector = ({ currentView, onViewChange }: DataViewSelectorProps) => {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Modalità di Visualizzazione</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            variant={currentView === 'grid' ? 'default' : 'outline'}
            onClick={() => onViewChange('grid')}
            className="flex items-center gap-2"
          >
            <Table className="h-4 w-4" />
            Griglia Completa
          </Button>
          
          <Button
            variant={currentView === 'column' ? 'default' : 'outline'}
            onClick={() => onViewChange('column')}
            className="flex items-center gap-2"
          >
            <Columns className="h-4 w-4" />
            Singola Colonna
          </Button>
          
          <Button
            variant={currentView === 'row' ? 'default' : 'outline'}
            onClick={() => onViewChange('row')}
            className="flex items-center gap-2"
          >
            <Rows className="h-4 w-4" />
            Singola Riga
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataViewSelector;

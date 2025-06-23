import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown, Columns, Tag, Plus } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import { AISuggestions } from './AISuggestions';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const SingleColumnView = () => {
  const { excelData, labels, cellLabels, addCellLabel, removeCellLabel, addLabel } = useAnalysisStore();
  const [selectedColumn, setSelectedColumn] = useState<number>(0);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isLabelingOpen, setIsLabelingOpen] = useState(false);
  
  // Stati per creazione etichette inline
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelDescription, setNewLabelDescription] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  
  const itemsPerPage = 20;

  if (!excelData) return null;

  const columnData = excelData.rows.map((row, index) => ({
    rowIndex: index,
    value: row[selectedColumn] || '',
    labels: cellLabels
      .filter(cl => cl.colIndex === selectedColumn && cl.rowIndex === index)
      .flatMap(cl => cl.labelIds.map(labelId => labels.find(l => l.id === labelId)))
      .filter(Boolean)
  }));

  const visibleData = columnData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    setStartIndex(Math.max(0, startIndex - itemsPerPage));
  };

  const handleNext = () => {
    setStartIndex(Math.min(columnData.length - itemsPerPage, startIndex + itemsPerPage));
  };

  const handleCellClick = (rowIndex: number) => {
    setSelectedCell({ row: rowIndex, col: selectedColumn });
    setIsLabelingOpen(true);
  };

  const getCellLabels = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`;
    const cellLabel = cellLabels.find(cl => cl.cellId === cellId);
    return cellLabel?.labelIds || [];
  };

  const handleLabelToggle = (labelId: string, checked: boolean) => {
    if (!selectedCell) return;
    
    const cellId = `${selectedCell.row}-${selectedCell.col}`;
    
    if (checked) {
      addCellLabel({
        cellId,
        rowIndex: selectedCell.row,
        colIndex: selectedCell.col,
        labelIds: [labelId],
      });
      toast({
        title: "Etichetta aggiunta",
        description: "Etichetta applicata con successo alla cella",
      });
    } else {
      removeCellLabel(cellId, labelId);
      toast({
        title: "Etichetta rimossa",
        description: "Etichetta rimossa dalla cella",
      });
    }
  };

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome dell'etichetta è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    addLabel({
      name: newLabelName.trim(),
      description: newLabelDescription.trim(),
      color: newLabelColor,
    });
    
    toast({
      title: "Etichetta creata",
      description: `Etichetta "${newLabelName}" creata con successo`,
    });

    // Reset form
    setNewLabelName('');
    setNewLabelDescription('');
    setNewLabelColor(colors[0]);
    setIsCreatingLabel(false);
  };

  const selectedLabels = selectedCell ? getCellLabels(selectedCell.row, selectedCell.col) : [];

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Columns className="h-6 w-6 text-primary" />
              Vista Singola Colonna
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <Select 
                value={selectedColumn.toString()} 
                onValueChange={(value) => {
                  setSelectedColumn(parseInt(value));
                  setStartIndex(0);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {excelData.headers.map((header, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Header fisso */}
            <div className="sticky top-0 bg-background border-b p-3 font-semibold text-lg">
              {excelData.headers[selectedColumn]}
            </div>

            {/* Dati della colonna */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {visibleData.map(({ rowIndex, value, labels: cellLabels }) => (
                <div 
                  key={rowIndex} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleCellClick(rowIndex)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-12">
                      #{rowIndex + 1}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {cellLabels?.map(label => (
                      <Badge 
                        key={label.id} 
                        style={{ backgroundColor: label.color, color: 'white' }}
                        className="text-xs"
                      >
                        {label.name}
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCellClick(rowIndex);
                      }}
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Controlli di navigazione */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={startIndex === 0}
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Precedenti
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {startIndex + 1} - {Math.min(startIndex + itemsPerPage, columnData.length)} di {columnData.length}
              </span>
              
              <Button 
                variant="outline" 
                onClick={handleNext}
                disabled={startIndex + itemsPerPage >= columnData.length}
              >
                Successivi
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggerimenti AI per la colonna */}
      <AISuggestions 
        columnName={excelData.headers[selectedColumn]}
        responses={columnData.map(item => item.value)}
      />

      {/* Dialog per etichettatura */}
      <Dialog open={isLabelingOpen} onOpenChange={setIsLabelingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Etichetta Cella
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedCell && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  Riga {selectedCell.row + 1}, Colonna: {excelData.headers[selectedCell.col]}
                </p>
                <p className="text-sm text-muted-foreground">
                  Contenuto: "{excelData.rows[selectedCell.row]?.[selectedCell.col] || 'Vuoto'}"
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Etichette disponibili:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingLabel(!isCreatingLabel)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuova Etichetta
                </Button>
              </div>
              
              {isCreatingLabel && (
                <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                  <div>
                    <Label htmlFor="new-label-name">Nome *</Label>
                    <Input
                      id="new-label-name"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Nome dell'etichetta"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-label-description">Descrizione</Label>
                    <Textarea
                      id="new-label-description"
                      value={newLabelDescription}
                      onChange={(e) => setNewLabelDescription(e.target.value)}
                      placeholder="Descrizione opzionale"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Colore</Label>
                    <div className="flex gap-2 mt-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 ${
                            newLabelColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewLabelColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateLabel}
                      size="sm"
                      className="flex-1"
                    >
                      Crea
                    </Button>
                    <Button
                      onClick={() => setIsCreatingLabel(false)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              )}
              
              {labels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessuna etichetta disponibile. Crea prima delle etichette.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {labels.map(label => (
                    <div key={label.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                      <Checkbox
                        id={label.id}
                        checked={selectedLabels.includes(label.id)}
                        onCheckedChange={(checked) => 
                          handleLabelToggle(label.id, checked as boolean)
                        }
                      />
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: label.color }}
                      />
                      <label htmlFor={label.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{label.name}</div>
                        {label.description && (
                          <div className="text-xs text-muted-foreground">
                            {label.description}
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => setIsLabelingOpen(false)}
              className="w-full"
            >
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SingleColumnView;

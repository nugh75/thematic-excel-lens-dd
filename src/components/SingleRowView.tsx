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
import { ChevronLeft, ChevronRight, Rows, Tag, Plus } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const SingleRowView = () => {
  const { excelData, labels, cellLabels, rowLabels, addCellLabel, removeCellLabel, addRowLabel, removeRowLabel, addLabel } = useAnalysisStore();
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isLabelingOpen, setIsLabelingOpen] = useState(false);
  const [labelingType, setLabelingType] = useState<'cell' | 'row'>('cell');
  
  // Stati per creazione etichette inline
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelDescription, setNewLabelDescription] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  if (!excelData) return null;

  const rowData = excelData.headers.map((header, colIndex) => ({
    header,
    value: excelData.rows[selectedRow]?.[colIndex] || '',
    labels: cellLabels
      .filter(cl => cl.rowIndex === selectedRow && cl.colIndex === colIndex)
      .flatMap(cl => cl.labelIds.map(labelId => labels.find(l => l.id === labelId)))
      .filter(Boolean)
  }));

  const rowLabelData = rowLabels
    .filter(rl => rl.rowIndex === selectedRow)
    .flatMap(rl => rl.labelIds.map(labelId => labels.find(l => l.id === labelId)))
    .filter(Boolean);

  const handlePrevious = () => {
    setSelectedRow(Math.max(0, selectedRow - 1));
  };

  const handleNext = () => {
    setSelectedRow(Math.min(excelData.rows.length - 1, selectedRow + 1));
  };

  const handleCellClick = (colIndex: number) => {
    setSelectedCell({ row: selectedRow, col: colIndex });
    setLabelingType('cell');
    setIsLabelingOpen(true);
  };

  const handleRowLabelClick = () => {
    setSelectedCell(null);
    setLabelingType('row');
    setIsLabelingOpen(true);
  };

  const getCellLabels = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`;
    const cellLabel = cellLabels.find(cl => cl.cellId === cellId);
    return cellLabel?.labelIds || [];
  };

  const getRowLabels = (rowIndex: number) => {
    const rowLabel = rowLabels.find(rl => rl.rowIndex === rowIndex);
    return rowLabel?.labelIds || [];
  };

  const handleLabelToggle = (labelId: string, checked: boolean) => {
    if (labelingType === 'cell' && selectedCell) {
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
    } else if (labelingType === 'row') {
      if (checked) {
        addRowLabel({
          rowIndex: selectedRow,
          labelIds: [labelId],
        });
        toast({
          title: "Etichetta di riga aggiunta",
          description: "Etichetta applicata con successo alla riga",
        });
      } else {
        removeRowLabel(selectedRow, labelId);
        toast({
          title: "Etichetta di riga rimossa",
          description: "Etichetta rimossa dalla riga",
        });
      }
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

  const selectedLabels = labelingType === 'cell' && selectedCell 
    ? getCellLabels(selectedCell.row, selectedCell.col)
    : labelingType === 'row'
    ? getRowLabels(selectedRow)
    : [];

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rows className="h-6 w-6 text-primary" />
              Vista Singola Riga
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <Select 
                value={selectedRow.toString()} 
                onValueChange={(value) => setSelectedRow(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {excelData.rows.map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Riga {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevious}
                  disabled={selectedRow === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNext}
                  disabled={selectedRow >= excelData.rows.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Etichette di riga */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium mb-2">Etichette di Riga:</div>
                  <div className="flex gap-2 flex-wrap">
                    {rowLabelData.length > 0 ? (
                      rowLabelData.map(label => (
                        <Badge 
                          key={label.id} 
                          style={{ backgroundColor: label.color, color: 'white' }}
                        >
                          {label.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Nessuna etichetta di riga</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRowLabelClick}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Etichetta Riga
                </Button>
              </div>
            </div>

            {/* Dati delle celle */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {rowData.map(({ header, value, labels: cellLabels }, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleCellClick(index)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-muted-foreground mb-1">
                      {header}
                    </div>
                    <div className="font-medium">
                      {value || <span className="text-muted-foreground italic">Vuoto</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-4 items-center">
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
                        handleCellClick(index);
                      }}
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog per etichettatura */}
      <Dialog open={isLabelingOpen} onOpenChange={setIsLabelingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {labelingType === 'cell' ? 'Etichetta Cella' : 'Etichetta Riga'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              {labelingType === 'cell' && selectedCell ? (
                <>
                  <p className="text-sm font-medium">
                    Riga {selectedCell.row + 1}, Colonna: {excelData.headers[selectedCell.col]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contenuto: "{excelData.rows[selectedCell.row]?.[selectedCell.col] || 'Vuoto'}"
                  </p>
                </>
              ) : labelingType === 'row' ? (
                <>
                  <p className="text-sm font-medium">
                    Riga {selectedRow + 1} (intera riga)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Etichettando l'intera riga
                  </p>
                </>
              ) : null}
            </div>
            
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

            {/* Creazione nuova etichetta */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingLabel(!isCreatingLabel)}
                className="w-full justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreatingLabel ? 'Annulla' : 'Crea Nuova Etichetta'}
              </Button>
              
              {isCreatingLabel && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="label-name">Nome Etichetta</Label>
                      <Input
                        id="label-name"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        placeholder="Inserisci nome etichetta"
                        className="mt-1"
                      />
                    </div>
                    

                  </div>
                  
                  <div>
                    <Label htmlFor="label-description">Descrizione Etichetta</Label>
                    <Textarea
                      id="label-description"
                      value={newLabelDescription}
                      onChange={(e) => setNewLabelDescription(e.target.value)}
                      placeholder="Inserisci descrizione etichetta"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateLabel}
                    className="w-full"
                  >
                    Crea Etichetta
                  </Button>
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

export default SingleRowView;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Navigation, Search, Tags, Grid, Plus } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

interface CellNavigatorProps {
  onNavigateToCell: (rowIndex: number, colIndex: number) => void;
  onBulkLabel: (rowIndices: number[], colIndices: number[], labelIds: string[]) => void;
}

const CellNavigator = ({ onNavigateToCell, onBulkLabel }: CellNavigatorProps) => {
  const { excelData, labels, addLabel } = useAnalysisStore();
  const [isOpen, setIsOpen] = useState(false);
  const [keyColumn, setKeyColumn] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState('');
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [foundRows, setFoundRows] = useState<number[]>([]);
  
  // Stati per creazione etichette inline
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelDescription, setNewLabelDescription] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  if (!excelData) return null;

  const handleSearch = () => {
    if (keyColumn === null || !searchKey.trim()) {
      toast({
        title: "Errore",
        description: "Seleziona una colonna chiave e inserisci un valore da cercare",
        variant: "destructive"
      });
      return;
    }

    const matchingRows: number[] = [];
    excelData.rows.forEach((row, index) => {
      const cellValue = row[keyColumn]?.toLowerCase() || '';
      if (cellValue.includes(searchKey.toLowerCase())) {
        matchingRows.push(index);
      }
    });

    setFoundRows(matchingRows);
    
    if (matchingRows.length === 0) {
      toast({
        title: "Nessun risultato",
        description: "Nessuna riga trovata con il valore specificato",
      });
    } else {
      toast({
        title: "Ricerca completata",
        description: `Trovate ${matchingRows.length} righe corrispondenti`,
      });
    }
  };

  const handleCellToggle = (rowIndex: number, colIndex: number) => {
    const cellExists = selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
    
    if (cellExists) {
      setSelectedCells(selectedCells.filter(cell => !(cell.row === rowIndex && cell.col === colIndex)));
    } else {
      setSelectedCells([...selectedCells, { row: rowIndex, col: colIndex }]);
    }
  };

  const handleNavigateToFirst = () => {
    if (selectedCells.length > 0) {
      const firstCell = selectedCells[0];
      onNavigateToCell(firstCell.row, firstCell.col);
      toast({
        title: "Navigazione",
        description: `Navigato alla riga ${firstCell.row + 1}, colonna ${firstCell.col + 1}`,
      });
    }
  };

  const handleBulkLabeling = () => {
    if (selectedCells.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno una cella",
        variant: "destructive"
      });
      return;
    }

    if (selectedLabels.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un'etichetta",
        variant: "destructive"
      });
      return;
    }

    const rowIndices = [...new Set(selectedCells.map(cell => cell.row))];
    const colIndices = [...new Set(selectedCells.map(cell => cell.col))];
    
    onBulkLabel(rowIndices, colIndices, selectedLabels);
    
    toast({
      title: "Etichettatura completata",
      description: `Etichettate ${selectedCells.length} celle con ${selectedLabels.length} etichette`,
    });
    
    setIsOpen(false);
  };

  const handleLabelToggle = (labelId: string, checked: boolean) => {
    if (checked) {
      setSelectedLabels([...selectedLabels, labelId]);
    } else {
      setSelectedLabels(selectedLabels.filter(id => id !== labelId));
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

  const isCellSelected = (rowIndex: number, colIndex: number) => {
    return selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
  };

  const isRowInFoundResults = (rowIndex: number) => {
    return foundRows.includes(rowIndex);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Navigazione Avanzata
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Navigazione e Etichettatura Multipla
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selezione colonna chiave */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                1. Ricerca per Colonna Chiave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Colonna chiave per la ricerca</Label>
                  <Select value={keyColumn?.toString() || ""} onValueChange={(value) => setKeyColumn(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una colonna..." />
                    </SelectTrigger>
                    <SelectContent>
                      {excelData.headers.map((header, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {header || `Colonna ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valore da cercare</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Inserisci il valore da cercare..."
                      value={searchKey}
                      onChange={(e) => setSearchKey(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch}>Cerca</Button>
                  </div>
                </div>
              </div>

              {foundRows.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Righe trovate: {foundRows.length}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {foundRows.slice(0, 10).map(rowIndex => (
                      <Badge key={rowIndex} variant="secondary">
                        Riga {rowIndex + 1}
                      </Badge>
                    ))}
                    {foundRows.length > 10 && (
                      <Badge variant="outline">
                        +{foundRows.length - 10} altre
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Griglia di selezione celle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Grid className="h-5 w-5" />
                2. Seleziona Celle dalla Griglia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Clicca sulle celle per selezionarle. Le righe evidenziate sono quelle trovate dalla ricerca.
                </p>
                
                <div className="border rounded-lg overflow-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 border text-left">#</th>
                        {excelData.headers.map((header, colIndex) => (
                          <th key={colIndex} className="p-2 border text-left min-w-20">
                            {header || `Col ${colIndex + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.rows.slice(0, 20).map((row, rowIndex) => (
                        <tr 
                          key={rowIndex} 
                          className={`${isRowInFoundResults(rowIndex) ? 'bg-primary/10' : ''}`}
                        >
                          <td className="p-2 border font-medium text-center">
                            {rowIndex + 1}
                          </td>
                          {row.map((cell, colIndex) => (
                            <td 
                              key={colIndex}
                              className={`p-2 border cursor-pointer transition-colors hover:bg-muted/50 ${
                                isCellSelected(rowIndex, colIndex) ? 'bg-primary/20 ring-1 ring-primary' : ''
                              }`}
                              onClick={() => handleCellToggle(rowIndex, colIndex)}
                            >
                              <div className="truncate max-w-20" title={cell}>
                                {cell || ''}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {excelData.rows.length > 20 && (
                  <p className="text-xs text-muted-foreground">
                    Mostrate solo le prime 20 righe. Usa la ricerca per trovare righe specifiche.
                  </p>
                )}

                {selectedCells.length > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Celle selezionate: {selectedCells.length}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedCells.slice(0, 10).map((cell, index) => (
                        <Badge key={index} variant="secondary">
                          R{cell.row + 1}C{cell.col + 1}
                        </Badge>
                      ))}
                      {selectedCells.length > 10 && (
                        <Badge variant="outline">
                          +{selectedCells.length - 10} altre
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selezione etichette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  3. Seleziona Etichette
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingLabel(!isCreatingLabel)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuova
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCreatingLabel && (
                <div className="p-3 border rounded-lg bg-muted/20 space-y-3 mb-4">
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
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-2">
                  {labels.map(label => (
                    <div key={label.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={`label-${label.id}`}
                        checked={selectedLabels.includes(label.id)}
                        onCheckedChange={(checked) => handleLabelToggle(label.id, checked as boolean)}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: label.color }}
                      />
                      <label htmlFor={`label-${label.id}`} className="flex-1 cursor-pointer">
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

              {selectedLabels.length > 0 && (
                <div className="mt-3 p-2 bg-muted/50 rounded">
                  <p className="text-sm font-medium">Etichette selezionate: {selectedLabels.length}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLabels.map(labelId => {
                      const label = labels.find(l => l.id === labelId);
                      return label ? (
                        <Badge 
                          key={labelId} 
                          variant="secondary"
                          style={{ 
                            backgroundColor: `${label.color}20`,
                            borderColor: label.color,
                            color: label.color 
                          }}
                        >
                          {label.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Creazione nuova etichetta */}
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setIsCreatingLabel(!isCreatingLabel)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreatingLabel ? 'Annulla' : 'Crea Nuova Etichetta'}
                </Button>

                {isCreatingLabel && (
                  <div className="mt-3 p-4 border rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-2">
                      Inserisci i dettagli per la nuova etichetta.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome etichetta</Label>
                        <Input 
                          placeholder="Inserisci il nome dell'etichetta"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Colore etichetta</Label>
                        <Select value={newLabelColor} onValueChange={setNewLabelColor}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona un colore" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map(color => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center">
                                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
                                  {color}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label>Descrizione etichetta (opzionale)</Label>
                      <Textarea 
                        placeholder="Inserisci una descrizione per l'etichetta"
                        value={newLabelDescription}
                        onChange={(e) => setNewLabelDescription(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <Button 
                      onClick={handleCreateLabel} 
                      className="mt-4 w-full"
                    >
                      Crea Etichetta
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleNavigateToFirst}
              disabled={selectedCells.length === 0}
              variant="outline"
            >
              Naviga alla Prima Cella
            </Button>
            <Button 
              onClick={handleBulkLabeling}
              disabled={selectedCells.length === 0 || selectedLabels.length === 0}
            >
              Applica Etichette
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CellNavigator;

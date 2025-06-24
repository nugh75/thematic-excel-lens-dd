import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Grid, Tag, RowsIcon, Filter, User, BarChart3, MessageSquare, Plus, Eye, EyeOff } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import CellNavigator from './CellNavigator';
import ColumnSelector from './ColumnSelector';
import { AIQuickAccess } from './AIQuickAccess';
import { ClassificationBadge } from './ui/ClassificationBadge';
import { getDetailedClassificationStats, filterColumnsByDetailedClassification } from '../utils/classificationDisplay';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

  const DataGrid = () => {
  const { 
    excelData, 
    labels, 
    cellLabels, 
    rowLabels, 
    addCellLabel, 
    removeCellLabel, 
    addRowLabel, 
    removeRowLabel,
    addLabel,
    currentProject
  } = useAnalysisStore();
  
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isLabelingOpen, setIsLabelingOpen] = useState(false);
  const [labelingType, setLabelingType] = useState<'cell' | 'row'>('cell');
  const [visibleColumns, setVisibleColumns] = useState<boolean[]>([]);
  const [columnTypeFilter, setColumnTypeFilter] = useState<'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata'>('all');
  const [columnSubtypeFilter, setColumnSubtypeFilter] = useState<'all' | 'chiusa' | 'aperta'>('all');
  const [columnCategoryFilter, setColumnCategoryFilter] = useState<string>('');
  const [showClassificationLabels, setShowClassificationLabels] = useState(true);
  
  // States per creazione etichette inline
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelDescription, setNewLabelDescription] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  // Inizializza le colonne visibili quando i dati Excel cambiano
  React.useEffect(() => {
    if (excelData && visibleColumns.length !== excelData.headers.length) {
      setVisibleColumns(new Array(excelData.headers.length).fill(true));
    }
  }, [excelData]);

  if (!excelData) {
    return (
      <Card className="w-full fade-in">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carica un file Excel per visualizzare i dati</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleColumnToggle = (index: number, visible: boolean) => {
    const newVisibleColumns = [...visibleColumns];
    newVisibleColumns[index] = visible;
    setVisibleColumns(newVisibleColumns);
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(new Array(excelData.headers.length).fill(true));
  };

  const handleDeselectAllColumns = () => {
    setVisibleColumns(new Array(excelData.headers.length).fill(false));
  };

  // Filtra le colonne visibili e per classificazione avanzata
  const getFilteredColumns = () => {
    if (!currentProject) {
      return excelData.headers.map((_, index) => index);
    }
    
    const columnMetadata = currentProject.config.columnMetadata;
    const columnsWithClassification = excelData.headers.map((header, index) => {
      const metadata = columnMetadata.find(meta => meta.index === index);
      return {
        index,
        name: header,
        classification: metadata?.classification
      };
    });

    // Applica filtri avanzati
    const filteredByClassification = filterColumnsByDetailedClassification(
      columnsWithClassification,
      columnTypeFilter,
      columnSubtypeFilter,
      columnCategoryFilter || undefined
    );

    // Filtra per visibilità
    return filteredByClassification
      .filter(col => visibleColumns[col.index])
      .map(col => col.index);
  };

  const getVisibleColumnIndex = (originalIndex: number) => {
    const filteredColumns = getFilteredColumns();
    return filteredColumns.indexOf(originalIndex);
  };

  const filteredColumnIndexes = getFilteredColumns();
  const visibleHeaders = filteredColumnIndexes.map(index => excelData.headers[index]);

  const getColumnClassification = (columnIndex: number) => {
    if (!currentProject) {
      return null;
    }
    const columnMeta = currentProject.config.columnMetadata.find(meta => meta.index === columnIndex);
    return columnMeta?.classification || null;
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

  const handleCellClick = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectedRow(null);
    setLabelingType('cell');
    setIsLabelingOpen(true);
  };

  const handleRowClick = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedCell(null);
    setLabelingType('row');
    setIsLabelingOpen(true);
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
      } else {
        removeCellLabel(cellId, labelId);
      }
    } else if (labelingType === 'row' && selectedRow !== null) {
      if (checked) {
        addRowLabel({
          rowIndex: selectedRow,
          labelIds: [labelId],
        });
      } else {
        removeRowLabel(selectedRow, labelId);
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

  const handleNavigateToCell = (rowIndex: number, colIndex: number) => {
    const cellElement = document.querySelector(`[data-cell="${rowIndex}-${colIndex}"]`);
    if (cellElement) {
      cellElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      });
      cellElement.classList.add('bg-primary/20', 'ring-2', 'ring-primary');
      setTimeout(() => {
        cellElement.classList.remove('bg-primary/20', 'ring-2', 'ring-primary');
      }, 2000);
    }
  };

  const handleBulkLabel = (rowIndices: number[], colIndices: number[], labelIds: string[]) => {
    let cellsLabeled = 0;
    
    rowIndices.forEach(rowIndex => {
      colIndices.forEach(colIndex => {
        const cellId = `${rowIndex}-${colIndex}`;
        addCellLabel({
          cellId,
          rowIndex,
          colIndex,
          labelIds,
        });
        cellsLabeled++;
      });
    });

    toast({
      title: "Etichettatura completata",
      description: `Etichettate ${cellsLabeled} celle con successo`,
    });
  };

  // Ottieni categorie disponibili per il filtro
  const getAvailableCategories = () => {
    if (!currentProject) return [];
    
    const columnMetadata = currentProject.config.columnMetadata;
    const categories = new Set<string>();
    
    columnMetadata.forEach(meta => {
      if (meta.classification?.category) {
        categories.add(meta.classification.category);
      }
    });
    
    return Array.from(categories).sort();
  };

  // Ottieni statistiche dettagliate
  const getStats = () => {
    if (!currentProject) return null;
    
    const columnMetadata = currentProject.config.columnMetadata;
    const columnsWithClassification = excelData.headers.map((header, index) => {
      const metadata = columnMetadata.find(meta => meta.index === index);
      return {
        index,
        name: header,
        classification: metadata?.classification
      };
    });
    
    return getDetailedClassificationStats(columnsWithClassification);
  };

  const availableCategories = getAvailableCategories();
  const detailedStats = getStats();

  const selectedLabels = labelingType === 'cell' && selectedCell 
    ? getCellLabels(selectedCell.row, selectedCell.col)
    : labelingType === 'row' && selectedRow !== null
    ? getRowLabels(selectedRow)
    : [];

  return (
    <>
      <ColumnSelector
        headers={excelData.headers}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        onSelectAll={handleSelectAllColumns}
        onDeselectAll={handleDeselectAllColumns}
      />

      <Card className="w-full fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Grid className="h-6 w-6 text-primary" />
              Dati Excel - {excelData.fileName}
            </CardTitle>
            <div className="flex items-center gap-3">
              {currentProject && (
                <>
                  {/* Filtro per tipo principale */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={columnTypeFilter} onValueChange={(value: 'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata') => setColumnTypeFilter(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutte le colonne</SelectItem>
                        <SelectItem value="anagrafica">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Solo anagrafiche
                            {detailedStats && <span className="text-xs text-muted-foreground">({detailedStats.anagrafica.total})</span>}
                          </div>
                        </SelectItem>
                        <SelectItem value="non_anagrafica">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Solo non anagrafiche
                            {detailedStats && <span className="text-xs text-muted-foreground">({detailedStats.non_anagrafica.total})</span>}
                          </div>
                        </SelectItem>
                        <SelectItem value="non_classificata">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Solo non classificate
                            {detailedStats && <span className="text-xs text-muted-foreground">({detailedStats.non_classificata.total})</span>}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro per sottotipo (solo se non è "tutte" o "non classificate") */}
                  {columnTypeFilter !== 'all' && columnTypeFilter !== 'non_classificata' && (
                    <div className="flex items-center gap-2">
                      <Select value={columnSubtypeFilter} onValueChange={(value: 'all' | 'chiusa' | 'aperta') => setColumnSubtypeFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutti</SelectItem>
                          <SelectItem value="chiusa">
                            <div className="flex items-center gap-2">
                              🔒 Chiuse
                              {detailedStats && columnTypeFilter !== 'all' && (
                                <span className="text-xs text-muted-foreground">
                                  ({detailedStats[columnTypeFilter as 'anagrafica' | 'non_anagrafica'].chiusa})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                          <SelectItem value="aperta">
                            <div className="flex items-center gap-2">
                              🔓 Aperte
                              {detailedStats && columnTypeFilter !== 'all' && (
                                <span className="text-xs text-muted-foreground">
                                  ({detailedStats[columnTypeFilter as 'anagrafica' | 'non_anagrafica'].aperta})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Filtro per categoria */}
                  {availableCategories.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select value={columnCategoryFilter} onValueChange={setColumnCategoryFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tutte le categorie</SelectItem>
                          {availableCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                🏷️ {category.replace('_', ' ')}
                                {detailedStats && (
                                  <span className="text-xs text-muted-foreground">
                                    ({(detailedStats.anagrafica.categories[category] || 0) + (detailedStats.non_anagrafica.categories[category] || 0)})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Toggle per mostrare/nascondere classificazioni */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClassificationLabels(!showClassificationLabels)}
                className="flex items-center gap-2"
              >
                {showClassificationLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showClassificationLabels ? 'Nascondi' : 'Mostra'} Classificazioni
              </Button>

              <CellNavigator 
                onNavigateToCell={handleNavigateToCell}
                onBulkLabel={handleBulkLabel}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-auto max-h-96 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 sticky left-0 bg-background z-10">#</TableHead>
                  {filteredColumnIndexes.map((colIndex, displayIndex) => (
                    <TableHead key={colIndex} className="min-w-32">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {excelData.headers[colIndex] || `Colonna ${colIndex + 1}`}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {/* Mostra classificazione se abilitata e il progetto ha metadati */}
                          {showClassificationLabels && currentProject && (
                            <ClassificationBadge 
                              classification={getColumnClassification(colIndex)}
                              variant="compact"
                              className="text-xs"
                            />
                          )}
                          
                          {getColumnClassification(colIndex)?.subtype === 'aperta' && (
                            <AIQuickAccess
                              columnName={excelData.headers[colIndex]}
                              responses={excelData.rows.map(row => row[colIndex] || '').filter(v => v && typeof v === 'string' && v.trim())}
                              trigger={
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <span className="text-xs">🤖</span>
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {excelData.rows.map((row, rowIndex) => {
                  const currentRowLabels = getRowLabels(rowIndex);
                  
                  return (
                    <TableRow 
                      key={rowIndex}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => handleRowClick(rowIndex)}
                    >
                      <TableCell className="font-medium text-muted-foreground relative sticky left-0 bg-background z-10">
                        <div className="flex flex-col gap-1">
                          <span>{rowIndex + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(rowIndex);
                            }}
                          >
                            <RowsIcon className="h-3 w-3" />
                          </Button>
                          {currentRowLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {currentRowLabels.map(labelId => {
                                const label = labels.find(l => l.id === labelId);
                                return label ? (
                                  <Badge 
                                    key={labelId}
                                    variant="outline"
                                    className="text-xs"
                                    style={{ 
                                      backgroundColor: `${label.color}40`,
                                      borderColor: label.color,
                                      color: label.color 
                                    }}
                                  >
                                    R
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {filteredColumnIndexes.map((colIndex) => {
                        const cellLabels = getCellLabels(rowIndex, colIndex);
                        
                        return (
                          <TableCell 
                            key={colIndex}
                            className="cursor-pointer hover:bg-muted/50 relative transition-all duration-200"
                            onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                            data-cell={`${rowIndex}-${colIndex}`}
                          >
                            <div className="min-h-8 flex flex-col gap-1">
                              <span className="text-sm">{row[colIndex] || ''}</span>
                              {cellLabels.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {cellLabels.map(labelId => {
                                    const label = labels.find(l => l.id === labelId);
                                    return label ? (
                                      <Badge 
                                        key={labelId}
                                        variant="secondary"
                                        className="text-xs"
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
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p>• Usa il selettore di colonne sopra per scegliere quali colonne visualizzare</p>
            <p>• Clicca su una cella per aggiungere etichette alla cella specifica</p>
            <p>• Clicca sul numero di riga o sull'icona per etichettare l'intera riga</p>
            <p>• Usa la "Navigazione Avanzata" per selezionare celle specifiche e etichettature multiple</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isLabelingOpen} onOpenChange={setIsLabelingOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {labelingType === 'cell' ? 'Etichetta Cella' : 'Etichetta Riga'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              {labelingType === 'cell' && selectedCell ? (
                <>
                  <p className="text-sm font-medium">
                    Riga {selectedCell.row + 1}, Colonna {selectedCell.col + 1}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contenuto: "{excelData.rows[selectedCell.row]?.[selectedCell.col] || 'Vuoto'}"
                  </p>
                </>
              ) : labelingType === 'row' && selectedRow !== null ? (
                <>
                  <p className="text-sm font-medium">
                    Riga {selectedRow + 1} (intera riga)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Etichettando tutte le celle della riga
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
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-2">
                  {labels.map(label => (
                    <div key={label.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50">
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
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
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

export default DataGrid;

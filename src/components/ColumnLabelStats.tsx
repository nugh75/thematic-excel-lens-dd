import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { 
  BarChart3, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Tag, 
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnStatsData, ColumnStatsFilters, ColumnType } from '../types/analysis';

export function ColumnLabelStats() {
  const { excelData, currentProject, labels, cellLabels } = useAnalysisStore();
  const [filters, setFilters] = useState<ColumnStatsFilters>({
    sortBy: 'coverage',
    sortOrder: 'desc'
  });
  const [expandedColumns, setExpandedColumns] = useState<Set<number>>(new Set());

  // Controlli di sicurezza
  if (!excelData || !currentProject?.config?.columnMetadata) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">Nessun Progetto Attivo</h3>
          <p className="text-sm text-muted-foreground">
            Carica un progetto per visualizzare le statistiche delle etichette per colonna
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcolo delle statistiche per colonna
  const columnStats = useMemo((): ColumnStatsData[] => {
    if (!excelData?.headers || !excelData?.rows || !currentProject?.config?.columnMetadata) return [];

    return currentProject.config.columnMetadata.map((columnMeta) => {
      const totalRows = excelData.rows.length;
      
      // Filtra le etichette per questa colonna specifica
      const columnCellLabels = cellLabels.filter(cl => cl.colIndex === columnMeta.index);
      
      // Conta le righe uniche che hanno etichette in questa colonna
      const labeledRowIndices = new Set(columnCellLabels.map(cl => cl.rowIndex));
      const labeledRows = labeledRowIndices.size;
      const coveragePercentage = totalRows > 0 ? (labeledRows / totalRows) * 100 : 0;
      
      // Calcola la distribuzione delle etichette
      const labelCounts = new Map<string, { count: number; examples: Set<string> }>();
      
      columnCellLabels.forEach(cellLabel => {
        cellLabel.labelIds.forEach(labelId => {
          const label = labels.find(l => l.id === labelId);
          if (label) {
            if (!labelCounts.has(labelId)) {
              labelCounts.set(labelId, { count: 0, examples: new Set() });
            }
            const entry = labelCounts.get(labelId)!;
            entry.count++;
            
            // Aggiungi esempio del valore della cella con numero di riga
            const cellValue = excelData.rows[cellLabel.rowIndex]?.[cellLabel.colIndex];
            if (cellValue) {
              entry.examples.add(`${cellValue}|${cellLabel.rowIndex + 1}`); // +1 per numerazione umana
            }
          }
        });
      });
      
      // Converti in array e ordina per occorrenze
      const labelDistribution = Array.from(labelCounts.entries())
        .map(([labelId, data]) => {
          const label = labels.find(l => l.id === labelId);
          // Ordina gli esempi per numero di riga
          const sortedExamples = Array.from(data.examples).sort((a, b) => {
            const rowA = parseInt(a.split('|')[1]);
            const rowB = parseInt(b.split('|')[1]);
            return rowA - rowB;
          });
          
          return {
            label: label?.name || 'Etichetta Sconosciuta',
            count: data.count,
            percentage: data.count, // Usa count invece di percentuale per l'istogramma
            examples: sortedExamples
          };
        })
        .sort((a, b) => b.count - a.count);

      return {
        columnIndex: columnMeta.index,
        columnName: columnMeta.name,
        columnType: columnMeta.type,
        totalRows,
        labeledRows,
        coveragePercentage,
        uniqueLabels: labelDistribution.length,
        labelDistribution
      };
    });
  }, [excelData, labels, cellLabels, currentProject?.config?.columnMetadata]);

  // Filtro e ordinamento
  const filteredStats = useMemo(() => {
    let filtered = [...columnStats];

    // Filtro per tipo di colonna
    if (filters.columnType) {
      filtered = filtered.filter(stat => stat.columnType === filters.columnType);
    }

    // Filtro per copertura minima
    if (filters.minCoverage !== undefined) {
      filtered = filtered.filter(stat => stat.coveragePercentage >= filters.minCoverage!);
    }

    // Filtro per termine di ricerca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(stat => 
        stat.columnName.toLowerCase().includes(term) ||
        stat.labelDistribution.some(dist => dist.label.toLowerCase().includes(term))
      );
    }

    // Ordinamento
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (filters.sortBy) {
          case 'name':
            aVal = a.columnName;
            bVal = b.columnName;
            break;
          case 'coverage':
            aVal = a.coveragePercentage;
            bVal = b.coveragePercentage;
            break;
          case 'labels':
            aVal = a.uniqueLabels;
            bVal = b.uniqueLabels;
            break;
          case 'type':
            aVal = a.columnType;
            bVal = b.columnType;
            break;
          default:
            return 0;
        }
        
        if (typeof aVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        } else {
          const comparison = aVal - bVal;
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        }
      });
    }

    return filtered;
  }, [columnStats, filters]);

  const toggleColumnExpansion = (columnIndex: number) => {
    const newExpanded = new Set(expandedColumns);
    if (newExpanded.has(columnIndex)) {
      newExpanded.delete(columnIndex);
    } else {
      newExpanded.add(columnIndex);
    }
    setExpandedColumns(newExpanded);
  };

  const getTypeColor = (type: ColumnType) => {
    switch (type) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'demographic': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
      case 'likert': return 'bg-orange-100 text-orange-800';
      case 'numeric': return 'bg-teal-100 text-teal-800';
      case 'multiplechoice': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: ColumnType) => {
    switch (type) {
      case 'open': return 'Aperta';
      case 'demographic': return 'Demografica';
      case 'closed': return 'Chiusa';
      case 'likert': return 'Likert';
      case 'numeric': return 'Numerica';
      case 'multiplechoice': return 'Multipla';
      default: return type;
    }
  };

  // Statistiche generali
  const overallStats = useMemo(() => {
    const total = columnStats.length;
    const withLabels = columnStats.filter(s => s.labeledRows > 0).length;
    const totalOccurrences = columnStats.reduce((sum, s) => sum + s.labelDistribution.reduce((labelSum, l) => labelSum + l.count, 0), 0);
    const totalUniqueLabels = columnStats.reduce((sum, s) => sum + s.uniqueLabels, 0);

    return { total, withLabels, totalOccurrences, totalUniqueLabels };
  }, [columnStats]);

  return (
    <div className="space-y-6">
      {/* Header con statistiche generali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Statistiche Etichette per Colonna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{overallStats.total}</p>
                <p className="text-sm text-muted-foreground">Colonne Totali</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{overallStats.withLabels}</p>
                <p className="text-sm text-muted-foreground">Con Etichette</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">{overallStats.totalOccurrences}</p>
                <p className="text-sm text-muted-foreground">Occorrenze Totali</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{overallStats.totalUniqueLabels}</p>
                <p className="text-sm text-muted-foreground">Etichette Uniche</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtri e controlli */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Ricerca */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium">Cerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome colonna o etichetta..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro tipo colonna */}
            <div className="min-w-[150px]">
              <Label className="text-sm font-medium">Tipo Colonna</Label>
              <Select 
                value={filters.columnType || 'all'} 
                onValueChange={(value) => setFilters({...filters, columnType: value === 'all' ? undefined : value as ColumnType})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="open">Aperte</SelectItem>
                  <SelectItem value="demographic">Demografiche</SelectItem>
                  <SelectItem value="closed">Chiuse</SelectItem>
                  <SelectItem value="likert">Likert</SelectItem>
                  <SelectItem value="numeric">Numeriche</SelectItem>
                  <SelectItem value="multiplechoice">Multiple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordinamento */}
            <div className="min-w-[150px]">
              <Label className="text-sm font-medium">Ordina per</Label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters({...filters, sortBy: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coverage">Copertura</SelectItem>
                  <SelectItem value="labels">N° Etichette</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista delle colonne */}
      <div className="space-y-4">
        {filteredStats.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">Nessuna Colonna Trovata</h3>
              <p className="text-sm text-muted-foreground">
                Modifica i filtri per vedere le colonne
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStats.map((stat) => (
            <Card key={stat.columnIndex} className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleColumnExpansion(stat.columnIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {expandedColumns.has(stat.columnIndex) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h3 className="font-medium">{stat.columnName}</h3>
                      </div>
                      
                      <Badge className={getTypeColor(stat.columnType)}>
                        {getTypeLabel(stat.columnType)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{stat.labeledRows}</p>
                        <p className="text-muted-foreground">Righe Etichettate</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-medium">{stat.uniqueLabels}</p>
                        <p className="text-muted-foreground">Etichette</p>
                      </div>
                      
                      <div className="text-center min-w-[100px]">
                        <p className="font-medium">{stat.coveragePercentage.toFixed(1)}%</p>
                        <Progress value={stat.coveragePercentage} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista espansa */}
                {expandedColumns.has(stat.columnIndex) && (
                  <div className="border-t bg-muted/20 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Statistiche dettagliate */}
                      <div>
                        <h4 className="font-medium mb-3">Dettagli</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Righe totali:</span>
                            <span className="font-medium">{stat.totalRows}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Righe etichettate:</span>
                            <span className="font-medium">{stat.labeledRows}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Copertura:</span>
                            <span className="font-medium">{stat.coveragePercentage.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Etichette uniche:</span>
                            <span className="font-medium">{stat.uniqueLabels}</span>
                          </div>
                        </div>
                      </div>

                      {/* Distribuzione etichette con istogramma */}
                      <div>
                        <h4 className="font-medium mb-3">Distribuzione Etichette (Occorrenze)</h4>
                        {stat.labelDistribution.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nessuna etichetta applicata</p>
                        ) : (
                          <div className="space-y-3">
                            {/* Trova il valore massimo per normalizzare l'istogramma */}
                            {(() => {
                              const maxCount = Math.max(...stat.labelDistribution.map(d => d.count));
                              const colors = [
                                'from-blue-500 to-blue-600',
                                'from-green-500 to-green-600', 
                                'from-purple-500 to-purple-600',
                                'from-orange-500 to-orange-600',
                                'from-teal-500 to-teal-600',
                                'from-pink-500 to-pink-600',
                                'from-indigo-500 to-indigo-600',
                                'from-red-500 to-red-600'
                              ];
                              
                              return stat.labelDistribution.slice(0, 8).map((dist, idx) => (
                                <div key={idx} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Badge variant="outline" className="text-xs max-w-[120px] truncate">
                                      {dist.label}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {dist.count} occorrenze
                                    </span>
                                  </div>
                                  
                                  {/* Istogramma a barre colorato */}
                                  <div className="relative">
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                      <div 
                                        className={`bg-gradient-to-r ${colors[idx % colors.length]} h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-sm`}
                                        style={{ 
                                          width: `${maxCount > 0 ? (dist.count / maxCount) * 100 : 0}%`,
                                          minWidth: dist.count > 0 ? '30px' : '0px'
                                        }}
                                      >
                                        <span className="text-white text-xs font-bold drop-shadow">
                                          {dist.count}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Scala di riferimento */}
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                      <span>0</span>
                                      <span>{maxCount}</span>
                                    </div>
                                  </div>
                                  
                                  {dist.examples.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                                        <span>Esempi ({dist.examples.length}):</span>
                                        {dist.examples.length > 5 && (
                                          <span className="text-blue-600">Scorri per vedere tutto</span>
                                        )}
                                      </div>
                                      <ScrollArea className="h-24 border rounded p-2 bg-gray-50">
                                        <div className="space-y-1 pr-3">
                                          {dist.examples.map((example, exampleIdx) => {
                                            const [value, rowNumber] = example.split('|');
                                            return (
                                              <div key={exampleIdx} className="flex items-start gap-2 text-xs hover:bg-white rounded px-1 py-0.5 transition-colors">
                                                <span className="font-mono text-blue-600 min-w-[35px] text-right bg-blue-50 px-1 rounded">
                                                  #{rowNumber}
                                                </span>
                                                <span className="text-gray-700 break-words flex-1 leading-relaxed">
                                                  {value}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  )}
                                </div>
                              ));
                            })()}
                            {stat.labelDistribution.length > 8 && (
                              <p className="text-xs text-muted-foreground">
                                +{stat.labelDistribution.length - 8} altre etichette
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

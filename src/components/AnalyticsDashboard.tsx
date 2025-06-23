
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';

const AnalyticsDashboard = () => {
  const { excelData, labels, cellLabels, getLabelStats } = useAnalysisStore();
  
  const labelStats = getLabelStats();
  const totalCells = excelData ? excelData.rows.length * excelData.headers.length : 0;
  const labeledCells = cellLabels.length;
  const completionPercentage = totalCells > 0 ? (labeledCells / totalCells) * 100 : 0;

  // Preparazione dati per i grafici
  const chartData = labels.map(label => ({
    name: label.name,
    count: labelStats[label.id] || 0,
    color: label.color,
  })).filter(item => item.count > 0);

  const pieChartData = chartData.map((item, index) => ({
    ...item,
    percentage: totalCells > 0 ? ((item.count / totalCells) * 100).toFixed(1) : 0,
  }));

  // Statistiche gerarchiche
  const hierarchyStats = labels.reduce((acc, label) => {
    const level = label.parentId ? 1 : 0; // Semplificato per ora
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as { [level: number]: number });

  if (!excelData) {
    return (
      <Card className="w-full fade-in">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carica i dati per visualizzare l'analisi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Statistiche Generali */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Celle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCells}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Celle Etichettate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{labeledCells}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Etichette Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{labels.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage.toFixed(1)}%</div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Distribuzione Etichette */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5 text-primary" />
                Distribuzione Etichette
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Percentuale per Etichetta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dettaglio Etichette */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Etichette</CardTitle>
        </CardHeader>
        <CardContent>
          {labels.length === 0 ? (
            <p className="text-muted-foreground">Nessuna etichetta creata</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labels.map(label => {
                const count = labelStats[label.id] || 0;
                const percentage = totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : 0;
                
                return (
                  <div key={label.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="font-medium">{label.name}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilizzo:</span>
                        <Badge variant="secondary">
                          {count} celle ({percentage}%)
                        </Badge>
                      </div>
                      
                      {label.description && (
                        <p className="text-xs text-muted-foreground">
                          {label.description}
                        </p>
                      )}
                      
                      {label.parentId && (
                        <p className="text-xs text-muted-foreground">
                          Sottocategoria di: {labels.find(l => l.id === label.parentId)?.name || 'Sconosciuto'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiche Gerarchia */}
      {Object.keys(hierarchyStats).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Struttura Gerarchica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(hierarchyStats).map(([level, count]) => (
                <div key={level} className="flex justify-between items-center">
                  <span className="text-sm">
                    {level === '0' ? 'Etichette Principali' : `Livello ${level}`}
                  </span>
                  <Badge variant="outline">{count} etichette</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

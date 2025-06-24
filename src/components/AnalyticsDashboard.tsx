
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp, BarChart3 } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { ColumnLabelStats } from './ColumnLabelStats';

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
    <Tabs defaultValue="overview" className="space-y-6 fade-in">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Panoramica Generale
        </TabsTrigger>
        <TabsTrigger value="columns" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Statistiche per Colonna
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
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
                Distribuzione Etichette (Occorrenze)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '14px',
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
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
              <ResponsiveContainer width="100%" height={400}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="count"
                    label={({ name, percentage }) => `${name.length > 15 ? name.substring(0, 15) + '...' : name}: ${percentage}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} occorrenze (${props.payload.percentage}%)`,
                      props.payload.name
                    ]}
                    contentStyle={{ 
                      fontSize: '14px',
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legenda personalizzata per etichette lunghe */}
              {pieChartData.length > 0 && (
                <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700">Legenda:</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {pieChartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate" title={entry.name}>
                          {entry.name} ({entry.count} - {entry.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
      </TabsContent>

      <TabsContent value="columns">
        <ColumnLabelStats />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsDashboard;

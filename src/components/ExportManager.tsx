
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, FileJson, FileSpreadsheet, Database } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { storageService } from '../utils/storageService';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const ExportManager = () => {
  const { excelData, labels, cellLabels, rowLabels, sessions } = useAnalysisStore();
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const exportToJSON = () => {
    const data = {
      excelData,
      labels,
      cellLabels,
      rowLabels,
      sessions,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisi-tematica-${Date.now()}.json`;
    a.click();
    
    toast({
      title: "Export completato",
      description: "File JSON scaricato con successo",
    });
  };

  const exportToExcel = () => {
    if (!excelData) return;
    
    const wb = XLSX.utils.book_new();
    
    // Foglio dati originali
    const originalData = [excelData.headers, ...excelData.rows];
    const ws1 = XLSX.utils.aoa_to_sheet(originalData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dati Originali');
    
    // Foglio etichette celle
    const cellLabelData = [
      ['Riga', 'Colonna', 'Valore', 'Etichette', 'Utente', 'Timestamp'],
      ...cellLabels.map(cl => {
        const [rowIndex, colIndex] = cl.cellId.split('-').map(Number);
        const cellValue = excelData.rows[rowIndex]?.[colIndex] || '';
        const labelNames = cl.labelIds.map(id => labels.find(l => l.id === id)?.name || 'N/A').join(', ');
        return [
          rowIndex + 1,
          colIndex + 1,
          cellValue,
          labelNames,
          cl.userId || 'N/A',
          cl.timestamp ? new Date(cl.timestamp).toLocaleString() : 'N/A'
        ];
      })
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(cellLabelData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Etichette Celle');
    
    // Foglio etichette righe
    const rowLabelData = [
      ['Riga', 'Etichette', 'Utente', 'Timestamp'],
      ...rowLabels.map(rl => {
        const labelNames = rl.labelIds.map(id => labels.find(l => l.id === id)?.name || 'N/A').join(', ');
        return [
          rl.rowIndex + 1,
          labelNames,
          rl.userId || 'N/A',
          rl.timestamp ? new Date(rl.timestamp).toLocaleString() : 'N/A'
        ];
      })
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(rowLabelData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Etichette Righe');
    
    XLSX.writeFile(wb, `analisi-tematica-${Date.now()}.xlsx`);
    
    toast({
      title: "Export completato",
      description: "File Excel scaricato con successo",
    });
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      
      if (data.excelData && data.labels) {
        // Importa i dati nello store
        const store = useAnalysisStore.getState();
        store.setExcelData(data.excelData);
        
        // Ripristina etichette e sessioni
        data.labels.forEach((label: any) => store.addLabel(label));
        data.cellLabels?.forEach((cl: any) => store.addCellLabel(cl));
        data.rowLabels?.forEach((rl: any) => store.addRowLabel(rl));
        
        toast({
          title: "Import completato",
          description: "Dati importati con successo",
        });
        
        setImportData('');
        setIsImporting(false);
      } else {
        throw new Error('Formato dati non valido');
      }
    } catch (error) {
      toast({
        title: "Errore import",
        description: "Formato file non valido",
        variant: "destructive",
      });
    }
  };

  const backupToIndexedDB = async () => {
    try {
      await storageService.createBackup('current-project', {
        excelData,
        labels,
        cellLabels,
        rowLabels,
        sessions
      });
      
      toast({
        title: "Backup creato",
        description: "Backup salvato nel browser",
      });
    } catch (error) {
      toast({
        title: "Errore backup",
        description: "Impossibile creare il backup",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Export e Backup
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Export Dati</h4>
            
            <Button onClick={exportToJSON} className="w-full" variant="outline">
              <FileJson className="h-4 w-4 mr-2" />
              Esporta JSON
            </Button>
            
            <Button onClick={exportToExcel} className="w-full" variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Esporta Excel
            </Button>
            
            <Button onClick={backupToIndexedDB} className="w-full" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Backup Locale
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Import Dati</h4>
            
            <Dialog open={isImporting} onOpenChange={setIsImporting}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importa JSON
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importa Dati JSON</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Incolla qui il contenuto del file JSON..."
                    rows={10}
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={handleImport} className="flex-1">
                      Importa
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImporting(false)}
                      className="flex-1"
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportManager;

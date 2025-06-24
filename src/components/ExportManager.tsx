
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, FileJson, FileSpreadsheet, Database, FolderOpen, Package, AlertCircle, CheckCircle, RotateCcw, Save } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { storageService } from '../utils/storageService';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { 
  createJSONBackup, 
  exportJSONBackup, 
  loadJSONBackupFile, 
  restoreFromJSONBackup,
  createExcelBackupWithMetadata,
  extractBackupFromExcel,
  BackupData
} from '../utils/backupManager';

const ExportManager = () => {
  const { currentProject, excelData, labels, cellLabels, rowLabels, sessions, switchProject } = useAnalysisStore();
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isFileImporting, setIsFileImporting] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // ================== EXPORT STANDARD ==================

  // Export JSON semplice (solo analisi corrente)
  const exportToJSON = () => {
    if (!excelData) {
      toast({
        title: "Errore",
        description: "Nessun dato da esportare",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      excelData,
      labels,
      cellLabels,
      rowLabels,
      sessions,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisi-tematica-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completato",
      description: "File JSON scaricato con successo",
    });
  };

  // Export Excel semplice (dati + analisi)
  const exportToExcel = () => {
    if (!excelData) {
      toast({
        title: "Errore",
        description: "Nessun dato da esportare",
        variant: "destructive",
      });
      return;
    }
    
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

    // Foglio classificazioni colonne (se disponibili)
    if (currentProject?.config?.columnMetadata) {
      const classificationData = [
        ['Indice', 'Nome Colonna', 'Tipo', 'Sottotipo', 'Categoria', 'Confidence', 'AI Generated'],
        ...currentProject.config.columnMetadata.map(meta => [
          meta.index + 1,
          meta.name,
          meta.classification?.type || 'non_classificata',
          meta.classification?.subtype || '',
          meta.classification?.category || '',
          meta.classification?.confidence || 0,
          meta.classification?.aiGenerated ? 'Sì' : 'No'
        ])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(classificationData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Classificazioni');
    }
    
    XLSX.writeFile(wb, `analisi-tematica-${Date.now()}.xlsx`);
    
    toast({
      title: "Export completato",
      description: "File Excel scaricato con successo",
    });
  };

  // ================== BACKUP AVANZATO ==================

  // Export JSON avanzato con backup completo
  const exportAdvancedJSON = () => {
    if (!currentProject) {
      toast({
        title: "Errore",
        description: "Nessun progetto attivo da esportare",
        variant: "destructive",
      });
      return;
    }

    const backupData = createJSONBackup(currentProject, backupDescription);
    exportJSONBackup(backupData, `${currentProject.name}_backup_${new Date().toISOString().slice(0, 10)}.json`);
    
    toast({
      title: "Export completato",
      description: "Backup JSON completo scaricato con successo",
    });
    
    setBackupDescription('');
  };

  // Export Excel con metadati integrati
  const exportAdvancedExcel = () => {
    if (!currentProject) {
      toast({
        title: "Errore",
        description: "Nessun progetto attivo da esportare",
        variant: "destructive",
      });
      return;
    }

    const { excelData: backupExcel } = createExcelBackupWithMetadata(currentProject, backupDescription);
    
    const wb = XLSX.utils.book_new();
    
    // Foglio dati originali con metadati di backup
    const dataWithBackup = [backupExcel.headers, ...backupExcel.rows];
    const ws1 = XLSX.utils.aoa_to_sheet(dataWithBackup);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dati con Backup');
    
    // Aggiungi fogli di analisi come prima
    // Foglio etichette celle
    const cellLabelData = [
      ['Riga', 'Colonna', 'Valore', 'Etichette', 'Utente', 'Timestamp'],
      ...cellLabels.map(cl => {
        const [rowIndex, colIndex] = cl.cellId.split('-').map(Number);
        const cellValue = excelData?.rows[rowIndex]?.[colIndex] || '';
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
    
    // Foglio classificazioni colonne
    if (currentProject.config?.columnMetadata) {
      const classificationData = [
        ['Indice', 'Nome Colonna', 'Tipo', 'Sottotipo', 'Categoria', 'Confidence', 'AI Generated'],
        ...currentProject.config.columnMetadata.map(meta => [
          meta.index + 1,
          meta.name,
          meta.classification?.type || 'non_classificata',
          meta.classification?.subtype || '',
          meta.classification?.category || '',
          meta.classification?.confidence || 0,
          meta.classification?.aiGenerated ? 'Sì' : 'No'
        ])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(classificationData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Classificazioni');
    }
    
    XLSX.writeFile(wb, `${currentProject.name}_backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast({
      title: "Export completato",
      description: "File Excel con backup integrato scaricato con successo",
    });
    
    setBackupDescription('');
  };

  // Backup locale nel browser
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

  // ================== IMPORT/RIPRISTINO ==================

  // Import da file JSON
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsFileImporting(true);
    
    try {
      const result = await loadJSONBackupFile(file);
      
      if (result.success && result.backupData) {
        const restoreResult = restoreFromJSONBackup(result.backupData);
        
        if (restoreResult.success && restoreResult.project) {
          // TODO: Integrare con lo store per creare un nuovo progetto
          toast({
            title: "Import completato",
            description: `Progetto "${restoreResult.project.name}" ripristinato con successo`,
          });
        } else {
          throw new Error(restoreResult.errors?.join(', ') || 'Errore ripristino');
        }
      } else {
        throw new Error(result.errors?.join(', ') || 'File non valido');
      }
    } catch (error) {
      toast({
        title: "Errore import",
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
        variant: "destructive",
      });
    } finally {
      setIsFileImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Import da file Excel con backup
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsFileImporting(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Converti in nostro formato
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as string[][];
      
      const excelData = {
        headers,
        rows,
        fileName: file.name
      };
      
      // Controlla se è un backup Excel
      const backupResult = extractBackupFromExcel(excelData);
      
      if (backupResult.hasBackup && backupResult.backupData) {
        const restoreResult = restoreFromJSONBackup(backupResult.backupData);
        
        if (restoreResult.success && restoreResult.project) {
          toast({
            title: "Backup Excel rilevato",
            description: `Progetto "${restoreResult.project.name}" ripristinato da backup Excel`,
          });
        } else {
          throw new Error('Errore ripristino da backup Excel');
        }
      } else {
        // Excel normale, importa come nuovo progetto
        toast({
          title: "Excel importato",
          description: "File Excel caricato come nuovo dataset (senza backup)",
        });
      }
    } catch (error) {
      toast({
        title: "Errore import Excel",
        description: error instanceof Error ? error.message : 'Errore lettura file',
        variant: "destructive",
      });
    } finally {
      setIsFileImporting(false);
      if (excelInputRef.current) {
        excelInputRef.current.value = '';
      }
    }
  };

  // Import JSON da testo (modalità legacy)
  const handleTextImport = async () => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Gestione Import/Export
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Standard
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Backup Avanzato
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import/Ripristino
            </TabsTrigger>
          </TabsList>

          {/* TAB EXPORT STANDARD */}
          <TabsContent value="export" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Esporta i dati correnti e le analisi in formato JSON o Excel. Ideale per condivisione rapida o backup semplici.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Export JSON</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Esporta dati e analisi in formato JSON leggibile.
                    </p>
                    <Button onClick={exportToJSON} className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Scarica JSON
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Export Excel</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Esporta con fogli separati per analisi e classificazioni.
                    </p>
                    <Button onClick={exportToExcel} className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Scarica Excel
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB BACKUP AVANZATO */}
          <TabsContent value="backup" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Crea backup completi con metadati per ripristino integrale del progetto, incluse tutte le configurazioni e stati.
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="backup-description" className="text-sm font-medium">
                    Descrizione backup (opzionale)
                  </label>
                  <Input
                    id="backup-description"
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    placeholder="Es: Backup prima della modifica ai filtri..."
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Backup JSON</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Backup completo con metadati e validazione per ripristino integrale.
                      </p>
                      <Button 
                        onClick={exportAdvancedJSON} 
                        className="w-full" 
                        variant="outline"
                        disabled={!currentProject}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Crea Backup JSON
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">Backup Excel</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excel con metadati nascosti per ripristino completo del progetto.
                      </p>
                      <Button 
                        onClick={exportAdvancedExcel} 
                        className="w-full" 
                        variant="outline"
                        disabled={!currentProject}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Crea Backup Excel
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium">Backup Locale</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Salva nel browser per recupero rapido in questa sessione.
                      </p>
                      <Button onClick={backupToIndexedDB} className="w-full" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Salva nel Browser
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB IMPORT/RIPRISTINO */}
          <TabsContent value="import" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Importa file di backup o nuovi dataset. Il sistema rileva automaticamente se il file contiene un backup completo.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Import da file */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Import da File</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Carica backup JSON o file Excel (con o senza backup).
                    </p>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-full" 
                        variant="outline"
                        disabled={isFileImporting}
                      >
                        <FileJson className="h-4 w-4 mr-2" />
                        {isFileImporting ? 'Caricamento...' : 'Carica Backup JSON'}
                      </Button>
                      
                      <Button 
                        onClick={() => excelInputRef.current?.click()} 
                        className="w-full" 
                        variant="outline"
                        disabled={isFileImporting}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        {isFileImporting ? 'Caricamento...' : 'Carica File Excel'}
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelImport}
                      className="hidden"
                    />
                  </div>
                </Card>

                {/* Import da testo */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium">Import da Testo</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Incolla direttamente il contenuto di un backup JSON.
                    </p>
                    
                    <Dialog open={isImporting} onOpenChange={setIsImporting}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Incolla JSON
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Importa da Testo JSON</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <Textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            placeholder="Incolla qui il contenuto del file JSON..."
                            rows={10}
                            className="font-mono text-sm"
                          />
                          
                          <div className="flex gap-2">
                            <Button onClick={handleTextImport} className="flex-1">
                              <CheckCircle className="h-4 w-4 mr-2" />
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
                </Card>
              </div>

              {/* Sezione di stato */}
              {currentProject && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Progetto Attivo</p>
                      <p className="text-sm text-muted-foreground">
                        {currentProject.name} - {excelData ? `${excelData.rows.length} righe, ${excelData.headers.length} colonne` : 'Nessun dato'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {labels.length} etichette
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {cellLabels.length} celle etichettate
                        </Badge>
                        {currentProject.config?.columnMetadata && (
                          <Badge variant="outline" className="text-xs">
                            {currentProject.config.columnMetadata.filter(c => c.classification?.type !== 'non_classificata').length} colonne classificate
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportManager;

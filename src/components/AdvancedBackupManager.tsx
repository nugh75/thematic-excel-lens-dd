import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Archive, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import {
  createJSONBackup,
  exportJSONBackup,
  loadJSONBackupFile,
  restoreFromJSONBackup,
  createExcelBackupWithMetadata,
  extractBackupFromExcel,
  getAvailableBackups,
  saveBackupInfo,
  removeBackupInfo,
  BackupData,
  BackupInfo
} from '../utils/backupManager';

/**
 * Componente per la gestione avanzata dei backup
 * Supporta backup/ripristino in JSON, Excel integrato e gestione locale
 */
export const AdvancedBackupManager: React.FC = () => {
  const { currentProject, setExcelData, createProject } = useAnalysisStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [availableBackups] = useState<BackupInfo[]>(getAvailableBackups());
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedBackupType, setSelectedBackupType] = useState<'json' | 'excel'>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateJSONBackup = () => {
    if (!currentProject) {
      toast({
        title: "Errore",
        description: "Nessun progetto attivo per il backup",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      const backupData = createJSONBackup(currentProject, backupDescription);
      exportJSONBackup(backupData);

      // Salva info del backup nel localStorage
      const backupInfo: BackupInfo = {
        id: `json_${Date.now()}`,
        name: `${currentProject.name} - JSON Backup`,
        description: backupDescription,
        timestamp: backupData.timestamp,
        size: JSON.stringify(backupData).length,
        format: 'json',
        version: backupData.version
      };
      saveBackupInfo(backupInfo);

      toast({
        title: "Backup creato",
        description: "Il backup JSON è stato scaricato con successo"
      });
      setBackupDescription('');
    } catch (error) {
      toast({
        title: "Errore backup",
        description: `Errore durante la creazione del backup: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateExcelBackup = () => {
    if (!currentProject) {
      toast({
        title: "Errore",
        description: "Nessun progetto attivo per il backup",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      const { excelData, metadata } = createExcelBackupWithMetadata(currentProject, backupDescription);
      
      // Crea e scarica il file Excel con metadati
      const jsonString = JSON.stringify(excelData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${excelData.fileName || 'backup'}.json`; // Temporaneo come JSON, in futuro si potrebbe convertire in vero Excel
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Salva info del backup
      const backupInfo: BackupInfo = {
        id: `excel_${Date.now()}`,
        name: `${currentProject.name} - Excel Backup`,
        description: backupDescription,
        timestamp: metadata.timestamp,
        size: jsonString.length,
        format: 'excel',
        version: metadata.version
      };
      saveBackupInfo(backupInfo);

      toast({
        title: "Backup Excel creato",
        description: "Il backup con metadati integrati è stato scaricato"
      });
      setBackupDescription('');
    } catch (error) {
      toast({
        title: "Errore backup",
        description: `Errore durante la creazione del backup Excel: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    if (file.name.endsWith('.json')) {
      // Gestisci backup JSON
      loadJSONBackupFile(file).then(result => {
        if (result.success && result.backupData) {
          const restoreResult = restoreFromJSONBackup(result.backupData);
          if (restoreResult.success && restoreResult.project) {
            createProject(
              restoreResult.project.name,
              restoreResult.project.description || '',
              restoreResult.project.excelData
            );
            toast({
              title: "Backup ripristinato",
              description: "Il progetto è stato ripristinato dal backup JSON"
            });
          } else {
            toast({
              title: "Errore ripristino",
              description: `Errore: ${restoreResult.errors?.join(', ')}`,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Errore file",
            description: `Errore: ${result.errors?.join(', ')}`,
            variant: "destructive"
          });
        }
        setIsImporting(false);
      });
    } else {
      // Prova a gestire come Excel/file con metadati
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const extractResult = extractBackupFromExcel(data);
          
          if (extractResult.hasBackup && extractResult.backupData) {
            const restoreResult = restoreFromJSONBackup(extractResult.backupData);
            if (restoreResult.success && restoreResult.project) {
              createProject(
                restoreResult.project.name,
                restoreResult.project.description || '',
                restoreResult.project.excelData
              );
              toast({
                title: "Backup Excel ripristinato",
                description: "Il progetto è stato ripristinato dal backup Excel"
              });
            } else {
              toast({
                title: "Errore ripristino",
                description: `Errore: ${restoreResult.errors?.join(', ')}`,
                variant: "destructive"
              });
            }
          } else {
            // Prova a caricare come file Excel normale
            setExcelData({
              headers: data.headers || [],
              rows: data.rows || [],
              fileName: file.name
            });
            toast({
              title: "File caricato",
              description: "File Excel caricato (senza metadati di backup)"
            });
          }
        } catch (error) {
          toast({
            title: "Errore file",
            description: `Impossibile leggere il file: ${error instanceof Error ? error.message : 'Formato non supportato'}`,
            variant: "destructive"
          });
        }
        setIsImporting(false);
      };
      reader.readAsText(file);
    }

    // Reset dell'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveBackupInfo = (backupId: string) => {
    removeBackupInfo(backupId);
    toast({
      title: "Info backup rimossa",
      description: "Le informazioni del backup sono state rimosse"
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleString('it-IT');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Archive className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Gestione Backup Avanzata</h2>
            <p className="text-sm text-muted-foreground">
              Sistema robusto per backup e ripristino completo dei progetti
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creazione Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Crea Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentProject ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nessun progetto attivo. Carica un file Excel per creare un backup.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">{currentProject.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentProject.excelData?.headers?.length || 0} colonne • {currentProject.excelData?.rows?.length || 0} righe
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrizione (opzionale)
                  </label>
                  <Textarea
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    placeholder="Aggiungi una descrizione per questo backup..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={handleCreateJSONBackup}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    <FileJson className="h-4 w-4" />
                    {isExporting ? 'Creando...' : 'Backup JSON Completo'}
                  </Button>

                  <Button
                    onClick={handleCreateExcelBackup}
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {isExporting ? 'Creando...' : 'Backup Excel + Metadati'}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <strong>JSON:</strong> Backup completo con tutte le classificazioni, etichette e configurazioni.
                  <br />
                  <strong>Excel:</strong> Dati Excel originali + metadati integrati per ripristino automatico.
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ripristino Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Ripristina Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Caricando...' : 'Seleziona File di Backup'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Formati supportati:</strong>
              <br />
              • <strong>.json</strong> - Backup completi JSON
              <br />
              • <strong>.xlsx/.xls</strong> - Excel con metadati integrati
              <br />
              • File Excel normali (caricamento senza ripristino configurazioni)
            </div>

            {isImporting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin" />
                Elaborazione file in corso...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista Backup Locali */}
      {availableBackups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup Locali ({availableBackups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableBackups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{backup.name}</h4>
                      <Badge variant={backup.format === 'json' ? 'default' : 'secondary'}>
                        {backup.format.toUpperCase()}
                      </Badge>
                    </div>
                    {backup.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {backup.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>{formatDate(backup.timestamp)}</span>
                      <span>{formatFileSize(backup.size)}</span>
                      <span>v{backup.version}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBackupInfo(backup.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

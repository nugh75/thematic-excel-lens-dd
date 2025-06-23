
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet, AlertCircle, FolderPlus } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { ExcelData } from '../types/analysis';

const ExcelUploader = () => {
  const { setExcelData, currentProject, projects, createProject } = useAnalysisStore();
  const [pendingFile, setPendingFile] = useState<{ data: ExcelData; file: File } | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const processExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        if (jsonData.length === 0) {
          toast({
            title: "Errore",
            description: "Il file Excel è vuoto",
            variant: "destructive",
          });
          return;
        }

        const headers = jsonData[0] || [];
        const rows = jsonData.slice(1);

        const excelData: ExcelData = {
          headers,
          rows,
          fileName: file.name,
        };

        // Se esiste già un progetto attivo, chiedi conferma
        if (currentProject || projects.length > 0) {
          setPendingFile({ data: excelData, file });
          setProjectName(file.name.replace(/\.[^/.]+$/, "")); // Rimuove estensione
          setShowProjectDialog(true);
        } else {
          // Primo file caricato, crea direttamente il progetto
          setExcelData(excelData);
          toast({
            title: "Progetto creato",
            description: `Nuovo progetto "${file.name}" creato con successo`,
          });
        }
      } catch (error) {
        console.error('Errore nel processare il file Excel:', error);
        toast({
          title: "Errore",
          description: "Errore nel processare il file Excel",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
  }, [setExcelData, currentProject, projects]);

  const handleCreateProject = () => {
    if (!pendingFile) return;
    
    if (!projectName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del progetto è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    createProject(projectName.trim(), projectDescription.trim(), pendingFile.data);
    
    toast({
      title: "Progetto creato",
      description: `Nuovo progetto "${projectName}" creato con successo`,
    });

    // Reset
    setPendingFile(null);
    setProjectName('');
    setProjectDescription('');
    setShowProjectDialog(false);
  };

  const handleCancelProject = () => {
    setPendingFile(null);
    setProjectName('');
    setProjectDescription('');
    setShowProjectDialog(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Carica File Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
              ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
              hover:border-primary hover:bg-primary/5
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              {isDragReject ? (
                <AlertCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              
              <div>
                {isDragActive ? (
                  <p className="text-primary font-medium">Rilascia il file qui...</p>
                ) : isDragReject ? (
                  <p className="text-destructive font-medium">File non supportato</p>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      Trascina qui il tuo file Excel o clicca per selezionarlo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supporta file .xlsx e .xls
                    </p>
                  </>
                )}
              </div>
              
              {!isDragActive && (
                <Button variant="outline">
                  Seleziona File
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog per la creazione del progetto */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Crea Nuovo Progetto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome Progetto *</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Inserisci il nome del progetto"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione</label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descrizione opzionale del progetto"
                className="mt-1"
                rows={3}
              />
            </div>
            {pendingFile && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">File da caricare:</p>
                <p className="text-sm text-blue-600">{pendingFile.data.fileName}</p>
                <p className="text-xs text-blue-500">
                  {pendingFile.data.rows.length} righe × {pendingFile.data.headers.length} colonne
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelProject}>
                Annulla
              </Button>
              <Button onClick={handleCreateProject}>
                Crea Progetto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExcelUploader;


import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const ExcelUploader = () => {
  const setExcelData = useAnalysisStore((state) => state.setExcelData);

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

        setExcelData({
          headers,
          rows,
          fileName: file.name,
        });

        toast({
          title: "Successo",
          description: `File "${file.name}" caricato con successo`,
        });
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
  }, [setExcelData]);

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
  );
};

export default ExcelUploader;

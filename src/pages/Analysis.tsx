
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExcelUploader from '../components/ExcelUploader';
import LabelManager from '../components/LabelManager';
import DataGrid from '../components/DataGrid';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserManager from '../components/UserManager';
import SessionManager from '../components/SessionManager';
import ConflictManager from '../components/ConflictManager';
import ExportManager from '../components/ExportManager';
import SuggestionPanel from '../components/SuggestionPanel';
import DataViewSelector from '../components/DataViewSelector';
import SingleColumnView from '../components/SingleColumnView';
import SingleRowView from '../components/SingleRowView';
import { useAnalysisStore } from '../store/analysisStore';

const Analysis = () => {
  const excelData = useAnalysisStore((state) => state.excelData);
  const [dataView, setDataView] = useState<'grid' | 'column' | 'row'>('grid');

  const renderDataView = () => {
    switch (dataView) {
      case 'column':
        return <SingleColumnView />;
      case 'row':
        return <SingleRowView />;
      default:
        return <DataGrid />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Analisi Tematica Collaborativa
          </h1>
          <p className="text-xl text-muted-foreground">
            Strumento avanzato per l'analisi tematica qualitativa multi-utente con AI e versioning
          </p>
        </div>

        {!excelData ? (
          <ExcelUploader />
        ) : (
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="data">Dati</TabsTrigger>
              <TabsTrigger value="labels">Etichette</TabsTrigger>
              <TabsTrigger value="suggestions">AI</TabsTrigger>
              <TabsTrigger value="users">Utenti</TabsTrigger>
              <TabsTrigger value="sessions">Sessioni</TabsTrigger>
              <TabsTrigger value="conflicts">Conflitti</TabsTrigger>
              <TabsTrigger value="analysis">Analisi</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="upload">Carica Nuovo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="space-y-6">
              <DataViewSelector 
                currentView={dataView}
                onViewChange={setDataView}
              />
              {renderDataView()}
            </TabsContent>
            
            <TabsContent value="labels" className="space-y-6">
              <LabelManager />
            </TabsContent>
            
            <TabsContent value="suggestions" className="space-y-6">
              <SuggestionPanel />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <UserManager />
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-6">
              <SessionManager />
            </TabsContent>
            
            <TabsContent value="conflicts" className="space-y-6">
              <ConflictManager />
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <ExportManager />
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-6">
              <ExcelUploader />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Analysis;

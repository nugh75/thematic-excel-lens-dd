
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExcelUploader from '../components/ExcelUploader';
import LabelManager from '../components/LabelManager';
import ProjectSettings from '../components/ProjectSettings';
import { AISettingsPanel } from '../components/AISettingsPanel';
import AISystemPromptConfig from '../components/AISystemPromptConfig';
import { AIConsultant } from '../components/AIConsultant';
import { AIFloatingButton } from '../components/AIFloatingButton';
import DataGrid from '../components/DataGrid';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserManager from '../components/UserManager';
import LoginComponent from '../components/LoginComponent';
import SessionManager from '../components/SessionManager';
import ConflictManager from '../components/ConflictManager';
import ExportManager from '../components/ExportManager';
import SuggestionPanel from '../components/SuggestionPanel';
import DataViewSelector from '../components/DataViewSelector';
import SingleColumnView from '../components/SingleColumnView';
import SingleRowView from '../components/SingleRowView';
import ProjectManager from '../components/ProjectManager';
import ColumnConfigurator from '../components/ColumnConfigurator';
import { useAnalysisStore } from '../store/analysisStore';

const Analysis = () => {
  const { 
    excelData, 
    currentUser, 
    currentProject, 
    labels
  } = useAnalysisStore();
  const [dataView, setDataView] = useState<'grid' | 'column' | 'row'>('grid');

  // Show login screen if no user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analisi Tematica Collaborativa
            </h1>
            <p className="text-xl text-muted-foreground">
              Strumento avanzato per l'analisi tematica qualitativa multi-utente con AI e versioning
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <LoginComponent />
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Analisi Tematica Collaborativa
              </h1>
              <p className="text-xl text-muted-foreground">
                Strumento avanzato per l'analisi tematica qualitativa multi-utente con AI e versioning
              </p>
            </div>
            <LoginComponent />
          </div>
        </div>

        {!excelData ? (
          <div className="space-y-6">
            <ProjectManager />
            <ExcelUploader />
          </div>
        ) : (
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-8 gap-0.5">
              <TabsTrigger value="projects" className="text-xs px-1">Progetti</TabsTrigger>
              <TabsTrigger value="config" className="text-xs px-1">Config</TabsTrigger>
              <TabsTrigger value="data" className="text-xs px-1">Dati</TabsTrigger>
              <TabsTrigger value="labels" className="text-xs px-1">Etichette</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs px-1">Analisi</TabsTrigger>
              <TabsTrigger value="ai-consultant" className="text-xs px-1">AI</TabsTrigger>
              <TabsTrigger value="users" className="text-xs px-1">Utenti</TabsTrigger>
              <TabsTrigger value="export" className="text-xs px-1">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-6">
              <ProjectManager />
              <ExcelUploader />
            </TabsContent>
            
            <TabsContent value="config" className="space-y-6">
              <Tabs defaultValue="columns" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="columns">Colonne</TabsTrigger>
                  <TabsTrigger value="project">Progetto</TabsTrigger>
                  <TabsTrigger value="ai-settings">AI Config</TabsTrigger>
                  <TabsTrigger value="ai-prompts">AI Prompt</TabsTrigger>
                  <TabsTrigger value="conflicts">Conflitti</TabsTrigger>
                </TabsList>
                
                <TabsContent value="columns" className="mt-6">
                  <ColumnConfigurator />
                </TabsContent>
                
                <TabsContent value="project" className="mt-6">
                  <ProjectSettings />
                </TabsContent>
                
                <TabsContent value="ai-settings" className="mt-6">
                  <AISettingsPanel />
                </TabsContent>
                
                <TabsContent value="ai-prompts" className="mt-6">
                  <AISystemPromptConfig />
                </TabsContent>
                
                <TabsContent value="conflicts" className="mt-6">
                  <ConflictManager />
                </TabsContent>
              </Tabs>
            </TabsContent>
            
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
            
            <TabsContent value="ai-consultant" className="space-y-6">
              <AIConsultant 
                context={`Analisi tematica del progetto "${currentProject?.name || 'Senza nome'}". 
                         Dataset con ${excelData?.rows?.length || 0} righe e ${excelData?.headers?.length || 0} colonne.
                         Etichette attive: ${labels.length}.`}
                title="Consulente AI per Analisi Tematica"
                description="Ottieni consigli personalizzati per migliorare la tua analisi qualitativa"
              />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">Gestione Utenti</TabsTrigger>
                  <TabsTrigger value="sessions">Sessioni</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-6">
                  <UserManager />
                </TabsContent>
                
                <TabsContent value="sessions" className="mt-6">
                  <SessionManager />
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <ExportManager />
            </TabsContent>
          </Tabs>
        )}

        {/* Bottone AI flottante */}
        <AIFloatingButton 
          context={`Analisi tematica del progetto "${currentProject?.name || 'Senza nome'}". 
                   Dataset con ${excelData?.rows?.length || 0} righe e ${excelData?.headers?.length || 0} colonne.
                   Etichette attive: ${labels.length}.`}
        />
      </div>
    </div>
  );
};

export default Analysis;

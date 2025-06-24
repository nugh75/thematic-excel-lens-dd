import React, { useState } from 'react';
import NavigationHeader from '../components/NavigationHeader';
import ColumnConfiguration from '../components/ColumnConfiguration';
import { AdvancedBackupManager } from '../components/AdvancedBackupManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Archive } from 'lucide-react';

/**
 * Pagina di configurazione - Hub unificato
 * - Classificazione delle colonne
 * - Sistema di backup avanzato
 * - Gestione progetti e configurazioni
 */
export default function Configuration() {
  const [activeTab, setActiveTab] = useState('columns');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurazione Sistema
          </h1>
          <p className="text-gray-600">
            Gestisci colonne, classificazioni e backup dei tuoi progetti di analisi tematica.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="columns" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Classificazione Colonne
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Backup & Ripristino
            </TabsTrigger>
          </TabsList>

          <TabsContent value="columns" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Classificazione Colonne
              </h2>
              <p className="text-gray-600">
                Gestisci e classifica le colonne del tuo dataset secondo uno schema gerarchico unificato.
                Puoi lavorare su singole colonne o utilizzare la modalità batch per classificazioni multiple.
              </p>
            </div>
            <ColumnConfiguration />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Backup & Ripristino
              </h2>
              <p className="text-gray-600">
                Sistema robusto per creare backup completi dei tuoi progetti e ripristinarli quando necessario.
                Supporta backup in JSON con metadati completi e backup Excel integrati.
              </p>
            </div>
            <AdvancedBackupManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

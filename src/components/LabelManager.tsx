import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tag, Brain, Target, Sparkles } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { AILabelGenerator } from './AILabelGenerator';
import LabelManagerAdvanced from './LabelManagerAdvanced';
import { AISuggestionAssistant } from './AISuggestionAssistant';

export function LabelManager() {
  const { labels, excelData } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState('manage');

  const hasData = excelData && excelData.rows.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Gestione Etichette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{labels.length}</p>
                <p className="text-sm text-muted-foreground">Etichette Totali</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">AI</p>
                <p className="text-sm text-muted-foreground">Assistente Attivo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{hasData ? excelData.rows.length : 0}</p>
                <p className="text-sm text-muted-foreground">Righe Dati</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Gestione Base
              </TabsTrigger>
              <TabsTrigger value="ai-generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generazione AI
              </TabsTrigger>
              <TabsTrigger value="ai-suggest" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Suggerimenti AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-6">
              <LabelManagerAdvanced />
            </TabsContent>

            <TabsContent value="ai-generate" className="mt-6">
              {!hasData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">Nessun Dato Disponibile</h3>
                    <p className="text-sm text-muted-foreground">
                      Carica un file Excel per utilizzare la generazione AI di etichette
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <AILabelGenerator />
              )}
            </TabsContent>

            <TabsContent value="ai-suggest" className="mt-6">
              {!hasData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">Nessun Dato Disponibile</h3>
                    <p className="text-sm text-muted-foreground">
                      Carica un file Excel per utilizzare i suggerimenti AI di etichette
                    </p>
                  </CardContent>
                </Card>
              ) : labels.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">Nessuna Etichetta Disponibile</h3>
                    <p className="text-sm text-muted-foreground">
                      Crea almeno un'etichetta per utilizzare i suggerimenti AI
                    </p>
                    <Button 
                      onClick={() => setActiveTab('manage')} 
                      className="mt-4"
                      variant="outline"
                    >
                      Vai alla Gestione Etichette
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AISuggestionAssistant />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default LabelManager;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NavigationHeader from '@/components/NavigationHeader';
import { 
  BookOpen, 
  FileSpreadsheet, 
  Tags, 
  Brain, 
  BarChart3, 
  Download, 
  Upload,
  Settings,
  Lightbulb,
  Target,
  Users,
  Play,
  CheckCircle,
  ArrowRight,
  Info,
  Zap,
  Eye,
  Filter,
  Search,
  Star,
  Workflow
} from 'lucide-react';

const InstructionsPage = () => {
  const [activeFeature, setActiveFeature] = useState<string>('');

  const features = [
    {
      id: 'upload',
      title: 'Caricamento Dati',
      icon: Upload,
      description: 'Importa i tuoi file Excel per iniziare l\'analisi tematica',
      level: 'Principiante'
    },
    {
      id: 'labels',
      title: 'Gestione Etichette',
      icon: Tags,
      description: 'Crea e organizza etichette per categorizzare i dati',
      level: 'Principiante'
    },
    {
      id: 'ai-generation',
      title: 'Generazione AI',
      icon: Brain,
      description: 'Usa l\'AI per generare etichette automaticamente',
      level: 'Intermedio'
    },
    {
      id: 'analysis',
      title: 'Analisi e Visualizzazione',
      icon: BarChart3,
      description: 'Visualizza statistiche e pattern nei tuoi dati',
      level: 'Intermedio'
    },
    {
      id: 'export',
      title: 'Esportazione',
      icon: Download,
      description: 'Esporta i risultati in vari formati',
      level: 'Avanzato'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Principiante': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzato': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Guida Utente - Thematic Excel Lens</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Una guida completa per utilizzare tutte le funzionalità dell'applicazione di analisi tematica. 
          Segui i passaggi per trasformare i tuoi dati Excel in insights significativi.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Panoramica
          </TabsTrigger>
          <TabsTrigger value="getting-started" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Iniziare
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Funzionalità
          </TabsTrigger>
          <TabsTrigger value="ai-guide" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Guida AI
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Consigli
          </TabsTrigger>
        </TabsList>

        {/* Panoramica */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Cos'è Thematic Excel Lens?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                <strong>Thematic Excel Lens</strong> è un'applicazione avanzata per l'analisi tematica di dati testuali 
                contenuti in file Excel. Permette di categorizzare, etichettare e analizzare grandi quantità di 
                risposte testuali utilizzando sia metodi manuali che intelligenza artificiale.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Per Chi è Pensato?
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Ricercatori e analisti</li>
                      <li>• Sociologi e psicologi</li>
                      <li>• Marketing e UX researchers</li>
                      <li>• Studenti e accademici</li>
                      <li>• Data analysts</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Vantaggi Principali
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Analisi automatizzata con AI</li>
                      <li>• Etichettatura collaborativa</li>
                      <li>• Visualizzazioni intuitive</li>
                      <li>• Esportazione flessibile</li>
                      <li>• Interfaccia user-friendly</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Panoramica Funzionalità */}
          <Card>
            <CardHeader>
              <CardTitle>Panoramica delle Funzionalità</CardTitle>
              <CardDescription>
                Esplora le principali aree funzionali dell'applicazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card 
                      key={feature.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        activeFeature === feature.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setActiveFeature(activeFeature === feature.id ? '' : feature.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {feature.description}
                            </p>
                            <Badge className={getLevelColor(feature.level)}>
                              {feature.level}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Getting Started */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-primary" />
                Primi Passi
              </CardTitle>
              <CardDescription>
                Segui questi passaggi per iniziare la tua prima analisi tematica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Carica il tuo File Excel
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Inizia caricando un file Excel (.xlsx, .xls) contenente i dati testuali da analizzare.
                    </p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Requisiti del file:</strong> Il file deve contenere almeno una colonna con risposte testuali. 
                        Ogni riga rappresenta una risposta diversa.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      Configura il Progetto
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Definisci il nome del progetto e configura le colonne specificando il tipo di dati 
                      (domande aperte, demografiche, scale Likert, etc.).
                    </p>
                    <div className="bg-blue-50 p-3 rounded border">
                      <p className="text-sm text-blue-800">
                        <strong>Tipi di colonna supportati:</strong> Aperte, Demografiche, Chiuse, Likert, Numeriche, Multiple
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Tags className="h-5 w-5 text-green-600" />
                      Crea le Etichette
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Definisci le categorie tematiche creando etichette personalizzate, oppure utilizza 
                      l'AI per generarle automaticamente.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border rounded p-3">
                        <h5 className="font-medium text-sm mb-1">Metodo Manuale</h5>
                        <p className="text-xs text-muted-foreground">
                          Crea etichette basate sulla tua conoscenza del dominio
                        </p>
                      </div>
                      <div className="border rounded p-3">
                        <h5 className="font-medium text-sm mb-1">Metodo AI</h5>
                        <p className="text-xs text-muted-foreground">
                          Lascia che l'AI analizzi i dati e suggerisca etichette
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Applica le Etichette
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Etichetta i dati manualmente o utilizza l'assistente AI per suggerimenti automatici 
                      basati sul contenuto delle risposte.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      Analizza i Risultati
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Esplora i risultati attraverso dashboard interattive, grafici e statistiche dettagliate 
                      per identificare pattern e insights.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Download className="h-5 w-5 text-teal-600" />
                      Esporta i Dati
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Esporta i risultati dell'analisi in vari formati (Excel, CSV, JSON) per ulteriori 
                      elaborazioni o per condividere con il team.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Funzionalità Dettagliate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* Gestione File */}
                <AccordionItem value="file-management">
                  <AccordionTrigger className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    Gestione File e Progetti
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Caricamento File</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Supporto per .xlsx, .xls</li>
                          <li>• Anteprima dati prima dell'import</li>
                          <li>• Validazione automatica formato</li>
                          <li>• Gestione file di grandi dimensioni</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Gestione Progetti</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Salvataggio automatico</li>
                          <li>• Backup incrementali</li>
                          <li>• Cronologia modifiche</li>
                          <li>• Condivisione progetti</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Configurazione Colonne */}
                <AccordionItem value="column-config">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-600" />
                    Configurazione Colonne
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Domande Aperte</h4>
                          <p className="text-sm text-muted-foreground">
                            Per risposte testuali libere che richiedono analisi tematica completa
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Scale Likert</h4>
                          <p className="text-sm text-muted-foreground">
                            Per risposte su scala (1-5, 1-7) con analisi quantitativa
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Demografiche</h4>
                          <p className="text-sm text-muted-foreground">
                            Per informazioni sui partecipanti (età, genere, ruolo)
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Sistema Etichette */}
                <AccordionItem value="label-system">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-green-600" />
                    Sistema di Etichettatura Avanzato
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Creazione Etichette</h4>
                        <div className="bg-gray-50 p-4 rounded">
                          <ul className="text-sm space-y-1">
                            <li>• <strong>Nome:</strong> Titolo dell'etichetta (es: "Soddisfazione Alta")</li>
                            <li>• <strong>Descrizione:</strong> Spiegazione dettagliata del criterio</li>
                            <li>• <strong>Colore:</strong> Codifica visiva per identificazione rapida</li>
                            <li>• <strong>Gerarchia:</strong> Organizzazione in categorie e sottocategorie</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Funzionalità Avanzate</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="border rounded p-3">
                            <h5 className="font-medium text-sm mb-1">Etichette Multiple</h5>
                            <p className="text-xs text-muted-foreground">
                              Applica più etichette a una singola risposta
                            </p>
                          </div>
                          <div className="border rounded p-3">
                            <h5 className="font-medium text-sm mb-1">Filtri Intelligenti</h5>
                            <p className="text-xs text-muted-foreground">
                              Filtra dati per etichetta, colonna o combinazioni
                            </p>
                          </div>
                          <div className="border rounded p-3">
                            <h5 className="font-medium text-sm mb-1">Statistiche Live</h5>
                            <p className="text-xs text-muted-foreground">
                              Monitoraggio in tempo reale dell'utilizzo etichette
                            </p>
                          </div>
                          <div className="border rounded p-3">
                            <h5 className="font-medium text-sm mb-1">Validazione Coerenza</h5>
                            <p className="text-xs text-muted-foreground">
                              Controllo automatico della consistenza
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Visualizzazioni */}
                <AccordionItem value="visualizations">
                  <AccordionTrigger className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Analisi e Visualizzazioni
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-3">Dashboard Panoramica</h4>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Statistiche generali del progetto
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Progresso etichettatura
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Distribuzione etichette
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Grafici interattivi
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Analisi per Colonna</h4>
                        <ul className="text-sm space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Istogrammi occorrenze
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            Esempi contestuali
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            Statistiche dettagliate
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Correlazioni tra colonne
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Esportazione */}
                <AccordionItem value="export">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-teal-600" />
                    Esportazione e Condivisione
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Formati Supportati</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Excel (.xlsx)</li>
                            <li>• CSV</li>
                            <li>• JSON</li>
                            <li>• PDF Report</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Opzioni Export</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Solo dati etichettati</li>
                            <li>• Include statistiche</li>
                            <li>• Filtri personalizzati</li>
                            <li>• Metadati progetto</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2">Condivisione</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Link condivisione</li>
                            <li>• Backup automatici</li>
                            <li>• Cronologia versioni</li>
                            <li>• Collaborazione team</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Guide */}
        <TabsContent value="ai-guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Guida all'Intelligenza Artificiale
              </CardTitle>
              <CardDescription>
                Scopri come utilizzare al meglio le funzionalità AI per l'analisi tematica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configurazione AI */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configurazione AI
                </h3>
                <div className="bg-blue-50 p-4 rounded border space-y-3">
                  <p className="text-sm">
                    Prima di utilizzare le funzionalità AI, configura la connessione nel pannello <strong>"AI Config"</strong>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">OpenRouter (Consigliato)</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Accesso a modelli multipli</li>
                        <li>• Costi contenuti</li>
                        <li>• Alta affidabilità</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">OpenAI</h4>
                      <ul className="text-sm space-y-1">
                        <li>• GPT-4 per qualità superiore</li>
                        <li>• Integrazione diretta</li>
                        <li>• Performance elevate</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generazione Etichette */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tags className="h-5 w-5 text-green-600" />
                  Generazione Automatica Etichette
                </h3>
                <div className="space-y-4">
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      L'AI analizza automaticamente i contenuti testuali e suggerisce etichette tematiche pertinenti
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium mb-3">Esempi di Prompt Efficaci:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-white p-3 rounded border-l-4 border-l-blue-500">
                        <strong>Per feedback prodotti:</strong><br/>
                        "Crea etichette per categorizzare feedback su prodotti digitali identificando temi come usabilità, performance, design, funzionalità e soddisfazione generale"
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-l-green-500">
                        <strong>Per sondaggi soddisfazione:</strong><br/>
                        "Analizza le risposte e crea etichette per livelli di soddisfazione, criticità specifiche e suggerimenti di miglioramento"
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-l-purple-500">
                        <strong>Per ricerca qualitativa:</strong><br/>
                        "Identifica temi emergenti nelle interviste e crea etichette per pattern comportamentali, attitudini e bisogni espressi"
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistente Suggerimenti */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Assistente per Suggerimenti
                </h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    L'assistente AI analizza ogni risposta e suggerisce le etichette più appropriate tra quelle esistenti,
                    fornendo anche la motivazione della scelta.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">Modalità Manuale</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Controllo completo dell'utente</li>
                          <li>• Revisione di ogni suggerimento</li>
                          <li>• Spiegazione del ragionamento AI</li>
                          <li>• Possibilità di accettare/rifiutare</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-teal-500">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">Modalità Automatica</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Elaborazione rapida di grandi dataset</li>
                          <li>• Soglia di confidenza personalizzabile</li>
                          <li>• Applicazione automatica suggerimenti</li>
                          <li>• Monitoraggio accuratezza in tempo reale</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Consulente AI */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Consulente AI per Analisi
                </h3>
                <div className="bg-yellow-50 p-4 rounded border space-y-3">
                  <p className="text-sm">
                    Utilizza il consulente AI per ottenere insights avanzati sui tuoi dati:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Identificazione di pattern nascosti</li>
                    <li>• Suggerimenti per migliorare la categorizzazione</li>
                    <li>• Analisi di sentiment e tono</li>
                    <li>• Raccomandazioni metodologiche</li>
                    <li>• Interpretazione risultati statistici</li>
                  </ul>
                </div>
              </div>

              {/* Best Practices */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Best Practices per l'AI</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700">✅ Da Fare</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Usa prompt specifici e dettagliati</li>
                      <li>• Rivedi sempre i suggerimenti AI</li>
                      <li>• Testa con dataset piccoli prima</li>
                      <li>• Mantieni coerenza nella terminologia</li>
                      <li>• Documenta le scelte di categorizzazione</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-700">❌ Da Evitare</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Non affidarsi ciecamente all'AI</li>
                      <li>• Evitare prompt troppo generici</li>
                      <li>• Non ignorare la validazione umana</li>
                      <li>• Non processare dati sensibili senza permessi</li>
                      <li>• Evitare etichette troppo specifiche o generiche</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips */}
        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                Consigli e Trucchi
              </CardTitle>
              <CardDescription>
                Suggerimenti degli esperti per massimizzare l'efficacia dell'analisi tematica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow Ottimale */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-blue-600" />
                  Workflow Ottimale
                </h3>
                <div className="bg-blue-50 p-4 rounded space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium">Esplorazione Iniziale</h4>
                      <p className="text-sm text-muted-foreground">
                        Leggi un campione rappresentativo (10-20%) delle risposte per familiarizzare con i contenuti
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium">Schema Preliminare</h4>
                      <p className="text-sm text-muted-foreground">
                        Definisci 5-10 macro-categorie basate sui temi ricorrenti identificati
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium">Test e Raffinamento</h4>
                      <p className="text-sm text-muted-foreground">
                        Applica lo schema a un sottocampione e modifica le etichette in base ai risultati
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-medium">Applicazione AI</h4>
                      <p className="text-sm text-muted-foreground">
                        Utilizza l'AI per accelerare l'etichettatura del dataset completo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">5</div>
                    <div>
                      <h4 className="font-medium">Validazione Finale</h4>
                      <p className="text-sm text-muted-foreground">
                        Revisiona un campione casuale del 5-10% per verificare la coerenza
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gestione Dati Complessi */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Gestione Dati Complessi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Filter className="h-4 w-4 text-purple-600" />
                        Risposte Ambigue
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Crea etichetta "Da Rivedere" temporanea</li>
                        <li>• Utilizza etichette multiple quando appropriate</li>
                        <li>• Documenta i criteri di decisione</li>
                        <li>• Consulta il team per casi limite</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Search className="h-4 w-4 text-orange-600" />
                        Dataset Grandi
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Usa campionamento stratificato</li>
                        <li>• Applica AI per pre-categorizzazione</li>
                        <li>• Lavora in batch progressivi</li>
                        <li>• Monitora coerenza durante il processo</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Ottimizzazione Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ottimizzazione delle Performance</h3>
                <div className="bg-green-50 p-4 rounded space-y-3">
                  <h4 className="font-medium text-green-800">Consigli per Velocizzare il Lavoro:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="text-sm space-y-1">
                      <li>• <strong>Usa scorciatoie da tastiera</strong> per etichettatura rapida</li>
                      <li>• <strong>Filtra per colonna</strong> per focus tematico</li>
                      <li>• <strong>Ordina per similarità</strong> per etichettare in blocchi</li>
                      <li>• <strong>Salva frequentemente</strong> per evitare perdite</li>
                    </ul>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>Usa modalità full-screen</strong> per più spazio</li>
                      <li>• <strong>Personalizza colori</strong> per riconoscimento rapido</li>
                      <li>• <strong>Revisiona in sessioni brevi</strong> (max 1-2 ore)</li>
                      <li>• <strong>Backup automatici</strong> attivi sempre</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Risoluzione Problemi Comuni</h3>
                <Accordion type="single" collapsible>
                  <AccordionItem value="ai-not-working">
                    <AccordionTrigger>L'AI non funziona o dà errori</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm space-y-1">
                        <li>• Verifica la configurazione API in "AI Config"</li>
                        <li>• Controlla la connessione internet</li>
                        <li>• Riduci la dimensione del prompt se troppo lungo</li>
                        <li>• Prova con un dataset più piccolo per test</li>
                        <li>• Verifica i crediti API rimanenti</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="slow-performance">
                    <AccordionTrigger>L'applicazione è lenta</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm space-y-1">
                        <li>• Chiudi tab non utilizzate del browser</li>
                        <li>• Riduci il numero di etichette visualizzate</li>
                        <li>• Filtra i dati per lavorare su sottoinsiemi</li>
                        <li>• Aggiorna il browser all'ultima versione</li>
                        <li>• Verifica la RAM disponibile del sistema</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data-loss">
                    <AccordionTrigger>Ho perso i dati o le etichette</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm space-y-1">
                        <li>• Controlla la sezione "Progetti" per versioni salvate</li>
                        <li>• Verifica i backup automatici nella cartella del progetto</li>
                        <li>• Ricarica la pagina per sincronizzare i dati</li>
                        <li>• Controlla se hai cambiato browser o dispositivo</li>
                        <li>• Contatta il supporto per recupero dati avanzato</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Hai bisogno di ulteriore aiuto?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Consulta la documentazione avanzata o contatta il supporto per assistenza personalizzata
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Documentazione
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Supporto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default InstructionsPage;

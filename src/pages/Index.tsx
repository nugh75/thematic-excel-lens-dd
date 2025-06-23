
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Tag, Users, ArrowRight, CheckCircle, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileSpreadsheet,
      title: "Caricamento Excel",
      description: "Importa facilmente i tuoi file Excel per iniziare l'analisi",
      color: "text-blue-500"
    },
    {
      icon: Tag,
      title: "Gestione Etichette",
      description: "Crea, modifica e organizza etichette tematiche gerarchiche",
      color: "text-green-500"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Assistente intelligente per suggerimenti ed etichettatura automatica",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Ricerca Qualitativa",
      description: "Strumento professionale per ricercatori e analisti",
      color: "text-orange-500"
    }
  ];

  const steps = [
    "Carica il tuo file Excel con i dati qualitativi",
    "Crea etichette tematiche personalizzate",
    "Etichetta le celle con i temi identificati",
    "Esplora e analizza i pattern tematici"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16 fade-in">
          <Badge variant="secondary" className="mb-4 text-sm">
            Strumento Professionale con AI Assistant
          </Badge>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            AnaTema
            <span className="text-primary block mt-2 text-3xl">Analisi Tematica Qualitativa</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Strumento avanzato per l'analisi tematica di dati qualitativi con AI Assistant integrato. 
            Crea etichette dinamiche, ottieni suggerimenti intelligenti e esplora i pattern tematici nei tuoi dati.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/analysis')}
            className="text-lg px-8 py-3"
          >
            Inizia Analisi
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow fade-in">
              <CardHeader>
                <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it Works */}
        <Card className="max-w-4xl mx-auto fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Come Funziona</CardTitle>
            <p className="text-muted-foreground">
              Processo semplice in 4 passaggi per la tua analisi tematica
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{step}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16 fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto per Iniziare?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Inizia subito la tua analisi tematica caricando un file Excel e scopri 
            i pattern nascosti nei tuoi dati qualitativi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/analysis')}
              className="text-lg px-8 py-3"
            >
              Carica File Excel
              <FileSpreadsheet className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3"
            >
              Guarda Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

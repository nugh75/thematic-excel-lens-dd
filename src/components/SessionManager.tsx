
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Save, FolderOpen, Plus, Trash2, Clock } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const SessionManager = () => {
  const { 
    sessions, 
    currentSession, 
    users,
    createSession, 
    loadSession, 
    saveCurrentSession, 
    deleteSession 
  } = useAnalysisStore();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome della sessione è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    createSession(sessionName.trim());
    setSessionName('');
    setIsCreating(false);
    
    toast({
      title: "Successo",
      description: "Sessione creata con successo",
    });
  };

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    toast({
      title: "Sessione caricata",
      description: "Sessione caricata con successo",
    });
  };

  const handleSaveSession = () => {
    saveCurrentSession();
    toast({
      title: "Sessione salvata",
      description: "Le modifiche sono state salvate",
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    toast({
      title: "Sessione eliminata",
      description: "Sessione eliminata con successo",
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('it-IT');
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Utente sconosciuto';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Gestione Sessioni
          </CardTitle>
          
          <div className="flex gap-2">
            {currentSession && (
              <Button variant="outline" onClick={handleSaveSession}>
                <Save className="h-4 w-4 mr-2" />
                Salva
              </Button>
            )}
            
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Sessione
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crea Nuova Sessione</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome Sessione</label>
                    <Input
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="Nome della sessione di etichettatura"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateSession} className="flex-1">
                      Crea Sessione
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreating(false)}
                      className="flex-1"
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentSession && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sessione Corrente</h4>
                <p className="text-sm text-muted-foreground">{currentSession.name}</p>
              </div>
              <Badge variant="default">Attiva</Badge>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h4 className="font-medium">Sessioni Salvate</h4>
          
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna sessione salvata</p>
              <p className="text-sm">Crea la tua prima sessione di etichettatura</p>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{session.name}</h4>
                    {currentSession?.id === session.id && (
                      <Badge variant="outline">Corrente</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Creata da: {getUserName(session.createdBy)}</p>
                    <p>Data: {formatDate(session.createdAt)}</p>
                    <p>Etichette: {session.cellLabels.length} celle, {session.rowLabels.length} righe</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadSession(session.id)}
                    disabled={currentSession?.id === session.id}
                  >
                    Carica
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManager;

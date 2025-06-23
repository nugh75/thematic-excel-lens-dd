
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, UserCheck, UserX, Settings } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import UserCreationDialog from './UserCreationDialog';

const UserManager = () => {
  const { users, currentUser, setCurrentUser, removeUser } = useAnalysisStore();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<string | null>(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'annotator': return 'bg-blue-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (userId === 'default-user') {
      toast({
        title: "Errore",
        description: "Non puoi rimuovere l'utente principale",
        variant: "destructive",
      });
      return;
    }

    removeUser(userId);
    toast({
      title: "Successo",
      description: "Utente rimosso con successo",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestione Utenti
          </CardTitle>
          
          <Button onClick={() => setIsCreatingUser(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Utente
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Utente Corrente</label>
            <Select value={currentUser?.id} onValueChange={setCurrentUser}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona utente" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: user.color }}
                      />
                      <span>{user.name}</span>
                      <Badge className={`text-xs ${getRoleBadgeColor(user.role || 'viewer')}`}>
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'annotator' ? 'Annotatore' : 'Visualizzatore'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tutti gli Utenti ({users.length})</label>
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      {currentUser?.id === user.id && (
                        <Badge variant="default">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Attivo
                        </Badge>
                      )}
                    </div>
                    {user.email && (
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getRoleBadgeColor(user.role || 'viewer')}`}>
                    {user.role === 'admin' ? 'Admin' : 
                     user.role === 'annotator' ? 'Annotatore' : 'Visualizzatore'}
                  </Badge>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dettagli Utente</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div><strong>Nome:</strong> {user.name}</div>
                        <div><strong>Email:</strong> {user.email || 'Non specificata'}</div>
                        <div><strong>Ruolo:</strong> {user.role || 'viewer'}</div>
                        <div><strong>Creato:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                        <div className="flex items-center gap-2">
                          <strong>Colore:</strong>
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: user.color }} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {user.id !== 'default-user' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <UserCreationDialog 
        open={isCreatingUser}
        onOpenChange={setIsCreatingUser}
      />
    </Card>
  );
};

export default UserManager;

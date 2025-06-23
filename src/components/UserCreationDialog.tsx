
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

interface UserCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserCreationDialog = ({ open, onOpenChange }: UserCreationDialogProps) => {
  const { addUser, users } = useAnalysisStore();
  const [newUser, setNewUser] = useState({ 
    name: '', 
    color: colors[0],
    email: '',
    role: 'annotator' as 'admin' | 'annotator' | 'viewer'
  });

  const handleCreateUser = () => {
    if (!newUser.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome utente è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    if (users.some(u => u.name === newUser.name.trim())) {
      toast({
        title: "Errore",
        description: "Un utente con questo nome esiste già",
        variant: "destructive",
      });
      return;
    }

    addUser({
      name: newUser.name.trim(),
      color: newUser.color,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: Date.now(),
    });

    setNewUser({ 
      name: '', 
      color: colors[0],
      email: '',
      role: 'annotator'
    });
    onOpenChange(false);
    
    toast({
      title: "Successo",
      description: "Utente creato con successo",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuovo Utente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Utente *</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome dell'utente"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@esempio.com"
            />
          </div>

          <div>
            <Label>Ruolo</Label>
            <div className="flex gap-2 mt-2">
              {(['admin', 'annotator', 'viewer'] as const).map(role => (
                <Button
                  key={role}
                  variant={newUser.role === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewUser(prev => ({ ...prev, role }))}
                >
                  {role === 'admin' ? 'Amministratore' : 
                   role === 'annotator' ? 'Annotatore' : 'Visualizzatore'}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Colore</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newUser.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewUser(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreateUser} className="flex-1">
              Crea Utente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationDialog;

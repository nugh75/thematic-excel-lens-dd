
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Plus, 
  UserCheck, 
  UserX, 
  Settings, 
  Edit, 
  Trash2, 
  Shield,
  PenTool,
  Eye,
  User
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import { User as UserType } from '../types/analysis';
import UserCreationDialog from './UserCreationDialog';

const UserManager = () => {
  const { users, currentUser, setCurrentUser, removeUser, updateUser } = useAnalysisStore();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'annotator' | 'viewer'>('annotator');
  const [editColor, setEditColor] = useState('#3B82F6');
  const [editIsActive, setEditIsActive] = useState(true);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-300';
      case 'annotator': return 'bg-green-100 text-green-800 border-green-300';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'annotator': return <PenTool className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const canEditUser = (user: UserType) => {
    // Admin can edit everyone, others can only edit themselves
    return currentUser?.role === 'admin' || currentUser?.id === user.id;
  };

  const canDeleteUser = (user: UserType) => {
    // Admin can delete others (except default user), users can't delete themselves
    return currentUser?.role === 'admin' && 
           user.id !== 'default-user' && 
           user.id !== currentUser?.id;
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email || '');
    setEditRole(user.role || 'annotator');
    setEditColor(user.color);
    setEditIsActive(user.isActive);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    if (!editName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate name (excluding current user)
    const existingUser = users.find(u => 
      u.id !== editingUser.id && 
      u.name.toLowerCase() === editName.trim().toLowerCase()
    );

    if (existingUser) {
      toast({
        title: "Errore",
        description: "Esiste già un utente con questo nome",
        variant: "destructive",
      });
      return;
    }

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim() || undefined,
      role: editRole,
      color: editColor,
      isActive: editIsActive,
    });

    toast({
      title: "Utente aggiornato",
      description: `Le proprietà di ${editName} sono state aggiornate`,
    });

    setIsEditDialogOpen(false);
    setEditingUser(null);
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
                  
                  {canEditUser(user) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canDeleteUser(user) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome utente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Ruolo</Label>
              <Select value={editRole} onValueChange={(value: 'admin' | 'annotator' | 'viewer') => setEditRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Visualizzatore
                    </div>
                  </SelectItem>
                  <SelectItem value="annotator">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      Annotatore
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Amministratore
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-color">Colore Avatar</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-20 h-10"
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: editColor }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label htmlFor="edit-active">Utente attivo</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button onClick={handleSaveEdit}>
              Salva Modifiche
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManager;

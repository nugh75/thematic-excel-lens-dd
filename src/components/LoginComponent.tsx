import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LogIn, 
  UserPlus, 
  User, 
  Shield, 
  Eye, 
  PenTool,
  Users
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const LoginComponent = () => {
  const { users, currentUser, setCurrentUser, addUser } = useAnalysisStore();
  const [showLogin, setShowLogin] = useState(!currentUser);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  
  // New user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'annotator' | 'viewer'>('annotator');
  const [newUserColor, setNewUserColor] = useState('#3B82F6');

  const handleLogin = () => {
    if (!selectedUserId) {
      toast({
        title: "Errore",
        description: "Seleziona un utente per effettuare il login",
        variant: "destructive",
      });
      return;
    }

    if (password !== 'admin123') {
      toast({
        title: "Errore",
        description: "Password non corretta",
        variant: "destructive",
      });
      return;
    }

    setCurrentUser(selectedUserId);
    setShowLogin(false);
    setPassword(''); // Reset password
    
    const user = users.find(u => u.id === selectedUserId);
    toast({
      title: "Login effettuato",
      description: `Benvenuto/a, ${user?.name}!`,
    });
  };

  const handleCreateUser = () => {
    if (!newUserName.trim()) {
      toast({
        title: "Errore",
        description: "Il nome utente è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => 
      u.name.toLowerCase() === newUserName.trim().toLowerCase() ||
      (newUserEmail && u.email?.toLowerCase() === newUserEmail.trim().toLowerCase())
    );

    if (existingUser) {
      toast({
        title: "Errore",
        description: "Esiste già un utente con questo nome o email",
        variant: "destructive",
      });
      return;
    }

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim() || undefined,
      color: newUserColor,
      role: newUserRole,
      isActive: true,
      createdAt: Date.now(),
    });

    toast({
      title: "Utente creato",
      description: `Utente "${newUserName}" creato con successo`,
    });

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('annotator');
    setNewUserColor('#3B82F6');
    setShowCreateUser(false);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setShowLogin(true);
    toast({
      title: "Logout effettuato",
      description: "Sei stato disconnesso",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'annotator':
        return <PenTool className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'annotator':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Amministratore - Accesso completo';
      case 'annotator':
        return 'Annotatore - Può etichettare e modificare';
      case 'viewer':
        return 'Visualizzatore - Solo lettura';
      default:
        return 'Utente standard';
    }
  };

  if (currentUser) {
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarFallback style={{ backgroundColor: user.color + '20', color: user.color }}>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{user.name}</span>
            <Badge className={`gap-1 text-xs ${getRoleColor(user.role || 'annotator')}`}>
              {getRoleIcon(user.role || 'annotator')}
              {user.role || 'annotator'}
            </Badge>
          </div>
          {user.email && (
            <p className="text-sm text-gray-600">{user.email}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Login Section sempre visibile quando non loggato */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Accedi al Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-select">Seleziona Utente</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Scegli un utente..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback 
                          className="text-xs"
                          style={{ backgroundColor: user.color + '20', color: user.color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <Badge className={`ml-2 text-xs ${getRoleColor(user.role || 'annotator')}`}>
                          {user.role || 'annotator'}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la password"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password temporanea: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">admin123</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleLogin} 
              className="flex-1"
              disabled={!selectedUserId || !password}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Accedi
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateUser(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          {users.length === 0 && (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nessun utente disponibile</p>
              <p className="text-xs text-gray-500">Crea il primo utente per iniziare</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog per creare nuovo utente */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Crea Nuovo Utente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Inserisci il nome"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email (opzionale)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">Ruolo</Label>
              <Select value={newUserRole} onValueChange={(value: 'admin' | 'annotator' | 'viewer') => setNewUserRole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <div>
                        <div>Amministratore</div>
                        <div className="text-xs text-gray-500">Accesso completo</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="annotator">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      <div>
                        <div>Annotatore</div>
                        <div className="text-xs text-gray-500">Può etichettare</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <div>Visualizzatore</div>
                        <div className="text-xs text-gray-500">Solo lettura</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Colore</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="color"
                  type="color"
                  value={newUserColor}
                  onChange={(e) => setNewUserColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={newUserColor}
                  onChange={(e) => setNewUserColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Anteprima:</p>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback 
                    style={{ backgroundColor: newUserColor + '20', color: newUserColor }}
                  >
                    {newUserName.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium">{newUserName || 'Nome Utente'}</span>
                  <Badge className={`ml-2 text-xs ${getRoleColor(newUserRole)}`}>
                    {getRoleIcon(newUserRole)}
                    {newUserRole}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Annulla
              </Button>
              <Button onClick={handleCreateUser}>
                Crea Utente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginComponent;

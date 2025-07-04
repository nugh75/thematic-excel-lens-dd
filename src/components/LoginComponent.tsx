import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LogIn, 
  UserPlus, 
  User, 
  Shield, 
  Eye, 
  PenTool,
  Users,
  AlertTriangle,
  Clock,
  Key
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import { AuthService, authLimiter } from '../services/authService';
import PasswordManager from './PasswordManager';

const LoginComponent = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser } = useAnalysisStore();
  const [showLogin, setShowLogin] = useState(!currentUser);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [passwordManagerUser, setPasswordManagerUser] = useState<{ id: string; name: string } | null>(null);
  
  // New user form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'annotator' | 'viewer'>('annotator');
  const [newUserColor, setNewUserColor] = useState('#3B82F6');

  // Check for lockout on component mount and user selection
  useEffect(() => {
    if (selectedUserId) {
      const canAttempt = authLimiter.canAttempt(selectedUserId);
      if (!canAttempt) {
        const remainingTime = authLimiter.getRemainingLockoutTime(selectedUserId);
        setLockoutTime(remainingTime);
        
        const interval = setInterval(() => {
          const remaining = authLimiter.getRemainingLockoutTime(selectedUserId);
          setLockoutTime(remaining);
          
          if (remaining <= 0) {
            clearInterval(interval);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [selectedUserId]);

  // Create default admin if no users exist
  useEffect(() => {
    const initializeDefaultAdmin = async () => {
      if (users.length === 0) {
        try {
          const defaultAdmin = await AuthService.createDefaultAdmin();
          addUser({
            name: defaultAdmin.name,
            email: defaultAdmin.email,
            color: defaultAdmin.color,
            role: defaultAdmin.role,
            isActive: defaultAdmin.isActive,
            createdAt: defaultAdmin.createdAt,
            passwordHash: defaultAdmin.passwordHash
          });
          
          toast({
            title: "Amministratore predefinito creato",
            description: `Username: ${defaultAdmin.name}, Password: ${defaultAdmin.password}`,
            duration: 10000,
          });
        } catch (error) {
          console.error('Errore nella creazione dell\'amministratore predefinito:', error);
        }
      }
    };
    
    initializeDefaultAdmin();
  }, [users.length, addUser]);

  const handleLogin = async () => {
    if (!selectedUserId) {
      toast({
        title: "Errore",
        description: "Seleziona un utente per effettuare il login",
        variant: "destructive",
      });
      return;
    }

    const user = users.find(u => u.id === selectedUserId);
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non trovato",
        variant: "destructive",
      });
      return;
    }

    // Check if user is locked out
    if (!authLimiter.canAttempt(selectedUserId)) {
      const remainingTime = Math.ceil(authLimiter.getRemainingLockoutTime(selectedUserId) / 1000 / 60);
      toast({
        title: "Account bloccato",
        description: `Troppi tentativi falliti. Riprova tra ${remainingTime} minuti.`,
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Errore",
        description: "Inserisci la password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if user has a password set
      if (!user.passwordHash) {
        toast({
          title: "Password non impostata",
          description: "Questo utente non ha una password. Imposta una password prima di continuare.",
          variant: "destructive",
        });
        setPasswordManagerUser({ id: user.id, name: user.name });
        setShowPasswordManager(true);
        setIsLoading(false);
        return;
      }

      // Verify password
      const isValidPassword = await AuthService.verifyPassword(password, user.passwordHash);
      
      if (isValidPassword) {
        authLimiter.recordSuccess(selectedUserId);
        setCurrentUser(selectedUserId);
        setShowLogin(false);
        setPassword('');
        setLoginAttempts(0);
        
        toast({
          title: "Login effettuato",
          description: `Benvenuto/a, ${user.name}!`,
        });
      } else {
        authLimiter.recordFailure(selectedUserId);
        setLoginAttempts(prev => prev + 1);
        
        toast({
          title: "Errore",
          description: "Password non corretta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'autenticazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

    // Create user without password first, then prompt for password
    const newUser = {
      name: newUserName.trim(),
      email: newUserEmail.trim() || undefined,
      color: newUserColor,
      role: newUserRole,
      isActive: true,
      createdAt: Date.now(),
    };

    addUser(newUser);

    toast({
      title: "Utente creato",
      description: `Utente "${newUserName}" creato. Ora imposta una password.`,
    });

    // Find the newly created user and open password manager
    setTimeout(() => {
      const createdUser = users.find(u => u.name === newUserName.trim());
      if (createdUser) {
        setPasswordManagerUser({ id: createdUser.id, name: createdUser.name });
        setShowPasswordManager(true);
      }
    }, 100);

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('annotator');
    setNewUserColor('#3B82F6');
    setShowCreateUser(false);
  };

  const handlePasswordSet = (hashedPassword: string) => {
    if (passwordManagerUser) {
      updateUser(passwordManagerUser.id, { passwordHash: hashedPassword });
      setPasswordManagerUser(null);
      
      toast({
        title: "Password impostata",
        description: `Password configurata per ${passwordManagerUser.name}`,
      });
    }
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
    if (!user) {
      return null;
    }

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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setPasswordManagerUser({ id: user.id, name: user.name });
              setShowPasswordManager(true);
            }}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
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
          {/* Lockout warning */}
          {lockoutTime > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Account bloccato per {Math.ceil(lockoutTime / 1000 / 60)} minuti a causa di troppi tentativi falliti.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Login attempts warning */}
          {loginAttempts > 0 && lockoutTime === 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                {loginAttempts} tentativo/i fallito/i. Dopo 5 tentativi l'account verrà bloccato per 15 minuti.
              </AlertDescription>
            </Alert>
          )}

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
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge className={`text-xs ${getRoleColor(user.role || 'annotator')}`}>
                          {user.role || 'annotator'}
                        </Badge>
                        {!user.passwordHash && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                            No password
                          </Badge>
                        )}
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
              disabled={lockoutTime > 0}
            />
            {users.length > 0 && users.some(u => !u.passwordHash) && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Alcuni utenti non hanno una password impostata. Clicca su "Imposta Password" dopo la creazione.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleLogin} 
              className="flex-1"
              disabled={!selectedUserId || !password || lockoutTime > 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Accesso...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Accedi
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateUser(true)}
              disabled={isLoading}
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

      {/* Password Manager Dialog */}
      {passwordManagerUser && (
        <PasswordManager
          isOpen={showPasswordManager}
          onClose={() => {
            setShowPasswordManager(false);
            setPasswordManagerUser(null);
          }}
          onPasswordSet={handlePasswordSet}
          currentUserName={passwordManagerUser.name}
          isEditing={!!users.find(u => u.id === passwordManagerUser.id)?.passwordHash}
        />
      )}
    </>
  );
};

export default LoginComponent;

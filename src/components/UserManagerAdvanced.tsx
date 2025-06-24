import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  PenTool, 
  Eye, 
  Key, 
  Trash2, 
  UserCheck, 
  UserX,
  Calendar,
  Mail,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { User } from '../types/analysis';
import { toast } from '@/hooks/use-toast';
import PasswordManager from './PasswordManager';

interface UserManagerAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const UserManagerAdvanced: React.FC<UserManagerAdvancedProps> = ({
  isOpen,
  onClose,
  currentUserId
}) => {
  const { users, removeUser, updateUser } = useAnalysisStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const currentUser = users.find(u => u.id === currentUserId);
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'annotator':
        return <PenTool className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
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

  const formatDate = (timestamp?: number) => {
    if (!timestamp) {
      return 'N/A';
    }
    return new Date(timestamp).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleActive = (user: User) => {
    if (!isCurrentUserAdmin) {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono modificare lo stato degli utenti",
        variant: "destructive",
      });
      return;
    }

    if (user.id === currentUserId) {
      toast({
        title: "Operazione non permessa",
        description: "Non puoi disattivare il tuo stesso account",
        variant: "destructive",
      });
      return;
    }

    updateUser(user.id, { isActive: !user.isActive });
    toast({
      title: user.isActive ? "Utente disattivato" : "Utente attivato",
      description: `${user.name} è stato ${user.isActive ? 'disattivato' : 'attivato'}`,
    });
  };

  const handleDeleteUser = (user: User) => {
    if (!isCurrentUserAdmin) {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono eliminare utenti",
        variant: "destructive",
      });
      return;
    }

    if (user.id === currentUserId) {
      toast({
        title: "Operazione non permessa",
        description: "Non puoi eliminare il tuo stesso account",
        variant: "destructive",
      });
      return;
    }

    const adminUsers = users.filter(u => u.role === 'admin' && u.id !== user.id);
    if (user.role === 'admin' && adminUsers.length === 0) {
      toast({
        title: "Operazione non permessa",
        description: "Non puoi eliminare l'ultimo amministratore",
        variant: "destructive",
      });
      return;
    }

    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      removeUser(userToDelete.id);
      toast({
        title: "Utente eliminato",
        description: `${userToDelete.name} è stato eliminato`,
      });
      setUserToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleSetPassword = (user: User) => {
    if (!isCurrentUserAdmin && user.id !== currentUserId) {
      toast({
        title: "Accesso negato",
        description: "Puoi modificare solo la tua password",
        variant: "destructive",
      });
      return;
    }

    setSelectedUser(user);
    setShowPasswordManager(true);
  };

  const handlePasswordSet = (hashedPassword: string) => {
    if (selectedUser) {
      updateUser(selectedUser.id, { passwordHash: hashedPassword });
      setSelectedUser(null);
      
      toast({
        title: "Password aggiornata",
        description: `Password configurata per ${selectedUser.name}`,
      });
    }
  };

  const getStatusBadge = (user: User) => {
    const baseClasses = "text-xs gap-1";
    
    if (!user.isActive) {
      return (
        <Badge variant="outline" className={`${baseClasses} text-red-600 border-red-300`}>
          <UserX className="h-3 w-3" />
          Disattivato
        </Badge>
      );
    }

    if (!user.passwordHash) {
      return (
        <Badge variant="outline" className={`${baseClasses} text-orange-600 border-orange-300`}>
          <AlertTriangle className="h-3 w-3" />
          No password
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className={`${baseClasses} text-green-600 border-green-300`}>
        <UserCheck className="h-3 w-3" />
        Attivo
      </Badge>
    );
  };

  if (!isCurrentUserAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Accesso Negato
            </DialogTitle>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Solo gli amministratori possono accedere alla gestione utenti avanzata.
            </AlertDescription>
          </Alert>
          <Button onClick={onClose}>Chiudi</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Utenti Avanzata
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-2xl font-bold">{users.length}</div>
                  <div className="text-xs text-gray-600">Totale utenti</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'admin').length}
                  </div>
                  <div className="text-xs text-gray-600">Amministratori</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.isActive).length}
                  </div>
                  <div className="text-xs text-gray-600">Utenti attivi</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-orange-600">
                    {users.filter(u => !u.passwordHash).length}
                  </div>
                  <div className="text-xs text-gray-600">Senza password</div>
                </CardContent>
              </Card>
            </div>

            {/* Users list */}
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className={`${user.id === currentUserId ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback 
                          style={{ backgroundColor: user.color + '20', color: user.color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{user.name}</h3>
                          {user.id === currentUserId && (
                            <Badge variant="outline" className="text-xs">Tu</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`gap-1 text-xs ${getRoleColor(user.role || 'annotator')}`}>
                            {getRoleIcon(user.role || 'annotator')}
                            {user.role || 'annotator'}
                          </Badge>
                          {getStatusBadge(user)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Creato: {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPassword(user)}
                          disabled={!user.isActive}
                        >
                          <Key className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          disabled={user.id === currentUserId}
                          className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === currentUserId}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Manager */}
      {selectedUser && (
        <PasswordManager
          isOpen={showPasswordManager}
          onClose={() => {
            setShowPasswordManager(false);
            setSelectedUser(null);
          }}
          onPasswordSet={handlePasswordSet}
          currentUserName={selectedUser.name}
          isEditing={!!selectedUser.passwordHash}
        />
      )}

      {/* Delete confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Conferma Eliminazione
            </DialogTitle>
          </DialogHeader>
          
          {userToDelete && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Attenzione!</strong> Questa azione non può essere annullata.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  Stai per eliminare l'utente:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      style={{ backgroundColor: userToDelete.color + '20', color: userToDelete.color }}
                    >
                      {userToDelete.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{userToDelete.name}</span>
                    <Badge className={`ml-2 text-xs ${getRoleColor(userToDelete.role || 'annotator')}`}>
                      {userToDelete.role || 'annotator'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteUser}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagerAdvanced;

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Key, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { toast } from '@/hooks/use-toast';

interface PasswordManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSet: (hashedPassword: string) => void;
  isEditing?: boolean;
  currentUserName?: string;
}

const PasswordManager: React.FC<PasswordManagerProps> = ({
  isOpen,
  onClose,
  onPasswordSet,
  isEditing = false,
  currentUserName = 'Nuovo Utente'
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
  const passwordValidation = AuthService.validatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const getStrengthColor = (score: number) => {
    if (score <= 1) {
      return 'bg-red-500';
    }
    if (score <= 2) {
      return 'bg-orange-500';
    }
    if (score <= 3) {
      return 'bg-yellow-500';
    }
    if (score <= 4) {
      return 'bg-blue-500';
    }
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) {
      return 'Molto debole';
    }
    if (score <= 2) {
      return 'Debole';
    }
    if (score <= 3) {
      return 'Media';
    }
    if (score <= 4) {
      return 'Forte';
    }
    return 'Molto forte';
  };

  const generateRandomPassword = () => {
    const newPassword = AuthService.generateRandomPassword(12);
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    toast({
      title: "Password generata",
      description: "Password sicura generata automaticamente",
    });
  };

  const handleSubmit = async () => {
    if (!passwordValidation.isValid) {
      toast({
        title: "Password non valida",
        description: "La password non soddisfa i requisiti di sicurezza",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Password non corrispondenti",
        description: "Le password inserite non corrispondono",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const hashedPassword = await AuthService.hashPassword(password);
      onPasswordSet(hashedPassword);
      
      // Reset form
      setPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password configurata",
        description: `Password ${isEditing ? 'aggiornata' : 'impostata'} con successo`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'elaborazione della password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {isEditing ? 'Modifica Password' : 'Imposta Password'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Utente:</strong> {currentUserName}
            </p>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci la password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(passwordValidation.score / 5) * 100} 
                    className="flex-1 h-2"
                  />
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStrengthColor(passwordValidation.score)} text-white border-none`}
                  >
                    {getStrengthText(passwordValidation.score)}
                  </Badge>
                </div>

                {/* Password feedback */}
                {passwordValidation.feedback.length > 0 && (
                  <div className="space-y-1">
                    {passwordValidation.feedback.map((feedback, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">{feedback}</span>
                      </div>
                    ))}
                  </div>
                )}

                {passwordValidation.isValid && (
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Password valida</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm password field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Conferma la password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Password match indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-2 text-xs">
                {passwordsMatch ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Le password corrispondono</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Le password non corrispondono</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Generate random password button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={generateRandomPassword}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Genera Password Sicura
          </Button>

          {/* Password requirements */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Requisiti Password:</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Almeno 8 caratteri</li>
              <li>• Almeno una lettera maiuscola</li>
              <li>• Almeno una lettera minuscola</li>
              <li>• Almeno un numero</li>
              <li>• Almeno un carattere speciale</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!passwordValidation.isValid || !passwordsMatch || isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  {isEditing ? 'Aggiorna' : 'Imposta'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordManager;

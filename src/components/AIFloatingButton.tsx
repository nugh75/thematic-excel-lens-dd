import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MessageCircle } from 'lucide-react';
import { AIConsultant } from './AIConsultant';
import { aiService } from '../services/aiService';

interface AIFloatingButtonProps {
  context: string;
}

export function AIFloatingButton({ context }: AIFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const aiSettings = aiService.getSettings();

  if (!aiSettings.enabled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Consulente AI
            </DialogTitle>
          </DialogHeader>
          <AIConsultant 
            context={context}
            title=""
            description="Chiedi consigli all'AI per la tua analisi tematica"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

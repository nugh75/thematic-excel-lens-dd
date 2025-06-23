import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Sparkles } from 'lucide-react';
import { AISuggestions } from './AISuggestions';
import { aiService } from '../services/aiService';

interface AIQuickAccessProps {
  columnName: string;
  responses: string[];
  trigger?: React.ReactNode;
}

export function AIQuickAccess({ columnName, responses, trigger }: AIQuickAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const aiSettings = aiService.getSettings();

  if (!aiSettings.enabled) {
    return null;
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Sparkles className="h-4 w-4 mr-2" />
      AI Suggerimenti
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Suggerimenti AI - {columnName}
          </DialogTitle>
        </DialogHeader>
        <AISuggestions 
          columnName={columnName} 
          responses={responses}
          onLabelCreated={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

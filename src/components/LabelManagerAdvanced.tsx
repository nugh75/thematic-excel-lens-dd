import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Merge, Trash2, Tag, Save, X } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const LabelManagerAdvanced = () => {
  const { labels, addLabel, updateLabel, deleteLabel, mergeLabels, getLabelStats } = useAnalysisStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedLabelsForMerge, setSelectedLabelsForMerge] = useState<string[]>([]);
  const [targetLabelForMerge, setTargetLabelForMerge] = useState<string>('');
  
  const [newLabel, setNewLabel] = useState({
    name: '',
    description: '',
    color: colors[0],
  });
  
  const [editLabel, setEditLabel] = useState({
    name: '',
    description: '',
    color: colors[0],
  });

  const labelStats = getLabelStats();

  const handleCreateLabel = () => {
    if (!newLabel.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome dell'etichetta è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    addLabel({
      name: newLabel.name.trim(),
      description: newLabel.description.trim(),
      color: newLabel.color,
    });

    setNewLabel({ name: '', description: '', color: colors[0] });
    setIsCreating(false);
    
    toast({
      title: "Successo",
      description: "Etichetta creata con successo",
    });
  };

  const handleEditLabel = (labelId: string) => {
    const label = labels.find(l => l.id === labelId);
    if (label) {
      setEditLabel({
        name: label.name,
        description: label.description || '',
        color: label.color,
      });
      setEditingLabel(labelId);
    }
  };

  const handleUpdateLabel = () => {
    if (!editLabel.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome dell'etichetta è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    updateLabel(editingLabel!, {
      name: editLabel.name.trim(),
      description: editLabel.description.trim(),
      color: editLabel.color,
    });

    setEditingLabel(null);
    setEditLabel({ name: '', description: '', color: colors[0] });
    
    toast({
      title: "Successo",
      description: "Etichetta aggiornata con successo",
    });
  };

  const handleDeleteLabel = (id: string) => {
    deleteLabel(id);
    toast({
      title: "Successo",
      description: "Etichetta eliminata con successo",
    });
  };

  const handleMergeLabels = () => {
    if (selectedLabelsForMerge.length < 1) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un'etichetta da unire",
        variant: "destructive",
      });
      return;
    }

    if (!targetLabelForMerge) {
      toast({
        title: "Errore",
        description: "Seleziona l'etichetta di destinazione",
        variant: "destructive",
      });
      return;
    }

    if (selectedLabelsForMerge.includes(targetLabelForMerge)) {
      toast({
        title: "Errore",
        description: "L'etichetta di destinazione non può essere tra quelle da unire",
        variant: "destructive",
      });
      return;
    }

    const sourceLabelsNames = selectedLabelsForMerge.map(id => 
      labels.find(l => l.id === id)?.name
    ).filter(Boolean);
    const targetLabelName = labels.find(l => l.id === targetLabelForMerge)?.name;

    mergeLabels(selectedLabelsForMerge, targetLabelForMerge);
    
    toast({
      title: "Successo",
      description: `Unite ${selectedLabelsForMerge.length} etichette (${sourceLabelsNames.join(', ')}) in "${targetLabelName}"`,
    });

    // Reset stato merge
    setSelectedLabelsForMerge([]);
    setTargetLabelForMerge('');
    setIsMerging(false);
  };

  const toggleLabelForMerge = (labelId: string) => {
    setSelectedLabelsForMerge(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const cancelMerge = () => {
    setIsMerging(false);
    setSelectedLabelsForMerge([]);
    setTargetLabelForMerge('');
  };

  return (
    <Card className="w-full fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Gestione Avanzata Etichette
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {!isMerging ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setIsMerging(true)}
                  className="flex items-center gap-2"
                  disabled={labels.length < 2}
                >
                  <Merge className="h-4 w-4" />
                  Unisci Etichette
                </Button>
                
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuova Etichetta
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crea Nuova Etichetta</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          value={newLabel.name}
                          onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome dell'etichetta"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrizione</Label>
                        <Textarea
                          id="description"
                          value={newLabel.description}
                          onChange={(e) => setNewLabel(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrizione opzionale"
                        />
                      </div>
                      
                      <div>
                        <Label>Colore</Label>
                        <div className="flex gap-2 mt-2">
                          {colors.map(color => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 ${
                                newLabel.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewLabel(prev => ({ ...prev, color }))}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleCreateLabel} className="flex-1">
                          Crea Etichetta
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
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Seleziona etichette da unire, poi scegli la destinazione:
                </span>
                
                <Select value={targetLabelForMerge} onValueChange={setTargetLabelForMerge}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Etichetta destinazione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {labels.filter(l => !selectedLabelsForMerge.includes(l.id)).map(label => (
                      <SelectItem key={label.id} value={label.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleMergeLabels}
                  disabled={selectedLabelsForMerge.length < 1 || !targetLabelForMerge}
                >
                  Unisci ({selectedLabelsForMerge.length})
                </Button>
                
                <Button variant="outline" onClick={cancelMerge}>
                  Annulla
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {isMerging && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">
              Modalità Unione Etichette: Seleziona le etichette da unire (le etichette selezionate verranno eliminate e tutti i loro riferimenti verranno trasferiti all'etichetta di destinazione)
            </p>
            <div className="text-xs text-muted-foreground">
              Etichette selezionate: {selectedLabelsForMerge.length} | 
              Destinazione: {targetLabelForMerge ? labels.find(l => l.id === targetLabelForMerge)?.name : 'Nessuna'}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {labels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessuna etichetta creata ancora</p>
            <p className="text-sm">Inizia creando la tua prima etichetta</p>
          </div>
        ) : (
          <div className="space-y-2">
            {labels.map(label => (
              <div key={label.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  {isMerging && (
                    <Checkbox
                      checked={selectedLabelsForMerge.includes(label.id)}
                      onCheckedChange={() => toggleLabelForMerge(label.id)}
                    />
                  )}
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: label.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{label.name}</span>
                      <Badge variant="secondary">
                        {labelStats[label.id] || 0} celle
                      </Badge>
                    </div>
                    {label.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {label.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {!isMerging && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLabel(label.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Elimina Etichetta</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare l'etichetta "{label.name}"? 
                            Questa azione rimuoverà l'etichetta da tutte le celle e righe e non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteLabel(label.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog per modifica etichetta */}
      <Dialog open={editingLabel !== null} onOpenChange={(open) => !open && setEditingLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Etichetta</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={editLabel.name}
                onChange={(e) => setEditLabel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome dell'etichetta"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrizione</Label>
              <Textarea
                id="edit-description"
                value={editLabel.description}
                onChange={(e) => setEditLabel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione opzionale"
              />
            </div>
            
            <div>
              <Label>Colore</Label>
              <div className="flex gap-2 mt-2">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editLabel.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditLabel(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateLabel} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salva Modifiche
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingLabel(null)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LabelManagerAdvanced;

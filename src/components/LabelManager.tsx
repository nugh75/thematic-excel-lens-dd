
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, X, Tag } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const LabelManager = () => {
  const { labels, addLabel, updateLabel, deleteLabel, getLabelStats } = useAnalysisStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState({
    name: '',
    description: '',
    color: colors[0],
    parentId: '',
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
      parentId: newLabel.parentId === 'none' ? undefined : newLabel.parentId || undefined,
    });

    setNewLabel({ name: '', description: '', color: colors[0], parentId: '' });
    setIsCreating(false);
    
    toast({
      title: "Successo",
      description: "Etichetta creata con successo",
    });
  };

  const handleDeleteLabel = (id: string) => {
    deleteLabel(id);
    toast({
      title: "Successo",
      description: "Etichetta eliminata con successo",
    });
  };

  const rootLabels = labels.filter(label => !label.parentId);
  const getChildLabels = (parentId: string) => 
    labels.filter(label => label.parentId === parentId);

  const renderLabelTree = (label: any, depth = 0) => (
    <div key={label.id} className={`ml-${depth * 4}`}>
      <div className="label-item flex items-center justify-between p-3 border rounded-lg mb-2 bg-card">
        <div className="flex items-center gap-3">
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
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingLabel(label.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteLabel(label.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {getChildLabels(label.id).map(child => 
        renderLabelTree(child, depth + 1)
      )}
    </div>
  );

  return (
    <Card className="w-full fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Gestione Etichette
          </CardTitle>
          
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
                          newLabel.color === color ? 'border-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewLabel(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Etichetta Genitore</Label>
                  <Select
                    value={newLabel.parentId}
                    onValueChange={(value) => setNewLabel(prev => ({ ...prev, parentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona etichetta genitore (opzionale)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuna (radice)</SelectItem>
                      {labels.map(label => (
                        <SelectItem key={label.id} value={label.id}>
                          {label.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
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
        </div>
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
            {rootLabels.map(label => renderLabelTree(label))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabelManager;

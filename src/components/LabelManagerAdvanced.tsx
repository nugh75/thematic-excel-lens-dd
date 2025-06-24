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
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Merge, Trash2, Tag, Save, X, Search, Filter } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import { TAG_PREDEFINITI } from '../types/analysis';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');
  
  const [newLabel, setNewLabel] = useState({
    name: '',
    description: '',
    color: colors[0],
    tags: [] as string[],
  });
  
  const [editLabel, setEditLabel] = useState({
    name: '',
    description: '',
    color: colors[0],
    tags: [] as string[],
  });

  const labelStats = getLabelStats();

  // Filtra le etichette in base al termine di ricerca e tag
  const filteredLabels = labels.filter(label => {
    const matchesSearch = label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (label.description && label.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTagFilter || selectedTagFilter === "all" || 
      (label.tags && label.tags.includes(selectedTagFilter));
    
    return matchesSearch && matchesTag;
  });

  // Funzione per evidenziare i termini di ricerca
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) {
      return text;
    }
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Funzioni per gestire i tag
  const handleTagToggle = (tag: string, isNew: boolean = false) => {
    const currentTags = isNew ? newLabel.tags : editLabel.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    if (isNew) {
      setNewLabel(prev => ({ ...prev, tags: newTags }));
    } else {
      setEditLabel(prev => ({ ...prev, tags: newTags }));
    }
  };

  // Ottieni tutti i tag unici utilizzati
  const usedTags = Array.from(new Set(labels.flatMap(label => label.tags || [])));

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
      tags: newLabel.tags,
    });

    setNewLabel({ name: '', description: '', color: colors[0], tags: [] });
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
        tags: label.tags || [],
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
      tags: editLabel.tags,
    });

    setEditingLabel(null);
    setEditLabel({ name: '', description: '', color: colors[0], tags: [] });
    
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
                  
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Crea Nuova Etichetta</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome *</Label>
                          <Input
                            id="name"
                            value={newLabel.name}
                            onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nome dell'etichetta"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Colore</Label>
                          <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                            {colors.map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                                  newLabel.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setNewLabel(prev => ({ ...prev, color }))}
                                title={`Colore ${color}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrizione</Label>
                        <Textarea
                          id="description"
                          value={newLabel.description}
                          onChange={(e) => setNewLabel(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrizione opzionale dell'etichetta (es. quando utilizzarla, criteri di applicazione...)"
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      
                      {/* Sezione Tag */}
                      <div className="space-y-3">
                        <Label>Categorie / Tag</Label>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Seleziona le categorie che descrivono meglio questa etichetta:
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {TAG_PREDEFINITI.map(tag => (
                              <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`new-tag-${tag}`}
                                  checked={newLabel.tags.includes(tag)}
                                  onCheckedChange={() => handleTagToggle(tag, true)}
                                />
                                <Label 
                                  htmlFor={`new-tag-${tag}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {tag}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {newLabel.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {newLabel.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleCreateLabel} className="flex-1" size="lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Crea Etichetta
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreating(false)}
                          className="flex-1"
                          size="lg"
                        >
                          <X className="h-4 w-4 mr-2" />
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
      
      <CardContent className="p-6">
        {labels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nessuna etichetta creata ancora</h3>
            <p className="text-sm mb-4">Inizia creando la tua prima etichetta per categorizzare i dati</p>
            <Button onClick={() => setIsCreating(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Crea Prima Etichetta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header con statistiche e ricerca */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{labels.length}</span> etichette totali
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {Object.values(labelStats).reduce((a, b) => a + b, 0)}
                    </span> applicazioni totali
                  </div>
                  {searchTerm && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{filteredLabels.length}</span> risultati
                    </div>
                  )}
                </div>
              </div>

              {/* Barra di ricerca e filtri - visibili solo se ci sono più di 5 etichette */}
              {labels.length > 5 && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca etichette per nome o descrizione..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Filtro per tag */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedTagFilter || ""} onValueChange={(value) => setSelectedTagFilter(value || "")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtra per categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="all" value="all">Tutte le categorie</SelectItem>
                        {TAG_PREDEFINITI.map(tag => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTagFilter && selectedTagFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTagFilter('all')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Container con scroll per le etichette */}
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-3">
                {filteredLabels.length === 0 && searchTerm ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Nessun risultato trovato</p>
                    <p className="text-sm">Prova con termini di ricerca diversi</p>
                  </div>
                ) : (
                  filteredLabels.map(label => (
                <div key={label.id} className="group p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {isMerging && (
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedLabelsForMerge.includes(label.id)}
                            onCheckedChange={() => toggleLabelForMerge(label.id)}
                          />
                        </div>
                      )}
                      
                      <div className="flex-shrink-0 pt-1">
                        <div 
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                          style={{ backgroundColor: label.color }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium break-words" title={label.name}>
                            {highlightSearchTerm(label.name, searchTerm)}
                          </h4>
                          <Badge variant="secondary" className="shrink-0">
                            {labelStats[label.id] || 0} {(labelStats[label.id] || 0) === 1 ? 'cella' : 'celle'}
                          </Badge>
                        </div>
                        
                        {label.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                            {highlightSearchTerm(label.description, searchTerm)}
                          </p>
                        )}
                        
                        {/* Visualizzazione tag */}
                        {label.tags && label.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {label.tags.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="text-xs px-2 py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isMerging && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLabel(label.id)}
                          className="hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Elimina Etichetta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare l'etichetta <strong>"{label.name}"</strong>? 
                                <br/><br/>
                                Questa azione:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>Rimuoverà l'etichetta da tutte le {labelStats[label.id] || 0} celle associate</li>
                                  <li>Non può essere annullata</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteLabel(label.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Elimina Definitivamente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))
                )}
              </div>
            </ScrollArea>

            {/* Footer con azioni rapide se non in modalità merge */}
            {!isMerging && labels.length > 5 && (
              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Gestisci facilmente le tue {labels.length} etichette
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Nuova
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsMerging(true)}>
                    <Merge className="h-4 w-4 mr-1" />
                    Unisci
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Dialog per modifica etichetta */}
      <Dialog open={editingLabel !== null} onOpenChange={(open) => !open && setEditingLabel(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Etichetta</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editLabel.name}
                  onChange={(e) => setEditLabel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome dell'etichetta"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Colore</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                        editLabel.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditLabel(prev => ({ ...prev, color }))}
                      title={`Colore ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrizione</Label>
              <Textarea
                id="edit-description"
                value={editLabel.description}
                onChange={(e) => setEditLabel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione opzionale dell'etichetta (es. quando utilizzarla, criteri di applicazione...)"
                className="min-h-[80px] resize-none"
              />
            </div>
            
            {/* Sezione Tag */}
            <div className="space-y-3">
              <Label>Categorie / Tag</Label>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Seleziona le categorie che descrivono meglio questa etichetta:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TAG_PREDEFINITI.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-tag-${tag}`}
                        checked={editLabel.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag, false)}
                      />
                      <Label 
                        htmlFor={`edit-tag-${tag}`}
                        className="text-sm cursor-pointer"
                      >
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
                {editLabel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editLabel.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleUpdateLabel} className="flex-1" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Salva Modifiche
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingLabel(null)}
                className="flex-1"
                size="lg"
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

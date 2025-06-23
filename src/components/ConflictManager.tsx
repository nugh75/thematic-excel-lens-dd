
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Merge } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';

const ConflictManager = () => {
  const { getConflicts, users, labels } = useAnalysisStore();
  const conflicts = getConflicts();

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Utente sconosciuto';
  };

  const getLabelName = (labelId: string) => {
    return labels.find(l => l.id === labelId)?.name || 'Etichetta sconosciuta';
  };

  if (conflicts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Merge className="h-6 w-6 text-primary" />
            Gestione Conflitti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Merge className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun conflitto rilevato</p>
            <p className="text-sm">Tutti gli utenti sono d'accordo sulle etichette</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          Gestione Conflitti
          <Badge variant="destructive">{conflicts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conflicts.map((conflict, index) => (
            <div key={index} className="border rounded-lg p-4 bg-orange-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-orange-900">
                    Conflitto {conflict.cellId ? 'Cella' : 'Riga'} {conflict.cellId || conflict.rowIndex}
                  </h4>
                  <p className="text-sm text-orange-700">
                    {conflict.conflictingLabels.length} utenti hanno etichette diverse
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Merge className="h-4 w-4 mr-2" />
                  Risolvi
                </Button>
              </div>
              
              <div className="space-y-2">
                {conflict.conflictingLabels.map((userLabels, userIndex) => (
                  <div key={userIndex} className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getUserName(userLabels.userId)}:</span>
                    <div className="flex gap-1">
                      {userLabels.labelIds.map(labelId => (
                        <Badge key={labelId} variant="secondary">
                          {getLabelName(labelId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConflictManager;

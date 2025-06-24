import React from 'react';
import NavigationHeader from '../components/NavigationHeader';
import ColumnConfiguration from '../components/ColumnConfiguration';

/**
 * Pagina di configurazione delle colonne
 * - HUB unificato per tutte le classificazioni
 * - Sostituisce la gestione etichette sparsa tra vari componenti
 * - Sistema gerarchico unificato: anagrafica/non_anagrafica → chiusa/aperta → categorie
 */
export default function Configuration() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurazione Colonne
          </h1>
          <p className="text-gray-600">
            Gestisci e classifica le colonne del tuo dataset secondo uno schema gerarchico unificato.
            Puoi lavorare su singole colonne o utilizzare la modalità batch per classificazioni multiple.
          </p>
        </div>
        
        <ColumnConfiguration />
      </div>
    </div>
  );
}

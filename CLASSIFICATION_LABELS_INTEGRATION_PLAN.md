# Piano di Integrazione Etichette di Classificazione

## Obiettivo
Integrare le etichette di classificazione delle colonne nelle viste dati per migliorare l'usabilità e la comprensione del dataset.

## 📋 FASE 1: Analisi Componenti Target
- [x] Identificare i componenti da modificare
- [ ] `DataViewSelector.tsx` - Menu a tendina vista singola colonna
- [ ] `DataGrid.tsx` - Griglia dati principale
- [ ] `ColumnSelector.tsx` - Selettore colonne
- [ ] `CellNavigator.tsx` - Navigazione celle

## 📋 FASE 2: Utility Functions
- [x] Creare `utils/classificationDisplay.ts` con:
  - [x] `getClassificationBadgeColor()` - Colori per tipo classificazione
  - [x] `getClassificationIcon()` - Icone per tipo classificazione
  - [x] `formatClassificationLabel()` - Formattazione etichette
  - [x] `getClassificationTooltip()` - Tooltip informativi
- [x] Creare `components/ui/ClassificationBadge.tsx` - Componente badge riutilizzabile

## 📋 FASE 3: DataViewSelector Enhancement
- [x] ~~Aggiungere filtro per tipo classificazione~~ (Implementato nel SingleColumnView)
- [x] ~~Mostrare etichetta classificazione nel dropdown~~ (Implementato nel SingleColumnView)
- [x] ~~Raggruppare colonne per tipo classificazione~~ (Implementato nel SingleColumnView)
- [x] Aggiungere ricerca per nome e classificazione (Implementato nel SingleColumnView)

### Struttura proposta:
```typescript
interface EnhancedColumnOption {
  index: number;
  name: string;
  classification?: ColumnClassification;
  displayText: string;
  group: string; // 'Anagrafica', 'Non anagrafica', 'Non classificata'
}
```

## 📋 FASE 4: DataGrid Header Enhancement
- [x] Aggiungere badge classificazione negli header
- [x] Implementare tooltip con dettagli completi (tramite ClassificationBadge)
- [x] Aggiungere toggle per mostrare/nascondere etichette
- [x] Codifica colori implementata (nelle utilities)

## 📋 FASE 5: Statistiche e Filtri
- [x] Contatore colonne per tipo classificazione
- [x] Filtro rapido per nascondere/mostrare tipi
- [x] Indicatore stato di completamento classificazione
- [x] Creato componente `ClassificationStats.tsx`

## 📋 FASE 6: UX Improvements
- [x] Icone distintive per ogni tipo (implementate nelle utilities)
- [ ] Ricerca intelligente cross-component
- [ ] Stato persistente dei filtri

## 📋 FASE 7: Testing & Validation
- [ ] Test funzionale con file Excel reale
- [ ] Verifica performance con molte colonne
- [ ] Test responsive design
- [ ] Validazione accessibility

## 🎯 Priorità Implementazione
1. **ALTA**: DataViewSelector con etichette e filtri
2. **ALTA**: DataGrid header con badge e tooltip
3. **MEDIA**: Statistiche e contatori
4. **BASSA**: Filtri avanzati e ricerca intelligente

## 📂 File da Creare/Modificare
### Nuovi file:
- `src/utils/classificationDisplay.ts`
- `src/components/ui/ClassificationBadge.tsx`
- `src/components/ui/ClassificationFilter.tsx`

### File da modificare:
- `src/components/DataViewSelector.tsx`
- `src/components/DataGrid.tsx`
- `src/components/ColumnSelector.tsx`
- `src/types/analysis.ts` (se necessario)

## 🔄 Processo di Implementazione
1. Creare utilities e componenti base
2. Modificare DataViewSelector per primo test
3. Implementare DataGrid headers
4. Aggiungere filtri e statistiche
5. Test e rifinitura

## ✅ Criteri di Successo
- [ ] Etichette visibili in tutti i menu di selezione colonne
- [ ] Badge colorati negli header della griglia
- [ ] Filtri funzionanti per tipo classificazione
- [ ] Tooltip informativi e dettagliati
- [ ] Performance mantenuta con datasets grandi
- [ ] UI consistente e intuitiva

---
*Ultima modifica: 24 giugno 2025*

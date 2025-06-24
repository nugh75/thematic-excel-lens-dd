import { ColumnClassification } from '../types/analysis';

/**
 * Utility functions per la visualizzazione delle classificazioni delle colonne
 */

// Colori per i badge delle classificazioni
export const getClassificationBadgeColor = (type: string): string => {
  switch (type) {
    case 'anagrafica':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'non_anagrafica':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'non_classificata':
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Icone per i tipi di classificazione
export const getClassificationIcon = (type: string): string => {
  switch (type) {
    case 'anagrafica':
      return '👤';
    case 'non_anagrafica':
      return '📊';
    case 'non_classificata':
    default:
      return '❓';
  }
};

// Formattazione etichette per display compatto
export const formatClassificationLabel = (classification: ColumnClassification): string => {
  if (!classification || classification.type === 'non_classificata') {
    return 'Non classificata';
  }

  let label = classification.type === 'anagrafica' ? 'Ana' : 'Non-Ana';
  
  if (classification.subtype) {
    label += ` • ${classification.subtype === 'chiusa' ? 'Ch' : 'Ap'}`;
  }
  
  if (classification.category) {
    const categoryLabel = classification.category.replace('_', ' ');
    // Tronca se troppo lungo
    const truncated = categoryLabel.length > 15 
      ? categoryLabel.substring(0, 12) + '...' 
      : categoryLabel;
    label += ` • ${truncated}`;
  }
  
  return label;
};

// Formattazione etichette per display completo (usato in vista singola)
export const formatClassificationLabelFull = (classification: ColumnClassification): string => {
  if (!classification || classification.type === 'non_classificata') {
    return 'Non classificata';
  }

  let text = classification.type.replace('_', ' ').charAt(0).toUpperCase() + classification.type.slice(1);
  
  if (classification.subtype) {
    text += ` > ${classification.subtype.charAt(0).toUpperCase() + classification.subtype.slice(1)}`;
  }
  
  if (classification.category) {
    text += ` > ${classification.category.replace('_', ' ')}`;
  }
  
  return text;
};

// Formattazione completa per tooltip
export const getClassificationTooltip = (classification: ColumnClassification): string => {
  if (!classification || classification.type === 'non_classificata') {
    return 'Colonna non ancora classificata';
  }

  let tooltip = `Tipo: ${classification.type.replace('_', ' ').charAt(0).toUpperCase() + classification.type.slice(1)}`;
  
  if (classification.subtype) {
    tooltip += `\nSottotipo: ${classification.subtype.charAt(0).toUpperCase() + classification.subtype.slice(1)}`;
  }
  
  if (classification.category) {
    tooltip += `\nCategoria: ${classification.category.replace('_', ' ')}`;
  }
  
  if (classification.confidence !== undefined) {
    tooltip += `\nConfidenza: ${Math.round(classification.confidence * 100)}%`;
  }
  
  if (classification.aiGenerated) {
    tooltip += '\n🤖 Generato automaticamente dall\'AI';
  }
  
  return tooltip;
};

// Raggruppa colonne per tipo di classificazione
export const groupColumnsByClassification = (columns: Array<{ index: number, name: string, classification?: ColumnClassification }>) => {
  const groups = {
    anagrafica: [] as typeof columns,
    non_anagrafica: [] as typeof columns,
    non_classificata: [] as typeof columns
  };

  columns.forEach(column => {
    const type = column.classification?.type || 'non_classificata';
    groups[type as keyof typeof groups].push(column);
  });

  return groups;
};

// Statistiche di classificazione
export const getClassificationStats = (columns: Array<{ classification?: ColumnClassification }>) => {
  const stats = {
    anagrafica: 0,
    non_anagrafica: 0,
    non_classificata: 0,
    total: columns.length,
    completionPercentage: 0
  };

  columns.forEach(column => {
    const type = column.classification?.type || 'non_classificata';
    stats[type as keyof Omit<typeof stats, 'total' | 'completionPercentage'>]++;
  });

  const classified = stats.anagrafica + stats.non_anagrafica;
  stats.completionPercentage = stats.total > 0 ? Math.round((classified / stats.total) * 100) : 0;

  return stats;
};

// Statistiche di classificazione dettagliate
export const getDetailedClassificationStats = (columns: Array<{ index: number, name: string, classification?: ColumnClassification }>) => {
  const stats = {
    anagrafica: {
      total: 0,
      chiusa: 0,
      aperta: 0,
      categories: {} as Record<string, number>
    },
    non_anagrafica: {
      total: 0,
      chiusa: 0,
      aperta: 0,
      categories: {} as Record<string, number>
    },
    non_classificata: {
      total: 0
    }
  };

  columns.forEach(column => {
    const classification = column.classification;
    if (!classification || classification.type === 'non_classificata') {
      stats.non_classificata.total++;
      return;
    }

    const type = classification.type as 'anagrafica' | 'non_anagrafica';
    stats[type].total++;
    
    if (classification.subtype) {
      if (classification.subtype === 'chiusa') {
        stats[type].chiusa++;
      } else if (classification.subtype === 'aperta') {
        stats[type].aperta++;
      }
    }
    
    if (classification.category) {
      if (!stats[type].categories[classification.category]) {
        stats[type].categories[classification.category] = 0;
      }
      stats[type].categories[classification.category]++;
    }
  });

  return stats;
};

// Filtri per tipo di classificazione
export const filterColumnsByClassification = (
  columns: Array<{ index: number, name: string, classification?: ColumnClassification }>,
  filterType: 'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata' = 'all'
) => {
  if (filterType === 'all') return columns;
  
  return columns.filter(column => {
    const type = column.classification?.type || 'non_classificata';
    return type === filterType;
  });
};

// Filtro avanzato per classificazioni
export const filterColumnsByDetailedClassification = (
  columns: Array<{ index: number, name: string, classification?: ColumnClassification }>, 
  filterType: 'all' | 'anagrafica' | 'non_anagrafica' | 'non_classificata',
  filterSubtype?: 'all' | 'chiusa' | 'aperta',
  filterCategory?: string
) => {
  return columns.filter(column => {
    const classification = column.classification;
    
    // Filtro per tipo principale
    if (filterType !== 'all') {
      const type = classification?.type || 'non_classificata';
      if (type !== filterType) {
        return false;
      }
    }
    
    // Filtro per sottotipo (solo se il tipo principale non è 'non_classificata')
    if (filterSubtype && filterSubtype !== 'all' && classification && classification.type !== 'non_classificata') {
      if (classification.subtype !== filterSubtype) {
        return false;
      }
    }
    
    // Filtro per categoria
    if (filterCategory && classification) {
      if (classification.category !== filterCategory) {
        return false;
      }
    }
    
    return true;
  });
};

// Ricerca nelle classificazioni
export const searchInClassifications = (
  columns: Array<{ index: number, name: string, classification?: ColumnClassification }>,
  searchTerm: string
) => {
  if (!searchTerm.trim()) return columns;
  
  const term = searchTerm.toLowerCase().trim();
  
  return columns.filter(column => {
    // Ricerca nel nome della colonna
    if (column.name.toLowerCase().includes(term)) {
      return true;
    }
    
    // Ricerca nelle classificazioni
    if (column.classification) {
      const classification = column.classification;
      
      // Ricerca nel tipo
      if (classification.type.toLowerCase().includes(term)) {
        return true;
      }
      
      // Ricerca nel sottotipo
      if (classification.subtype && classification.subtype.toLowerCase().includes(term)) {
        return true;
      }
      
      // Ricerca nella categoria
      if (classification.category && classification.category.toLowerCase().includes(term)) {
        return true;
      }
    }
    
    return false;
  });
};

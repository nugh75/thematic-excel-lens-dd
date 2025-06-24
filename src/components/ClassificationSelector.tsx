import React, { useState, useEffect } from 'react';
import { ColumnClassification } from '../types/analysis';
import { getCategoryGroups, filterCategoryGroups } from '../utils/classificationCategories';

interface ClassificationSelectorProps {
  classification: ColumnClassification;
  onChange: (classification: ColumnClassification) => void;
}

export const ClassificationSelector: React.FC<ClassificationSelectorProps> = ({ 
  classification, 
  onChange 
}) => {
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset custom input when classification type or subtype changes
  useEffect(() => {
    setShowCustomInput(false);
    setCustomCategory('');
    setSearchTerm('');
  }, [classification.type, classification.subtype]);

  // Ottieni le categorie appropriate utilizzando la funzione condivisa
  const getFilteredCategories = () => {
    if (!classification.type || classification.type === 'non_classificata' || !classification.subtype) {
      return [];
    }
    
    const groups = getCategoryGroups(classification.type, classification.subtype);
    return filterCategoryGroups(groups, searchTerm);
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      onChange({ 
        ...classification, 
        category: null
      });
    } else {
      setShowCustomInput(false);
      setCustomCategory('');
      onChange({ 
        ...classification, 
        category: value || null
      });
    }
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      onChange({ 
        ...classification, 
        category: customCategory.trim()
      });
      setShowCustomInput(false);
      setCustomCategory('');
    }
  };

  const handleCustomCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomCategorySubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomCategory('');
    }
  };

  const filteredGroups = getFilteredCategories();

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo Principale
        </label>
        <select
          value={classification.type}
          onChange={(e) => onChange({ 
            ...classification, 
            type: e.target.value as any,
            subtype: null,
            category: null
          })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="non_classificata">Non classificata</option>
          <option value="anagrafica">Anagrafica</option>
          <option value="non_anagrafica">Non anagrafica</option>
        </select>
      </div>

      {classification.type !== 'non_classificata' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sottotipo
          </label>
          <select
            value={classification.subtype || ''}        onChange={(e) => onChange({ 
          ...classification, 
          subtype: (e.target.value as 'chiusa' | 'aperta') || null,
          category: null
        })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona sottotipo</option>
            <option value="chiusa">Chiusa (lista predefinita)</option>
            <option value="aperta">Aperta (testo libero)</option>
          </select>
        </div>
      )}

      {classification.subtype && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria Specifica
          </label>
          
          {/* Campo di ricerca */}
          <input
            type="text"
            placeholder="Cerca categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <select
            value={showCustomInput ? 'custom' : classification.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-48 overflow-y-auto"
            size={Math.min(8, filteredGroups.reduce((acc, group) => acc + group.categories.length + 1, 1))}
          >
            <option value="">Seleziona categoria</option>
            {filteredGroups.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </optgroup>
            ))}
            <option value="custom">➕ Categoria personalizzata...</option>
          </select>
          
          {showCustomInput && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={handleCustomCategoryKeyPress}
                placeholder="Inserisci nome categoria personalizzata..."
                className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCustomCategorySubmit}
                  disabled={!customCategory.trim()}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Conferma
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  Annulla
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Premi Invio per confermare, Esc per annullare
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

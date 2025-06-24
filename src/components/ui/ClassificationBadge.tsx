import React from 'react';
import { Badge } from './badge';
import { ColumnClassification } from '../../types/analysis';
import { 
  getClassificationBadgeColor, 
  getClassificationIcon, 
  formatClassificationLabel,
  formatClassificationLabelFull,
  getClassificationTooltip 
} from '../../utils/classificationDisplay';

interface ClassificationBadgeProps {
  classification?: ColumnClassification;
  variant?: 'default' | 'compact' | 'icon-only';
  showTooltip?: boolean;
  className?: string;
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  classification,
  variant = 'default',
  showTooltip = true,
  className = ''
}) => {
  if (!classification) {
    return (
      <Badge 
        className={`${getClassificationBadgeColor('non_classificata')} ${className}`}
        title={showTooltip ? 'Non classificata' : undefined}
      >
        {variant !== 'icon-only' && (
          <>
            {getClassificationIcon('non_classificata')} 
            {variant === 'default' && ' Non classificata'}
            {variant === 'compact' && ' N/C'}
          </>
        )}
        {variant === 'icon-only' && getClassificationIcon('non_classificata')}
      </Badge>
    );
  }

  const colorClass = getClassificationBadgeColor(classification.type);
  const icon = getClassificationIcon(classification.type);
  const tooltip = showTooltip ? getClassificationTooltip(classification) : undefined;

  let label = '';
  switch (variant) {
    case 'default':
      label = formatClassificationLabelFull(classification);
      break;
    case 'compact':
      label = classification.type === 'anagrafica' ? 'Ana' : 
             classification.type === 'non_anagrafica' ? 'Non-Ana' : 'N/C';
      break;
    case 'icon-only':
      label = '';
      break;
  }

  return (
    <Badge 
      className={`${colorClass} ${className}`}
      title={tooltip}
    >
      {variant !== 'icon-only' && (
        <>
          {icon} {label}
        </>
      )}
      {variant === 'icon-only' && icon}
    </Badge>
  );
};

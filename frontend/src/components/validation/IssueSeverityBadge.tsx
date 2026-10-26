import React from 'react';
import { IssueSeverity } from '@/types/validation';

const SEVERITY_CONFIG: Record<IssueSeverity, { bg: string; text: string; label: string; border: string }> = {
  BLOCK: { bg: 'bg-red-950', text: 'text-red-400', label: 'BLOCK', border: 'border-red-800' },
  CRITICAL: { bg: 'bg-rose-900', text: 'text-rose-300', label: 'CRITICAL', border: 'border-rose-700' },
  ERROR: { bg: 'bg-amber-950', text: 'text-amber-400', label: 'ERROR', border: 'border-amber-800' },
  WARN: { bg: 'bg-yellow-950', text: 'text-yellow-400', label: 'WARN', border: 'border-yellow-800' },
  FLAG: { bg: 'bg-purple-950', text: 'text-purple-300', label: 'FLAG', border: 'border-purple-800' },
};

export const IssueSeverityBadge: React.FC<{ severity: IssueSeverity }> = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.ERROR;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

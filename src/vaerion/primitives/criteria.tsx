'use client';

/**
 * Vaerion — Primitive / Criteria Bar
 *
 * Filters render as formula: `field operator value` tokens joined by
 * registered conjunctions, editable in place. Filters are visible logic, not
 * hidden dropdown states (VS §5).
 *
 * List surfaces bind the Criteria Bar (Constitution 4.4): any surface
 * rendering a filterable set — Ledger, Audit, Verification queue, Search,
 * admin logs — must own its filters through the Criteria Bar; ad-hoc filter
 * controls are prohibited.
 */

import { useState } from 'react';
import { definePrimitive } from './contract';

export type CriteriaOperator = '=' | '!=' | '<' | '>' | '<=' | '>=' | 'in' | 'range';
export type CriteriaConjunction = 'AND' | 'OR';

export interface Criterion {
  field: string;
  operator: CriteriaOperator;
  value: string;
  conjunction?: CriteriaConjunction;
}

export const CRITERIA_BAR_METADATA = definePrimitive({
  name: 'Criteria Bar',
  constitutionClause: '3.0',
  visualSystemSections: ['5'],
  bound: false,
  contract: {
    responsibility: 'Owning list-surface filters as visible formula — field operator value tokens joined by conjunctions, editable in place.',
    boundaries: [
      'filters are visible logic, not hidden dropdown states (VS §5)',
      'no surface invents filter grammar (4.7)',
      'ad-hoc filter controls are prohibited on list surfaces (4.4)',
    ],
    extension: 'operators arrive from governance with the Range Grammar (VS §6.6)',
    composition: 'owned by Ledger, Audit, Verification queue, Search, admin logs (4.4); sticky on the Ledger (4.6)',
  },
  tokens: ['color.ink.16', 'color.ink.32', 'shape.radius.2', 'space.touchMinimum', 'type.voice.machine'],
  states: [],
  accessibility: {
    announcement: 'the formula is announced as logic — field, operator, value, conjunction (Art. I: no borrowed idiom)',
    keyboard: 'each token is reachable and editable in place; Enter commits (6.7)',
    sensory: 'formula tokens are hairline-framed — structure, not decoration',
  },
  citations: [],
});

export function CriteriaBar({
  criteria,
  onChange,
  ariaLabel = 'criteria bar',
}: {
  criteria: readonly Criterion[];
  onChange: (next: readonly Criterion[]) => void;
  ariaLabel?: string;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  const commit = (index: number) => {
    const value = draft.trim();
    const next = [...criteria];
    if (value === '') {
      next.splice(index, 1);
    } else {
      next[index] = { ...next[index], value };
    }
    onChange(next);
    setEditing(null);
    setDraft('');
  };

  return (
    <div className="vx-criteria vx-machine" role="group" aria-label={ariaLabel}>
      {criteria.map((criterion, index) => {
        const isEditing = editing === index;
        return (
          <span key={`${criterion.field}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--vx-space-2)' }}>
            {index > 0 ? <span className="vx-micro">{criterion.conjunction ?? 'AND'}</span> : null}
            {isEditing ? (
              <span className="vx-criteria-token" style={{ cursor: 'text' }}>
                <span>{criterion.field}</span>
                <span>{criterion.operator}</span>
                <input
                  className="vx-criteria-input"
                  autoFocus
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={() => commit(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commit(index);
                    if (event.key === 'Escape') {
                      setEditing(null);
                      setDraft('');
                    }
                  }}
                  aria-label={`${criterion.field} ${criterion.operator} — edit value`}
                />
              </span>
            ) : (
              <button
                type="button"
                className="vx-criteria-token"
                onClick={() => {
                  setEditing(index);
                  setDraft(criterion.value);
                }}
                aria-label={`criterion ${criterion.field} ${criterion.operator} ${criterion.value} — activate to edit`}
              >
                <span>{criterion.field}</span>
                <span style={{ opacity: 0.7 }}>{criterion.operator}</span>
                <span>{criterion.value}</span>
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

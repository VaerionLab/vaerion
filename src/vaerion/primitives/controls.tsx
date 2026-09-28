'use client';

/**
 * Vaerion — Primitives / Controls: Micro Label · Button · Field Frame
 *
 * Contracts:
 * - Micro Label — the registered caps treatment; the only caps on instrument
 *   surfaces (VS §2.4); Machine Voice.
 * - Button (Constitution 3.5 [VS §5.7]) — Responsibility: initiating a named
 *   command (Part VI). Boundaries: control states use ink, never verdict
 *   color; destructive coloration appears only at the confirmation step; it
 *   must not imply consequences it does not name — a consequential button
 *   names its consequence. Extension: hierarchy is fixed at Primary,
 *   Secondary, Ghost (Quiet), Control; new levels require amendment.
 * - Field Frame / Input (Constitution 3.6 [VS §5.8]) — Responsibility:
 *   bounded value entry with a persistent machine-voice label at the frame's
 *   top-left. Boundaries: placeholder-as-label is prohibited; validation
 *   speaks verdict language through the Seal grammar; no success/warning/
 *   error colorations outside verdict semantics.
 *
 * Accessibility: every command is keyboard-reachable (6.7); labels never
 * disappear (VS §5.8); touch targets meet the registered minimum (VS §9).
 */

import { useId, type ReactNode } from 'react';
import { definePrimitive } from './contract';

/* ── Micro Label ──────────────────────────────────────────────────────────── */

export const MICRO_LABEL_METADATA = definePrimitive({
  name: 'Micro Label',
  constitutionClause: '3.0',
  visualSystemSections: ['2.4', '5'],
  bound: false,
  contract: {
    responsibility: 'Rendering a registered micro-label in the Machine Voice — the only caps on instrument surfaces.',
    boundaries: ['no body copy in caps (VS §2.4)', 'no Human Voice in a micro-label'],
    extension: 'labels are registered with their meaning (VS §8 dual naming discipline)',
    composition: 'sets into Field Frames, id strips, stamps, seals, table headers',
  },
  tokens: ['type.voice.machine', 'type.leading.machine', 'type.numeric.tabular'],
  states: [],
  accessibility: {
    announcement: 'text is rendered as written; caps are presentational',
    keyboard: 'n/a — non-interactive',
    sensory: 'Machine Voice is visually distinct from the Human Voice (VS §2.1)',
  },
  citations: [],
});

export function MicroLabel({ children }: { children: ReactNode }) {
  return <span className="vx-micro">{children}</span>;
}

/* ── Button ───────────────────────────────────────────────────────────────── */

export type ButtonHierarchy = 'primary' | 'secondary' | 'quiet' | 'control';

export const BUTTON_METADATA = definePrimitive({
  name: 'Button',
  constitutionClause: '3.5',
  visualSystemSections: ['5.7', '5.8'],
  bound: true,
  contract: {
    responsibility: 'Initiating a named command (Part VI).',
    boundaries: [
      'control states use ink, never verdict color (Constitution 3.5)',
      'destructive coloration appears only at the confirmation step (Constitution 3.5)',
      'must not imply consequences it does not name — a consequential button names its consequence (VS §5.8)',
      'never a verdict indicator (Constitution 3.5)',
    ],
    extension: 'hierarchy is fixed at Primary, Secondary, Ghost (Quiet), Control; new hierarchy levels require amendment (Constitution 3.5)',
    composition: 'within toolbars, forms, dialogs, ceremony flows',
  },
  tokens: ['shape.radius.4', 'space.touchMinimum', 'color.ink.100', 'color.ink.32', 'color.ink.16', 'color.ground', 'color.verdict.failed'],
  states: ['idle', 'loading', 'error'],
  accessibility: {
    announcement: 'the accessible name is the named consequence of the command (VS §5.8)',
    keyboard: 'Enter/Space activate; focus visible per the brass-ring contract (6.8)',
    sensory: 'press acknowledgment within the 100 ms bound (VS §10)',
  },
  citations: [],
});

export interface ButtonProps {
  hierarchy?: ButtonHierarchy;
  destructive?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  /** Accessible name; defaults to the button text. */
  ariaLabel?: string;
  className?: string;
}

export function Button({
  hierarchy = 'secondary',
  destructive = false,
  type = 'button',
  disabled,
  onClick,
  children,
  ariaLabel,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`vx-button${className ? ` ${className}` : ''}`}
      data-hierarchy={hierarchy}
      data-destructive={destructive ? 'true' : undefined}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

/* ── Field Frame ──────────────────────────────────────────────────────────── */

export const FIELD_FRAME_METADATA = definePrimitive({
  name: 'Input (Field Frame)',
  constitutionClause: '3.6',
  visualSystemSections: ['5.8'],
  bound: true,
  contract: {
    responsibility: 'Bounded value entry with a persistent machine-voice label at the frame top-left.',
    boundaries: [
      'placeholder-as-label is prohibited (Constitution 3.6)',
      'validation speaks verdict language through the Seal grammar (Constitution 3.6)',
      'no success, warning, or error colorations outside verdict semantics (Constitution 3.6)',
    ],
    extension: 'new field types are added only through governance with a stated validation contract (Constitution 3.6)',
    composition: 'forms follow declare-intent → provide → attest; the submit control names its consequence (Constitution 3.6)',
  },
  tokens: ['shape.radius.2', 'color.ink.32', 'color.ink.100', 'color.ground', 'space.touchMinimum'],
  states: ['idle', 'loading', 'error'],
  accessibility: {
    announcement: 'the label is a persistent <label>; the frame never loses its name',
    keyboard: 'standard text entry; focus visible (6.8)',
    sensory: 'the micro-label renders set into the top-left edge (VS §5.8)',
  },
  citations: [],
});

export interface FieldFrameProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Validation note rendered through the Seal grammar (verdict word + Seal-16). */
  note?: { verdict: 'verified' | 'unverified' | 'failed' | 'pending'; word: string };
  name?: string;
  inputClassName?: string;
  machine?: boolean;
}

export function FieldFrame({ label, value, onChange, placeholder, note, name, inputClassName, machine }: FieldFrameProps) {
  const id = useId();
  return (
    <span className="vx-field" style={{ display: 'block' }}>
      <label className="vx-field-label vx-micro" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className={`vx-field-input${machine ? ' vx-machine' : ''}${inputClassName ? ` ${inputClassName}` : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {note ? (
        <span className="vx-field-note">
          <span className={`vx-seal vx-seal-16`} data-verdict={note.verdict} role="status" aria-label={`${note.verdict}: ${note.word}`}>
            <span className="vx-seal-disc" aria-hidden="true" />
          </span>
          <span className="vx-micro">{note.word}</span>
        </span>
      ) : null}
    </span>
  );
}

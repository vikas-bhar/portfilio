import { FieldIssuesContext, fieldId } from './field-issues';
import { useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Trash2, X } from 'lucide-react';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  path?: string;
  help?: string;
  area?: boolean;
  rows?: number;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}
export function Field({
  label,
  value,
  onChange,
  path,
  help,
  area,
  rows = 3,
  type = 'text',
  maxLength,
  placeholder,
  required,
  autoComplete = 'off',
  disabled,
}: FieldProps) {
  const uniqueId = useId();
  const id = path ? fieldId(path) : uniqueId;
  const issues = useContext(FieldIssuesContext);
  const issue = path
    ? issues.find((issue) => issue.path === path || issue.path.startsWith(path + '.'))
    : undefined;
  const props = {
    id,
    name: path,
    value,
    maxLength,
    placeholder,
    required,
    autoComplete,
    disabled,
    'aria-invalid': issue ? (true as const) : undefined,
    'aria-describedby':
      [help ? `${id}-help` : '', issue ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
  };
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      {area ? <textarea {...props} rows={rows} /> : <input {...props} type={type} />}{' '}
      {help && (
        <p className="admin-field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      {issue && (
        <p className="admin-field-error" id={`${id}-error`}>
          {issue.message}
        </p>
      )}
    </div>
  );
}
export function LinesField({
  value,
  onChange,
  ...props
}: Omit<FieldProps, 'value' | 'onChange' | 'area'> & {
  value: readonly string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <Field
      {...props}
      value={value.join('\n')}
      onChange={(value) => onChange(value.split('\n'))}
      area
      help={props.help ?? 'One item per line. Empty lines are removed when you save.'}
    />
  );
}
export function CheckField({
  label,
  checked,
  onChange,
  help,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  help?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="admin-check">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        aria-describedby={help ? `${id}-help` : undefined}
      />
      <span>
        <label htmlFor={id}>{label}</label>
        {help && <small id={`${id}-help`}>{help}</small>}
      </span>
    </div>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
  path,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  path?: string;
  help?: string;
}) {
  const uniqueId = useId();
  const id = path ? fieldId(path) : uniqueId;
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={help ? `${id}-help` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help && (
        <p className="admin-field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
    </div>
  );
}
export function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function MoveButtons({
  index,
  length,
  label,
  onMove,
  onRemove,
  minIndex = 0,
}: {
  index: number;
  length: number;
  label: string;
  onMove: (direction: -1 | 1) => void;
  onRemove?: () => void;
  minIndex?: number;
}) {
  return (
    <div className="admin-item-actions">
      <button
        type="button"
        className="admin-icon-button"
        aria-label={`Move ${label} up`}
        disabled={index <= minIndex}
        onClick={() => onMove(-1)}
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        className="admin-icon-button"
        aria-label={`Move ${label} down`}
        disabled={index >= length - 1 || index < minIndex}
        onClick={() => onMove(1)}
      >
        <ArrowDown size={15} />
      </button>
      {onRemove && (
        <button
          type="button"
          className="admin-icon-button admin-danger-text"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  busy,
  danger,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="admin-dialog admin-app"
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <div className="admin-dialog-top">
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          className="admin-icon-button"
          aria-label="Close confirmation"
          disabled={busy}
          onClick={onCancel}
        >
          <X size={18} />
        </button>
      </div>
      <div className="admin-dialog-content">{children}</div>
      <div className="admin-dialog-actions">
        <button type="button" className="admin-button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={`admin-button ${danger ? 'admin-button-danger' : 'admin-button-primary'}`}
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

import { useId, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronRight, CircleAlert, Info, X } from 'lucide-react';
import type { ActivityItem, DataTableColumn } from './types';

export function Brand({ compact = false, tone }: { compact?: boolean; tone?: 'inverse' }) {
  return (
    <span className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}${tone === 'inverse' ? ' brand-lockup--inverse' : ''}`}>
      <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="1" y="1" width="38" height="38" rx="5" fill="currentColor" />
        <path d="M10 12h20M10 19h15M10 26h10" fill="none" stroke="#f7f8f4" strokeWidth="2.4" strokeLinecap="square" />
        <path d="M29 17v13" fill="none" stroke="#c9a56a" strokeWidth="2.4" strokeLinecap="square" />
      </svg>
      <span className="brand-wordmark"><strong>SUDHARSHAN</strong><span>APAAR RECORDS</span></span>
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </div>
  );
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) {
  return <span className={`status-badge status-badge--${tone}`}><span className="status-badge__dot" aria-hidden="true" />{children}</span>;
}

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon?: import('react').ElementType }) {
  return (
    <article className="stat-card">
      <div className="stat-card__top"><span>{label}</span>{Icon && <Icon size={17} strokeWidth={1.8} aria-hidden="true" />}</div>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__detail">{detail}</p>
    </article>
  );
}

export function Notice({
  children,
  tone = 'info',
  label,
}: {
  children: ReactNode;
  tone?: 'info' | 'warning' | 'success';
  label?: string;
}) {
  const Icon = tone === 'warning' ? CircleAlert : tone === 'success' ? Check : Info;
  return (
    <div className={`notice notice--${tone}`} role="note">
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      <div>{label && <strong>{label}</strong>}{children}</div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__mark" aria-hidden="true"><ArrowDown size={18} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  caption,
  emptyMessage = 'No matching demo records.',
}: {
  columns: DataTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  caption: string;
  emptyMessage?: string;
}) {
  return (
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="data-table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>
          ) : rows.map((row, index) => {
            const candidateKey = row.rowKey ?? row.id;
            const rowKey = typeof candidateKey === 'string' || typeof candidateKey === 'number' ? candidateKey : index;
            return (
              <tr key={rowKey}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  label = 'Search demo records',
  placeholder = 'Search by reference or programme',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="search-control">
      <label className="sr-only" htmlFor={id}>{label}</label>
      <FileSearchIcon />
      <input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button className="icon-button" type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={15} /></button>}
    </div>
  );
}

function FileSearchIcon() {
  return <span aria-hidden="true" className="search-control__icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8.8" cy="8.8" r="5.6"/><path d="m13 13 4 4"/></svg></span>;
}

export function FilterBar({ children, onSubmit }: { children: ReactNode; onSubmit?: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="filter-bar" onSubmit={(event) => { event.preventDefault(); onSubmit?.(event); }}>{children}</form>;
}

export function FormField({
  label,
  hint,
  error,
  type = 'text',
  name,
  autoComplete,
  required = false,
}: {
  label: string;
  hint?: string;
  error?: string;
  type?: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> <span className="required-marker">*</span></span>}</label>
      <input id={id} name={name} type={type} autoComplete={autoComplete} required={required} aria-invalid={Boolean(error)} aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined} />
      {hint && <p id={hintId} className="form-field__hint">{hint}</p>}
      {error && <p id={errorId} className="form-field__error" role="alert">{error}</p>}
    </div>
  );
}

export function SelectField({ label, name, options, defaultValue }: { label: string; name: string; options: Array<{ label: string; value: string }>; defaultValue?: string }) {
  const id = useId();
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select id={id} name={name} defaultValue={defaultValue ?? options[0]?.value}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronRight size={16} aria-hidden="true" />
      </div>
    </div>
  );
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="tabs" role="group" aria-label="Record views">
      {items.map((item) => <button key={item} type="button" aria-pressed={active === item} className={active === item ? 'tab tab--active' : 'tab'} onClick={() => onChange(item)}>{item}</button>)}
    </div>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  return (
    <nav className="pagination" aria-label="Table pages">
      <span>Page {page} of {pages}</span>
      <div>
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(Math.max(1, page - 1))}><ArrowLeft size={16} /></button>
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onChange(Math.min(pages, page + 1))}><ArrowRight size={16} /></button>
      </div>
    </nav>
  );
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="activity-timeline">
      {items.map((item) => {
        const Icon = item.icon ?? Info;
        return <li key={`${item.title}-${item.time}`}><span className="activity-timeline__icon"><Icon size={15} aria-hidden="true" /></span><div><strong>{item.title}</strong><p>{item.detail}</p><time>{item.time}</time></div></li>;
      })}
    </ol>
  );
}

export function AuditTimeline({ items }: { items: ActivityItem[] }) {
  return <div className="audit-timeline"><p className="eyebrow">DEMO AUDIT VIEW</p><ActivityTimeline items={items} /></div>;
}

export function QRPlaceholder() {
  return (
    <div className="qr-placeholder" role="img" aria-label="Illustrative QR placeholder. No scannable credential is issued">
      <div className="qr-grid" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
      <p>Illustrative placeholder</p>
      <small>No credential issued</small>
    </div>
  );
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-panel__header"><h2 id="modal-title">{title}</h2><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-panel__body">{children}</div>
      </section>
    </div>
  );
}

export function ConfirmationDialog({ open, title, description, onClose }: { open: boolean; title: string; description: string; onClose: () => void }) {
  return <Modal open={open} title={title} onClose={onClose}><p>{description}</p><div className="modal-panel__actions"><button className="button button--secondary" type="button" onClick={onClose}>Close</button></div></Modal>;
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner"><Brand compact /><p>Prototype interface for the SIH26263 concept. No production access is connected.</p>
        <nav aria-label="Footer"><a href="/about">About</a><a href="/security">Security</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a><a href="/cookies">Cookie Policy</a><a href="/contact">Contact</a><a href="/login">Login</a></nav>
      </div>
    </footer>
  );
}

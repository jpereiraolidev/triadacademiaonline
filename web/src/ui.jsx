import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertCircle, AlertTriangle, Loader2, Inbox } from 'lucide-react';
import { classNames } from './format';

// ============================================
// BUTTON
// ============================================
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  ...props
}) {
  const variants = {
    primary:   'bg-triad-700 hover:bg-triad-800 text-white',
    outline:   'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    ghost:     'bg-transparent hover:bg-gray-100 text-gray-600',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
    success:   'bg-triad-600 hover:bg-triad-700 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[13px] rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-5 py-3 text-[15px] rounded-lg gap-2',
  };

  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center font-semibold transition active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}

// ============================================
// INPUT
// ============================================
export function Input({ label, error, hint, icon: Icon, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        <input
          className={classNames(
            'w-full px-3 py-2.5 text-sm rounded-lg border bg-white transition focus:outline-none focus:ring-3',
            Icon && 'pl-10',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
              : 'border-gray-300 focus:border-triad-600 focus:ring-triad-600/15'
          )}
          {...props}
        />
      </div>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      {hint && !error && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

// ============================================
// SELECT
// ============================================
export function Select({ label, error, hint, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={classNames(
          'w-full px-3 py-2.5 text-sm rounded-lg border bg-white transition focus:outline-none focus:ring-3 cursor-pointer appearance-none',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-9',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
            : 'border-gray-300 focus:border-triad-600 focus:ring-triad-600/15'
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      {hint && !error && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

// ============================================
// TEXTAREA
// ============================================
export function Textarea({ label, error, hint, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={classNames(
          'w-full px-3 py-2.5 text-sm rounded-lg border bg-white transition focus:outline-none focus:ring-3 resize-y min-h-[100px]',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
            : 'border-gray-300 focus:border-triad-600 focus:ring-triad-600/15'
        )}
        {...props}
      />
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      {hint && !error && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

// ============================================
// BADGE
// ============================================
export function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  const variants = {
    success: 'bg-triad-100 text-triad-800',
    danger:  'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-800',
    info:    'bg-blue-100 text-blue-700',
    neutral: 'bg-gray-100 text-gray-700',
    admin:     'bg-purple-100 text-purple-700',
    professor: 'bg-blue-100 text-blue-700',
    recepcao:  'bg-amber-100 text-amber-800',
    aluno:     'bg-triad-100 text-triad-800',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap',
        variants[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ============================================
// CARD
// ============================================
export function Card({ children, className = '' }) {
  return (
    <div className={classNames('bg-white rounded-xl shadow-sm border border-gray-100', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={classNames('px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3', className)}>
      <div>
        <div className="text-[14.5px] font-semibold text-gray-900">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={classNames('p-5', className)}>{children}</div>;
}

// ============================================
// TABLE
// ============================================
export function Table({ children, className = '' }) {
  return (
    <div className={classNames('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  );
}

export function TH({ children, align = 'left', className = '' }) {
  return (
    <th
      className={classNames(
        'px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap',
        align === 'right'  && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className = '', hover = true }) {
  return (
    <tr
      className={classNames(
        'border-b border-gray-100 last:border-b-0',
        hover && 'hover:bg-gray-50 transition-colors',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ children, align = 'left', className = '' }) {
  return (
    <td
      className={classNames(
        'px-5 py-3 text-gray-800 align-middle',
        align === 'right'  && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  );
}

// ============================================
// AVATAR
// ============================================
export function Avatar({ name, variant = 'default', size = 'md', className = '' }) {
  const initials = (name || '??')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const variants = {
    default:   'bg-triad-100 text-triad-800',
    admin:     'bg-purple-100 text-purple-600',
    professor: 'bg-blue-100 text-blue-600',
    recepcao:  'bg-amber-100 text-amber-600',
    aluno:     'bg-triad-100 text-triad-800',
    dark:      'bg-triad-700 text-white',
  };

  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  };

  return (
    <div
      className={classNames(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

// ============================================
// SPINNER
// ============================================
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <Loader2
      className={classNames('animate-spin text-triad-600', sizes[size], className)}
    />
  );
}

// ============================================
// EMPTY STATE
// ============================================
export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={classNames('text-center py-12 px-6', className)}>
      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      {title && <div className="text-sm font-semibold text-gray-700 mb-1">{title}</div>}
      {description && <div className="text-[13px] text-gray-500 mb-4">{description}</div>}
      {action}
    </div>
  );
}

// ============================================
// SKELETON
// ============================================
export function Skeleton({ className = '', variant = 'text' }) {
  const base = 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-md';

  const variants = {
    text:  'h-3.5',
    value: 'h-7 w-20',
    title: 'h-5 w-40',
    block: 'h-24',
  };

  return <div className={classNames(base, variants[variant], className)} />;
}

// ============================================
// TOGGLE
// ============================================
export function Toggle({ checked, onChange, disabled = false }) {
  return (
    <label className={classNames('relative inline-block w-10 h-[22px] flex-shrink-0', disabled && 'opacity-50 cursor-not-allowed')}>
      <input
        type="checkbox"
        className="opacity-0 w-0 h-0"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span
        className={classNames(
          'absolute inset-0 rounded-full transition-colors cursor-pointer',
          checked ? 'bg-triad-600' : 'bg-gray-300'
        )}
      >
        <span
          className={classNames(
            'absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform',
            checked && 'translate-x-[18px]'
          )}
        />
      </span>
    </label>
  );
}

// ============================================
// MODAL
// ============================================
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/50 flex items-center justify-center p-5 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={classNames('bg-white rounded-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up', sizes[size])}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[17px] font-bold tracking-tight text-gray-900">{title}</div>
            {subtitle && <div className="text-[13px] text-gray-500 mt-1">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ============================================
// CONFIRM MODAL (atalho pro modal de confirmação)
// ============================================
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  subtitle,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  );
}

// ============================================
// PAGE HEADER (título + subtítulo + ação)
// ============================================
export function PageHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={classNames('flex items-start justify-between gap-4 flex-wrap mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-gray-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="flex gap-2 flex-wrap">{action}</div>}
    </div>
  );
}
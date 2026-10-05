import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

const styles = {
  primary: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400',
  secondary: 'bg-slate-800 text-slate-100 ring-1 ring-white/10 hover:bg-slate-700',
  danger: 'bg-rose-500 text-white hover:bg-rose-400',
  ghost: 'text-slate-300 hover:bg-white/5',
};

export function Button({ variant = 'primary', loading = false, className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}

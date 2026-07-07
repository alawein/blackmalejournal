'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'amber' | 'dark' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Icon rendered before the label */
  iconLeft?: ReactNode;
  /** Icon rendered after the label */
  iconRight?: ReactNode;
  /** Render full-width */
  fullWidth?: boolean;
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonBaseProps {}

export interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
  /** open in new tab */
  external?: boolean;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  amber: 'btn-amber',
  ghost: 'btn-ghost',
  dark:
    'btn-base border border-bmj-tan/20 bg-bmj-deep-black text-bmj-cream hover:bg-bmj-brown hover:border-bmj-tan/40 hover:text-bmj-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '', // default size from btn-base
  lg: 'btn-lg',
};

// ─── Button (native <button>) ─────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          'gap-2',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : iconLeft ? (
          <span className="shrink-0" aria-hidden="true">{iconLeft}</span>
        ) : null}
        {children}
        {!loading && iconRight && (
          <span className="shrink-0" aria-hidden="true">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

// ─── ButtonLink (renders as <Link> or <a>) ────────────────────────────────────

export function ButtonLink({
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    'gap-2',
    className,
  );

  const inner = (
    <>
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : iconLeft ? (
        <span className="shrink-0" aria-hidden="true">{iconLeft}</span>
      ) : null}
      {children}
      {!loading && iconRight && (
        <span className="shrink-0" aria-hidden="true">{iconRight}</span>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {inner}
    </Link>
  );
}

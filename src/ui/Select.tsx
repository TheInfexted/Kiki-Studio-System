import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className = '', children, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <label className="block text-sm" htmlFor={selectId}>
      {label && <span className="mb-1 block font-medium text-neutral-800">{label}</span>}
      <select
        ref={ref}
        id={selectId}
        className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-neutral-300'} bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});

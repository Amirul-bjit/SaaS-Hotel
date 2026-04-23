import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

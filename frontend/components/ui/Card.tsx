import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <h2 className="mb-4 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}

// apps/admin/frontend/src/components/Card.tsx

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean; // Untuk efek hover
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, ...props }) => {
  const hoverClasses = hover 
    ? 'transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:shadow-slate-500/10' 
    : '';

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
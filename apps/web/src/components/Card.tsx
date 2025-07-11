import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-sm rounded-2xl shadow-medical p-6 border border-primary/10',
        hover && 'hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
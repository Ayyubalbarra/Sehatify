import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-chat';
  
  const variants = {
    primary: 'bg-medical-gradient text-white hover:shadow-medical focus:ring-primary/20',
    secondary: 'bg-secondary text-text hover:bg-secondary-hover focus:ring-secondary/20',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/20',
    ghost: 'text-primary hover:bg-secondary/50 focus:ring-primary/20'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
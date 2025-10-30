// Reusable card component
'use client';

import React, { HTMLAttributes } from 'react';

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

/**
 * Get card variant classes
 */
const getVariantClasses = (variant: CardVariant): string => {
  const variants: Record<CardVariant, string> = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg',
  };
  return variants[variant];
};

/**
 * Get card padding classes
 */
const getPaddingClasses = (padding: CardProps['padding']): string => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  return paddings[padding || 'md'];
};

/**
 * Reusable Card component for content containers
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description text</CardDescription>
 *   </CardHeader>
 *   <CardBody>
 *     Content goes here
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg transition-all';
  const variantClasses = getVariantClasses(variant);
  const paddingClasses = getPaddingClasses(padding);
  const hoverClasses = hoverable ? 'hover:shadow-xl cursor-pointer' : '';

  const combinedClasses = `${baseClasses} ${variantClasses} ${paddingClasses} ${hoverClasses} ${className}`.trim();

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card header component
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  divider = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'mb-4';
  const dividerClasses = divider ? 'border-b border-gray-200 pb-4' : '';

  return (
    <div className={`${baseClasses} ${dividerClasses} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

/**
 * Card title component
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  as: Component = 'h3',
  className = '',
  ...props
}) => {
  const baseClasses = 'text-xl font-semibold text-gray-900';

  return (
    <Component className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
};

/**
 * Card description component
 */
export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'text-sm text-gray-500 mt-1';

  return (
    <p className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </p>
  );
};

/**
 * Card body component
 */
export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'text-gray-700';

  return (
    <div className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

/**
 * Card footer component
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  divider = false,
  justify = 'end',
  className = '',
  ...props
}) => {
  const baseClasses = 'mt-4';
  const dividerClasses = divider ? 'border-t border-gray-200 pt-4' : '';
  const justifyClasses = {
    start: 'flex justify-start',
    center: 'flex justify-center',
    end: 'flex justify-end',
    between: 'flex justify-between',
  };

  return (
    <div
      className={`${baseClasses} ${dividerClasses} ${justifyClasses[justify]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card with image
 */
export interface CardImageProps {
  src: string;
  alt: string;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  height = 200,
  objectFit = 'cover',
}) => {
  return (
    <div className="mb-4 -mt-6 -mx-6 rounded-t-lg overflow-hidden">
      <img
        src={src}
        alt={alt}
        style={{ height: `${height}px`, objectFit }}
        className="w-full"
      />
    </div>
  );
};

/**
 * Card grid container
 */
export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
  ...props
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Status card for displaying metrics
 */
export interface StatusCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  ...cardProps
}) => {
  return (
    <Card {...cardProps}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

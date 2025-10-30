// Reusable input component
'use client';

import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

/**
 * Input variant types
 */
export type InputVariant = 'default' | 'filled' | 'flushed';

/**
 * Input size types
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input component props
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Get input variant classes
 */
const getVariantClasses = (variant: InputVariant, hasError: boolean): string => {
  const errorClasses = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  const variants: Record<InputVariant, string> = {
    default: `border ${errorClasses} rounded-lg bg-white`,
    filled: `border-0 ${hasError ? 'bg-red-50' : 'bg-gray-100'} rounded-lg`,
    flushed: `border-0 border-b-2 ${errorClasses} rounded-none bg-transparent`,
  };
  return variants[variant];
};

/**
 * Get input size classes
 */
const getSizeClasses = (size: InputSize): string => {
  const sizes: Record<InputSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };
  return sizes[size];
};

/**
 * Reusable Input component with various styles and features
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   helperText="We'll never share your email"
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 * />
 *
 * <Input
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseClasses = 'w-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = getVariantClasses(variant, hasError);
    const sizeClasses = getSizeClasses(size);
    const iconPaddingClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    const inputClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${iconPaddingClasses} ${className}`.trim();
    const wrapperClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component props
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

/**
 * Textarea component
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      resize = 'vertical',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseClasses = 'w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    const errorClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    const resizeClasses = `resize-${resize}`;

    const textareaClasses = `${baseClasses} ${errorClasses} ${resizeClasses} ${className}`.trim();
    const wrapperClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Number input with increment/decrement buttons
 */
export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || 0);

    const handleIncrement = () => {
      const newValue = internalValue + step;
      if (max === undefined || newValue <= max) {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    const handleDecrement = () => {
      const newValue = internalValue - step;
      if (min === undefined || newValue >= min) {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value !== undefined ? value : internalValue}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setInternalValue(val);
          onChange?.(val);
        }}
        rightIcon={
          <div className="flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              className="text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              ▼
            </button>
          </div>
        }
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

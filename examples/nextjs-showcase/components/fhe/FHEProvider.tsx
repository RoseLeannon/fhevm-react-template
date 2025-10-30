// FHE context provider for managing FHE state across the application
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useFHE } from '@/hooks/useFHE';
import type { FHEConfig } from '@/lib/fhe/types';

/**
 * FHE context value interface
 */
interface FHEContextValue {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  config: FHEConfig;
  initialize: (config: FHEConfig) => Promise<void>;
  reset: () => void;
  updateConfig: (config: Partial<FHEConfig>) => void;
}

/**
 * FHE context
 */
const FHEContext = createContext<FHEContextValue | undefined>(undefined);

/**
 * FHE provider props
 */
export interface FHEProviderProps {
  children: ReactNode;
  defaultConfig?: FHEConfig;
  autoInitialize?: boolean;
}

/**
 * FHE Provider component
 * Wraps the application to provide FHE functionality to all child components
 *
 * @example
 * ```tsx
 * <FHEProvider defaultConfig={{ network: 'sepolia' }} autoInitialize>
 *   <App />
 * </FHEProvider>
 * ```
 */
export const FHEProvider: React.FC<FHEProviderProps> = ({
  children,
  defaultConfig = { network: 'sepolia' },
  autoInitialize = false,
}) => {
  const [config, setConfig] = useState<FHEConfig>(defaultConfig);
  const { isInitialized, isInitializing, error, initialize, reset } = useFHE(
    autoInitialize,
    config
  );

  /**
   * Update FHE configuration
   */
  const updateConfig = useCallback((newConfig: Partial<FHEConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Initialize with updated config when it changes
   */
  useEffect(() => {
    if (autoInitialize && config) {
      initialize(config);
    }
  }, [config, autoInitialize]); // Deliberately excluding initialize to prevent loops

  const value: FHEContextValue = {
    isInitialized,
    isInitializing,
    error,
    config,
    initialize,
    reset,
    updateConfig,
  };

  return <FHEContext.Provider value={value}>{children}</FHEContext.Provider>;
};

/**
 * Hook to use FHE context
 * Must be used within an FHEProvider
 *
 * @example
 * ```tsx
 * const { isInitialized, initialize } = useFHEContext();
 *
 * useEffect(() => {
 *   if (!isInitialized) {
 *     initialize({ network: 'sepolia' });
 *   }
 * }, [isInitialized, initialize]);
 * ```
 */
export const useFHEContext = (): FHEContextValue => {
  const context = useContext(FHEContext);

  if (context === undefined) {
    throw new Error('useFHEContext must be used within an FHEProvider');
  }

  return context;
};

/**
 * HOC to ensure component is wrapped with FHE context
 */
export function withFHE<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithFHEComponent(props: P) {
    const fheContext = useFHEContext();

    if (!fheContext.isInitialized && !fheContext.isInitializing) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              FHE Not Initialized
            </h3>
            <p className="text-gray-600 mb-4">
              Please initialize FHE to use this component
            </p>
            <button
              onClick={() => fheContext.initialize(fheContext.config)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Initialize FHE
            </button>
          </div>
        </div>
      );
    }

    if (fheContext.isInitializing) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Initializing FHE...</p>
          </div>
        </div>
      );
    }

    if (fheContext.error) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              FHE Initialization Error
            </h3>
            <p className="text-gray-600 mb-4">{fheContext.error.message}</p>
            <button
              onClick={() => fheContext.initialize(fheContext.config)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * FHE status indicator component
 */
export const FHEStatus: React.FC = () => {
  const { isInitialized, isInitializing, error } = useFHEContext();

  if (isInitializing) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600" />
        <span className="text-sm">Initializing...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm">Error</span>
      </div>
    );
  }

  if (isInitialized) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm">Ready</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm">Not Initialized</span>
    </div>
  );
};

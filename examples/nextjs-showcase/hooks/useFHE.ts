// Custom hook for FHE instance management
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeFHEVM, getFHEVMInstance, resetFHEVM } from '@/lib/fhe/client';
import type { FHEConfig } from '@/lib/fhe/types';

/**
 * Hook state interface
 */
interface UseFHEState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  instance: any | null;
}

/**
 * Hook return type
 */
interface UseFHEReturn extends UseFHEState {
  initialize: (config: FHEConfig) => Promise<void>;
  reset: () => void;
  getInstance: () => any | null;
}

/**
 * Custom hook for managing FHE instance lifecycle
 *
 * @param autoInitialize - Whether to automatically initialize on mount
 * @param defaultConfig - Default configuration for auto-initialization
 * @returns FHE instance state and control functions
 *
 * @example
 * ```tsx
 * const { isInitialized, initialize, getInstance } = useFHE();
 *
 * useEffect(() => {
 *   initialize({ network: 'sepolia' });
 * }, []);
 * ```
 */
export function useFHE(
  autoInitialize: boolean = false,
  defaultConfig?: FHEConfig
): UseFHEReturn {
  const [state, setState] = useState<UseFHEState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    instance: null,
  });

  // Use ref to track if initialization is in progress to prevent race conditions
  const initializingRef = useRef(false);

  /**
   * Initialize the FHE instance
   */
  const initialize = useCallback(async (config: FHEConfig) => {
    // Prevent concurrent initialization
    if (initializingRef.current) {
      console.warn('FHE initialization already in progress');
      return;
    }

    initializingRef.current = true;
    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      const instance = await initializeFHEVM(config);

      setState({
        isInitialized: true,
        isInitializing: false,
        error: null,
        instance,
      });
    } catch (error) {
      console.error('FHE initialization error:', error);
      setState({
        isInitialized: false,
        isInitializing: false,
        error: error instanceof Error ? error : new Error('Unknown initialization error'),
        instance: null,
      });
    } finally {
      initializingRef.current = false;
    }
  }, []);

  /**
   * Reset the FHE instance
   */
  const reset = useCallback(() => {
    resetFHEVM();
    setState({
      isInitialized: false,
      isInitializing: false,
      error: null,
      instance: null,
    });
    initializingRef.current = false;
  }, []);

  /**
   * Get the current FHE instance
   */
  const getInstance = useCallback(() => {
    return getFHEVMInstance();
  }, []);

  /**
   * Auto-initialize if enabled
   */
  useEffect(() => {
    if (autoInitialize && defaultConfig && !state.isInitialized && !initializingRef.current) {
      initialize(defaultConfig);
    }
  }, [autoInitialize, defaultConfig, initialize, state.isInitialized]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Optionally reset on unmount
      // Note: Comment out if you want to preserve instance across component remounts
      // resetFHEVM();
    };
  }, []);

  return {
    ...state,
    initialize,
    reset,
    getInstance,
  };
}

/**
 * Hook for checking FHE initialization status
 * Lightweight version that only tracks status without managing initialization
 */
export function useFHEStatus() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const instance = getFHEVMInstance();
      setIsInitialized(!!instance);
    };

    checkStatus();

    // Check periodically (optional)
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return { isInitialized };
}

/**
 * Hook for FHE configuration management
 */
export function useFHEConfig() {
  const [config, setConfig] = useState<FHEConfig>({
    network: 'sepolia',
  });

  const updateConfig = useCallback((updates: Partial<FHEConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNetwork = useCallback((network: FHEConfig['network']) => {
    setConfig(prev => ({ ...prev, network }));
  }, []);

  const updateContractAddress = useCallback((contractAddress: string) => {
    setConfig(prev => ({ ...prev, contractAddress }));
  }, []);

  return {
    config,
    updateConfig,
    updateNetwork,
    updateContractAddress,
  };
}

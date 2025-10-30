// Custom hook for FHE computations
'use client';

import { useState, useCallback } from 'react';
import type { EncryptedValue, ComputationResult } from '@/lib/fhe/types';

/**
 * Computation operation types
 */
export type ComputationOperation =
  | 'add'
  | 'sub'
  | 'mul'
  | 'div'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'eq'
  | 'ne'
  | 'and'
  | 'or'
  | 'not';

/**
 * Computation request
 */
interface ComputationRequest {
  operation: ComputationOperation;
  operands: EncryptedValue[];
  contractAddress: string;
}

/**
 * Computation hook state
 */
interface UseComputationState {
  isComputing: boolean;
  error: Error | null;
  result: ComputationResult | null;
  history: ComputationResult[];
}

/**
 * Computation hook return type
 */
interface UseComputationReturn extends UseComputationState {
  compute: (request: ComputationRequest) => Promise<ComputationResult | null>;
  add: (contractAddress: string, a: EncryptedValue, b: EncryptedValue) => Promise<ComputationResult | null>;
  subtract: (contractAddress: string, a: EncryptedValue, b: EncryptedValue) => Promise<ComputationResult | null>;
  multiply: (contractAddress: string, a: EncryptedValue, b: EncryptedValue) => Promise<ComputationResult | null>;
  compare: (contractAddress: string, a: EncryptedValue, b: EncryptedValue, op: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne') => Promise<ComputationResult | null>;
  clearError: () => void;
  clearHistory: () => void;
  reset: () => void;
}

/**
 * Custom hook for FHE homomorphic computations
 *
 * @returns Computation state and functions
 *
 * @example
 * ```tsx
 * const { add, isComputing, result } = useComputation();
 *
 * const handleAdd = async () => {
 *   const result = await add('0x123...', encryptedA, encryptedB);
 *   if (result) {
 *     console.log('Computation result:', result);
 *   }
 * };
 * ```
 */
export function useComputation(): UseComputationReturn {
  const [state, setState] = useState<UseComputationState>({
    isComputing: false,
    error: null,
    result: null,
    history: [],
  });

  /**
   * Generic compute function
   */
  const compute = useCallback(async (
    request: ComputationRequest
  ): Promise<ComputationResult | null> => {
    setState(prev => ({
      ...prev,
      isComputing: true,
      error: null,
    }));

    try {
      // Call the API endpoint for computation
      const response = await fetch('/api/fhe/compute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Computation failed');
      }

      const result: ComputationResult = await response.json();

      setState(prev => ({
        ...prev,
        isComputing: false,
        result,
        history: [...prev.history, result],
      }));

      return result;
    } catch (error) {
      console.error('Computation error:', error);
      setState(prev => ({
        ...prev,
        isComputing: false,
        error: error instanceof Error ? error : new Error('Unknown computation error'),
      }));
      return null;
    }
  }, []);

  /**
   * Homomorphic addition
   */
  const add = useCallback(async (
    contractAddress: string,
    a: EncryptedValue,
    b: EncryptedValue
  ): Promise<ComputationResult | null> => {
    return compute({
      operation: 'add',
      operands: [a, b],
      contractAddress,
    });
  }, [compute]);

  /**
   * Homomorphic subtraction
   */
  const subtract = useCallback(async (
    contractAddress: string,
    a: EncryptedValue,
    b: EncryptedValue
  ): Promise<ComputationResult | null> => {
    return compute({
      operation: 'sub',
      operands: [a, b],
      contractAddress,
    });
  }, [compute]);

  /**
   * Homomorphic multiplication
   */
  const multiply = useCallback(async (
    contractAddress: string,
    a: EncryptedValue,
    b: EncryptedValue
  ): Promise<ComputationResult | null> => {
    return compute({
      operation: 'mul',
      operands: [a, b],
      contractAddress,
    });
  }, [compute]);

  /**
   * Homomorphic comparison
   */
  const compare = useCallback(async (
    contractAddress: string,
    a: EncryptedValue,
    b: EncryptedValue,
    op: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
  ): Promise<ComputationResult | null> => {
    return compute({
      operation: op,
      operands: [a, b],
      contractAddress,
    });
  }, [compute]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear computation history
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setState({
      isComputing: false,
      error: null,
      result: null,
      history: [],
    });
  }, []);

  return {
    ...state,
    compute,
    add,
    subtract,
    multiply,
    compare,
    clearError,
    clearHistory,
    reset,
  };
}

/**
 * Hook for chaining multiple computations
 */
export function useComputationChain() {
  const [chain, setChain] = useState<ComputationRequest[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<ComputationResult[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const addToChain = useCallback((request: ComputationRequest) => {
    setChain(prev => [...prev, request]);
  }, []);

  const removeFromChain = useCallback((index: number) => {
    setChain(prev => prev.filter((_, i) => i !== index));
  }, []);

  const executeChain = useCallback(async () => {
    if (chain.length === 0) {
      setError(new Error('No computations in chain'));
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults([]);

    const chainResults: ComputationResult[] = [];

    try {
      for (const request of chain) {
        const response = await fetch('/api/fhe/compute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Computation failed');
        }

        const result: ComputationResult = await response.json();
        chainResults.push(result);
      }

      setResults(chainResults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsExecuting(false);
    }
  }, [chain]);

  const clearChain = useCallback(() => {
    setChain([]);
    setResults([]);
    setError(null);
  }, []);

  return {
    chain,
    isExecuting,
    results,
    error,
    addToChain,
    removeFromChain,
    executeChain,
    clearChain,
  };
}

/**
 * Hook for computation analytics
 */
export function useComputationAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalComputations: 0,
    successfulComputations: 0,
    failedComputations: 0,
    averageComputationTime: 0,
    operationCounts: {} as Record<ComputationOperation, number>,
  });

  const recordComputation = useCallback((
    operation: ComputationOperation,
    success: boolean,
    duration: number
  ) => {
    setAnalytics(prev => {
      const totalComputations = prev.totalComputations + 1;
      const successfulComputations = prev.successfulComputations + (success ? 1 : 0);
      const failedComputations = prev.failedComputations + (success ? 0 : 1);

      const totalTime = prev.averageComputationTime * prev.totalComputations + duration;
      const averageComputationTime = totalTime / totalComputations;

      const operationCounts = {
        ...prev.operationCounts,
        [operation]: (prev.operationCounts[operation] || 0) + 1,
      };

      return {
        totalComputations,
        successfulComputations,
        failedComputations,
        averageComputationTime,
        operationCounts,
      };
    });
  }, []);

  const resetAnalytics = useCallback(() => {
    setAnalytics({
      totalComputations: 0,
      successfulComputations: 0,
      failedComputations: 0,
      averageComputationTime: 0,
      operationCounts: {} as Record<ComputationOperation, number>,
    });
  }, []);

  return {
    analytics,
    recordComputation,
    resetAnalytics,
  };
}

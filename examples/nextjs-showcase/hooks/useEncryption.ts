// Custom hook for encryption operations
'use client';

import { useState, useCallback } from 'react';
import { encryptValue, encryptValues, decryptValue } from '@/lib/fhe/client';
import { validateFHEValue, validateEncryptionInput, validateDecryptionInput } from '@/lib/utils/validation';
import type { FHEValue, EncryptedValue, DecryptionInput, DecryptionResult } from '@/lib/fhe/types';

/**
 * Encryption hook state
 */
interface UseEncryptionState {
  isEncrypting: boolean;
  isDecrypting: boolean;
  encryptionError: Error | null;
  decryptionError: Error | null;
  lastEncrypted: EncryptedValue | null;
  lastDecrypted: DecryptionResult | null;
}

/**
 * Encryption hook return type
 */
interface UseEncryptionReturn extends UseEncryptionState {
  encrypt: (contractAddress: string, value: FHEValue) => Promise<EncryptedValue | null>;
  encryptMultiple: (contractAddress: string, values: Record<string, FHEValue>) => Promise<{ handles: string[]; data: Uint8Array } | null>;
  decrypt: (input: DecryptionInput) => Promise<DecryptionResult | null>;
  clearErrors: () => void;
  reset: () => void;
}

/**
 * Custom hook for FHE encryption and decryption operations
 *
 * @returns Encryption state and functions
 *
 * @example
 * ```tsx
 * const { encrypt, decrypt, isEncrypting } = useEncryption();
 *
 * const handleEncrypt = async () => {
 *   const encrypted = await encrypt('0x123...', { type: 'uint32', value: 42 });
 *   if (encrypted) {
 *     console.log('Encrypted:', encrypted);
 *   }
 * };
 * ```
 */
export function useEncryption(): UseEncryptionReturn {
  const [state, setState] = useState<UseEncryptionState>({
    isEncrypting: false,
    isDecrypting: false,
    encryptionError: null,
    decryptionError: null,
    lastEncrypted: null,
    lastDecrypted: null,
  });

  /**
   * Encrypt a single value
   */
  const encrypt = useCallback(async (
    contractAddress: string,
    value: FHEValue
  ): Promise<EncryptedValue | null> => {
    // Validate input
    const validation = validateFHEValue(value);
    if (!validation.isValid) {
      const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
      setState(prev => ({ ...prev, encryptionError: error }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isEncrypting: true,
      encryptionError: null,
    }));

    try {
      const encrypted = await encryptValue(contractAddress, value);

      setState(prev => ({
        ...prev,
        isEncrypting: false,
        lastEncrypted: encrypted,
      }));

      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      setState(prev => ({
        ...prev,
        isEncrypting: false,
        encryptionError: error instanceof Error ? error : new Error('Unknown encryption error'),
      }));
      return null;
    }
  }, []);

  /**
   * Encrypt multiple values
   */
  const encryptMultiple = useCallback(async (
    contractAddress: string,
    values: Record<string, FHEValue>
  ): Promise<{ handles: string[]; data: Uint8Array } | null> => {
    // Validate input
    const validation = validateEncryptionInput({ contractAddress, values });
    if (!validation.isValid) {
      const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
      setState(prev => ({ ...prev, encryptionError: error }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isEncrypting: true,
      encryptionError: null,
    }));

    try {
      const encrypted = await encryptValues(contractAddress, values);

      setState(prev => ({
        ...prev,
        isEncrypting: false,
      }));

      return encrypted;
    } catch (error) {
      console.error('Batch encryption error:', error);
      setState(prev => ({
        ...prev,
        isEncrypting: false,
        encryptionError: error instanceof Error ? error : new Error('Unknown encryption error'),
      }));
      return null;
    }
  }, []);

  /**
   * Decrypt a value
   */
  const decrypt = useCallback(async (
    input: DecryptionInput
  ): Promise<DecryptionResult | null> => {
    // Validate input
    const validation = validateDecryptionInput(input);
    if (!validation.isValid) {
      const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
      setState(prev => ({ ...prev, decryptionError: error }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isDecrypting: true,
      decryptionError: null,
    }));

    try {
      const decrypted = await decryptValue(input);

      setState(prev => ({
        ...prev,
        isDecrypting: false,
        lastDecrypted: decrypted,
      }));

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      setState(prev => ({
        ...prev,
        isDecrypting: false,
        decryptionError: error instanceof Error ? error : new Error('Unknown decryption error'),
      }));
      return null;
    }
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      encryptionError: null,
      decryptionError: null,
    }));
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setState({
      isEncrypting: false,
      isDecrypting: false,
      encryptionError: null,
      decryptionError: null,
      lastEncrypted: null,
      lastDecrypted: null,
    });
  }, []);

  return {
    ...state,
    encrypt,
    encryptMultiple,
    decrypt,
    clearErrors,
    reset,
  };
}

/**
 * Hook for tracking encryption history
 */
export function useEncryptionHistory(maxHistory: number = 10) {
  const [history, setHistory] = useState<EncryptedValue[]>([]);

  const addToHistory = useCallback((encrypted: EncryptedValue) => {
    setHistory(prev => {
      const newHistory = [encrypted, ...prev];
      return newHistory.slice(0, maxHistory);
    });
  }, [maxHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((handle: string) => {
    setHistory(prev => prev.filter(item => item.handle !== handle));
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

/**
 * Hook for batch encryption with progress tracking
 */
export function useBatchEncryption() {
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<EncryptedValue[]>([]);
  const [errors, setErrors] = useState<Error[]>([]);

  const encryptBatch = useCallback(async (
    contractAddress: string,
    values: FHEValue[]
  ) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: values.length });
    setResults([]);
    setErrors([]);

    const batchResults: EncryptedValue[] = [];
    const batchErrors: Error[] = [];

    for (let i = 0; i < values.length; i++) {
      try {
        const encrypted = await encryptValue(contractAddress, values[i]);
        batchResults.push(encrypted);
      } catch (error) {
        batchErrors.push(error instanceof Error ? error : new Error('Unknown error'));
      }
      setProgress({ current: i + 1, total: values.length });
    }

    setResults(batchResults);
    setErrors(batchErrors);
    setIsProcessing(false);

    return { results: batchResults, errors: batchErrors };
  }, []);

  const reset = useCallback(() => {
    setProgress({ current: 0, total: 0 });
    setIsProcessing(false);
    setResults([]);
    setErrors([]);
  }, []);

  return {
    progress,
    isProcessing,
    results,
    errors,
    encryptBatch,
    reset,
  };
}

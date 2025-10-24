/**
 * React hooks and utilities for FHEVM SDK
 *
 * @example
 * ```tsx
 * import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/universal-sdk/react';
 *
 * function App() {
 *   const { fhevm, isInitialized, error } = useFhevm({
 *     network: 'sepolia',
 *     contractAddress: '0x...',
 *   });
 *
 *   const { encrypt, isEncrypting } = useEncrypt(fhevm);
 *   const { decrypt, isDecrypting } = useDecrypt(fhevm);
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  FhevmConfig,
  FhevmInstance,
  EncryptedData,
  DecryptionRequest,
  DecryptedData,
} from './types';
import { createFhevmInstance } from './core/instance';
import { createEncryptedInput, batchEncrypt } from './core/encryption';
import { decrypt, batchDecrypt } from './core/decryption';
import { createContract, callContractFunction, listenToEvent } from './core/contract';
import type { Contract, InterfaceAbi } from 'ethers';

/**
 * Hook for FHEVM instance management
 */
export function useFhevm(config: FhevmConfig) {
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setIsInitializing(true);
      setError(null);

      try {
        const instance = await createFhevmInstance(config);

        if (mounted) {
          setFhevm(instance);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [config.network, config.contractAddress]);

  return {
    fhevm,
    isInitialized,
    isInitializing,
    error,
  };
}

/**
 * Hook for encryption
 */
export function useEncrypt(fhevm: FhevmInstance | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      contractAddress: string,
      values: Record<string, { type: string; value: any }>
    ): Promise<EncryptedData | null> => {
      if (!fhevm) {
        setError(new Error('FHEVM instance not initialized'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await batchEncrypt(fhevm, contractAddress, values);
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [fhevm]
  );

  const createInput = useCallback(
    (contractAddress: string) => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }
      return createEncryptedInput(fhevm, contractAddress);
    },
    [fhevm]
  );

  return {
    encrypt,
    createInput,
    isEncrypting,
    error,
  };
}

/**
 * Hook for decryption
 */
export function useDecrypt(fhevm: FhevmInstance | null) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decryptValue = useCallback(
    async (request: DecryptionRequest): Promise<DecryptedData | null> => {
      if (!fhevm) {
        setError(new Error('FHEVM instance not initialized'));
        return null;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const decrypted = await decrypt(fhevm, request);
        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [fhevm]
  );

  const decryptBatch = useCallback(
    async (requests: DecryptionRequest[]): Promise<DecryptedData[] | null> => {
      if (!fhevm) {
        setError(new Error('FHEVM instance not initialized'));
        return null;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const decrypted = await batchDecrypt(fhevm, requests);
        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [fhevm]
  );

  return {
    decrypt: decryptValue,
    decryptBatch,
    isDecrypting,
    error,
  };
}

/**
 * Hook for contract interaction
 */
export function useContract(fhevm: FhevmInstance | null, address: string, abi: InterfaceAbi) {
  const contract = useMemo(() => {
    if (!fhevm) return null;
    return createContract(fhevm, address, abi);
  }, [fhevm, address, abi]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(
    async (functionName: string, args: any[], options?: any): Promise<any> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await callContractFunction(contract, functionName, args, options);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return {
    contract,
    call,
    isLoading,
    error,
  };
}

/**
 * Hook for contract events
 */
export function useContractEvent(
  contract: Contract | null,
  eventName: string,
  callback: (event: any) => void
) {
  useEffect(() => {
    if (!contract) return;

    const unsubscribe = listenToEvent(contract, eventName, callback);

    return () => {
      unsubscribe();
    };
  }, [contract, eventName, callback]);
}

/**
 * Hook for wallet connection status
 */
export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);

  useEffect(() => {
    async function checkConnection() {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        return;
      }

      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        }

        const chainIdHex = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });
        setChainId(parseInt(chainIdHex, 16));
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
      }
    }

    checkConnection();

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        } else {
          setIsConnected(false);
          setAddress('');
        }
      });

      (window as any).ethereum.on('chainChanged', (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No wallet provider found');
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
      }
    } catch (err) {
      throw new Error('Failed to connect wallet');
    }
  }, []);

  return {
    isConnected,
    address,
    chainId,
    connect,
  };
}

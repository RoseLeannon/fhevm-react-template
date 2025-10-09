/**
 * Vue composables for FHEVM SDK
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/universal-sdk/vue';
 *
 * const { fhevm, isInitialized, error } = useFhevm({
 *   network: 'sepolia',
 *   contractAddress: '0x...',
 * });
 *
 * const { encrypt, isEncrypting } = useEncrypt(fhevm);
 * const { decrypt, isDecrypting } = useDecrypt(fhevm);
 * </script>
 * ```
 */

import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
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
 * Composable for FHEVM instance management
 */
export function useFhevm(config: FhevmConfig) {
  const fhevm = ref<FhevmInstance | null>(null);
  const isInitialized = ref(false);
  const isInitializing = ref(false);
  const error = ref<Error | null>(null);

  onMounted(async () => {
    isInitializing.value = true;
    error.value = null;

    try {
      const instance = await createFhevmInstance(config);
      fhevm.value = instance;
      isInitialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      isInitializing.value = false;
    }
  });

  return {
    fhevm,
    isInitialized,
    isInitializing,
    error,
  };
}

/**
 * Composable for encryption
 */
export function useEncrypt(fhevmRef: { value: FhevmInstance | null }) {
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);

  const encrypt = async (
    contractAddress: string,
    values: Record<string, { type: string; value: any }>
  ): Promise<EncryptedData | null> => {
    if (!fhevmRef.value) {
      error.value = new Error('FHEVM instance not initialized');
      return null;
    }

    isEncrypting.value = true;
    error.value = null;

    try {
      const encrypted = await batchEncrypt(fhevmRef.value, contractAddress, values);
      return encrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const createInput = (contractAddress: string) => {
    if (!fhevmRef.value) {
      throw new Error('FHEVM instance not initialized');
    }
    return createEncryptedInput(fhevmRef.value, contractAddress);
  };

  return {
    encrypt,
    createInput,
    isEncrypting,
    error,
  };
}

/**
 * Composable for decryption
 */
export function useDecrypt(fhevmRef: { value: FhevmInstance | null }) {
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  const decryptValue = async (request: DecryptionRequest): Promise<DecryptedData | null> => {
    if (!fhevmRef.value) {
      error.value = new Error('FHEVM instance not initialized');
      return null;
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const decrypted = await decrypt(fhevmRef.value, request);
      return decrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  const decryptBatch = async (requests: DecryptionRequest[]): Promise<DecryptedData[] | null> => {
    if (!fhevmRef.value) {
      error.value = new Error('FHEVM instance not initialized');
      return null;
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const decrypted = await batchDecrypt(fhevmRef.value, requests);
      return decrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  return {
    decrypt: decryptValue,
    decryptBatch,
    isDecrypting,
    error,
  };
}

/**
 * Composable for contract interaction
 */
export function useContract(
  fhevmRef: { value: FhevmInstance | null },
  address: string,
  abi: InterfaceAbi
) {
  const contract = computed(() => {
    if (!fhevmRef.value) return null;
    return createContract(fhevmRef.value, address, abi);
  });

  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const call = async (functionName: string, args: any[], options?: any): Promise<any> => {
    if (!contract.value) {
      throw new Error('Contract not initialized');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await callContractFunction(contract.value, functionName, args, options);
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    contract,
    call,
    isLoading,
    error,
  };
}

/**
 * Composable for contract events
 */
export function useContractEvent(
  contractRef: { value: Contract | null },
  eventName: string,
  callback: (event: any) => void
) {
  let unsubscribe: (() => void) | null = null;

  watch(
    () => contractRef.value,
    (contract) => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      if (contract) {
        unsubscribe = listenToEvent(contract, eventName, callback);
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
}

/**
 * Composable for wallet connection
 */
export function useWallet() {
  const isConnected = ref(false);
  const address = ref<string>('');
  const chainId = ref<number>(0);

  onMounted(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        isConnected.value = true;
        address.value = accounts[0];
      }

      const chainIdHex = await (window as any).ethereum.request({
        method: 'eth_chainId',
      });
      chainId.value = parseInt(chainIdHex, 16);
    } catch (err) {
      console.error('Failed to check wallet connection:', err);
    }

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          isConnected.value = true;
          address.value = accounts[0];
        } else {
          isConnected.value = false;
          address.value = '';
        }
      });

      (window as any).ethereum.on('chainChanged', (chainIdHex: string) => {
        chainId.value = parseInt(chainIdHex, 16);
      });
    }
  });

  const connect = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No wallet provider found');
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        isConnected.value = true;
        address.value = accounts[0];
      }
    } catch (err) {
      throw new Error('Failed to connect wallet');
    }
  };

  return {
    isConnected,
    address,
    chainId,
    connect,
  };
}

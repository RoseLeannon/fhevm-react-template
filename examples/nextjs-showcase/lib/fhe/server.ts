// Server-side FHE operations for API routes
import { createFhevmInstance } from '@fhevm/universal-sdk';
import type { FHEConfig, FHEValue, EncryptedValue, DecryptionInput, DecryptionResult } from './types';

// Server-side FHEVM instance cache
let serverFhevmInstance: any = null;
let instanceConfig: FHEConfig | null = null;

/**
 * Initialize FHEVM instance on the server side
 * This should be called in API routes to ensure proper initialization
 */
export async function initializeServerFHEVM(config: FHEConfig) {
  // Reuse existing instance if configuration matches
  if (serverFhevmInstance && instanceConfig?.network === config.network) {
    return serverFhevmInstance;
  }

  try {
    serverFhevmInstance = await createFhevmInstance({
      network: config.network,
      contractAddress: config.contractAddress || '0x0000000000000000000000000000000000000000',
      ...(config.providerUrl && { providerUrl: config.providerUrl }),
    });

    instanceConfig = config;
    return serverFhevmInstance;
  } catch (error) {
    console.error('Failed to initialize server FHEVM:', error);
    throw new Error(`FHEVM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the current server FHEVM instance
 * Throws an error if not initialized
 */
export function getServerFHEVMInstance() {
  if (!serverFhevmInstance) {
    throw new Error('Server FHEVM instance not initialized. Call initializeServerFHEVM first.');
  }
  return serverFhevmInstance;
}

/**
 * Encrypt a single value on the server side
 */
export async function serverEncryptValue(
  contractAddress: string,
  value: FHEValue
): Promise<EncryptedValue> {
  const instance = getServerFHEVMInstance();

  try {
    const { encrypt } = await import('@fhevm/universal-sdk');

    const result = await encrypt(instance, contractAddress, {
      [value.type]: { type: value.type, value: value.value },
    });

    return {
      handle: result.handles[0],
      type: value.type,
      data: result.data,
    };
  } catch (error) {
    console.error('Server-side encryption failed:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt multiple values on the server side
 */
export async function serverEncryptValues(
  contractAddress: string,
  values: Record<string, FHEValue>
): Promise<{ handles: string[]; data: Uint8Array }> {
  const instance = getServerFHEVMInstance();

  try {
    const { encrypt } = await import('@fhevm/universal-sdk');
    const result = await encrypt(instance, contractAddress, values);
    return result;
  } catch (error) {
    console.error('Server-side batch encryption failed:', error);
    throw new Error(`Batch encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a value on the server side
 * Note: Server-side decryption requires proper authorization
 */
export async function serverDecryptValue(
  input: DecryptionInput
): Promise<DecryptionResult> {
  const instance = getServerFHEVMInstance();

  try {
    const { decrypt } = await import('@fhevm/universal-sdk');
    const result = await decrypt(instance, input);
    return result;
  } catch (error) {
    console.error('Server-side decryption failed:', error);
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create an encrypted input builder on the server side
 */
export function getServerEncryptedInputBuilder(contractAddress: string) {
  const instance = getServerFHEVMInstance();

  try {
    const { createEncryptedInput } = require('@fhevm/universal-sdk');
    return createEncryptedInput(instance, contractAddress);
  } catch (error) {
    console.error('Failed to create encrypted input builder:', error);
    throw new Error(`Failed to create input builder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Perform homomorphic addition on encrypted values
 */
export async function serverHomomorphicAdd(
  contractAddress: string,
  value1: EncryptedValue,
  value2: EncryptedValue
): Promise<EncryptedValue> {
  if (value1.type !== value2.type) {
    throw new Error('Cannot add encrypted values of different types');
  }

  // This is a placeholder for actual homomorphic addition
  // In a real implementation, this would interact with smart contracts
  console.log('Performing homomorphic addition:', { contractAddress, value1, value2 });

  return {
    handle: `${value1.handle}_${value2.handle}_add`,
    type: value1.type,
    data: new Uint8Array(), // Result would come from contract
  };
}

/**
 * Perform homomorphic comparison on encrypted values
 */
export async function serverHomomorphicCompare(
  contractAddress: string,
  value1: EncryptedValue,
  value2: EncryptedValue,
  operation: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
): Promise<EncryptedValue> {
  if (value1.type !== value2.type) {
    throw new Error('Cannot compare encrypted values of different types');
  }

  // This is a placeholder for actual homomorphic comparison
  // In a real implementation, this would interact with smart contracts
  console.log('Performing homomorphic comparison:', { contractAddress, value1, value2, operation });

  return {
    handle: `${value1.handle}_${value2.handle}_${operation}`,
    type: 'bool',
    data: new Uint8Array(), // Result would come from contract
  };
}

/**
 * Validate contract address format
 */
export function validateContractAddress(address: string): boolean {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

/**
 * Reset server FHEVM instance
 * Useful for testing or configuration changes
 */
export function resetServerFHEVM() {
  serverFhevmInstance = null;
  instanceConfig = null;
}

/**
 * Check if server FHEVM is initialized
 */
export function isServerFHEVMInitialized(): boolean {
  return serverFhevmInstance !== null;
}

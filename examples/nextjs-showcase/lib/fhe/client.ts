// Client-side FHE operations
import { createFhevmInstance, encrypt, decrypt, createEncryptedInput } from '@fhevm/universal-sdk';
import type { FHEConfig, FHEValue, EncryptedValue, DecryptionInput, DecryptionResult } from './types';

let fhevmInstance: any = null;

/**
 * Initialize FHEVM instance on the client side
 */
export async function initializeFHEVM(config: FHEConfig) {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    fhevmInstance = await createFhevmInstance({
      network: config.network,
      contractAddress: config.contractAddress || '0x0000000000000000000000000000000000000000',
    });

    return fhevmInstance;
  } catch (error) {
    console.error('Failed to initialize FHEVM:', error);
    throw error;
  }
}

/**
 * Get the current FHEVM instance
 */
export function getFHEVMInstance() {
  return fhevmInstance;
}

/**
 * Encrypt a single value
 */
export async function encryptValue(
  contractAddress: string,
  value: FHEValue
): Promise<EncryptedValue> {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized');
  }

  try {
    const result = await encrypt(fhevmInstance, contractAddress, {
      [value.type]: { type: value.type, value: value.value },
    });

    return {
      handle: result.handles[0],
      type: value.type,
      data: result.data,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error;
  }
}

/**
 * Encrypt multiple values
 */
export async function encryptValues(
  contractAddress: string,
  values: Record<string, FHEValue>
): Promise<{ handles: string[]; data: Uint8Array }> {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized');
  }

  try {
    const result = await encrypt(fhevmInstance, contractAddress, values);
    return result;
  } catch (error) {
    console.error('Batch encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt a value
 */
export async function decryptValue(
  input: DecryptionInput
): Promise<DecryptionResult> {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized');
  }

  try {
    const result = await decrypt(fhevmInstance, input);
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}

/**
 * Create an encrypted input builder
 */
export function getEncryptedInputBuilder(contractAddress: string) {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized');
  }

  return createEncryptedInput(fhevmInstance, contractAddress);
}

/**
 * Reset FHEVM instance
 */
export function resetFHEVM() {
  fhevmInstance = null;
}

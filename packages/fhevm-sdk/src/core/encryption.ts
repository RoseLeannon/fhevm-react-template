/**
 * FHEVM Encryption Utilities
 */

import type { FhevmInstance, EncryptedData, EncryptedInput } from '../types';
import { EncryptionError } from '../types';

/**
 * Create encrypted input builder
 *
 * @example
 * ```typescript
 * const input = createEncryptedInput(fhevm, contractAddress)
 *   .add8(42)
 *   .add16(1000)
 *   .addBool(true);
 *
 * const encrypted = await input.encrypt();
 * ```
 */
export function createEncryptedInput(
  instance: FhevmInstance,
  contractAddress: string
): EncryptedInput {
  try {
    return instance.instance.createEncryptedInput(contractAddress, instance.signer?.address || '');
  } catch (error) {
    throw new EncryptionError('Failed to create encrypted input', {
      contractAddress,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Encrypt a single uint8 value
 */
export async function encryptUint8(
  instance: FhevmInstance,
  contractAddress: string,
  value: number
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress).add8(value);
    return await input.encrypt();
  } catch (error) {
    throw new EncryptionError('Failed to encrypt uint8', {
      value,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Encrypt a single uint16 value
 */
export async function encryptUint16(
  instance: FhevmInstance,
  contractAddress: string,
  value: number
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress).add16(value);
    return await input.encrypt();
  } catch (error) {
    throw new EncryptionError('Failed to encrypt uint16', {
      value,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Encrypt a single uint32 value
 */
export async function encryptUint32(
  instance: FhevmInstance,
  contractAddress: string,
  value: number
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress).add32(value);
    return await input.encrypt();
  } catch (error) {
    throw new EncryptionError('Failed to encrypt uint32', {
      value,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Encrypt a single uint64 value
 */
export async function encryptUint64(
  instance: FhevmInstance,
  contractAddress: string,
  value: bigint
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress).add64(value);
    return await input.encrypt();
  } catch (error) {
    throw new EncryptionError('Failed to encrypt uint64', {
      value: value.toString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Encrypt a single boolean value
 */
export async function encryptBool(
  instance: FhevmInstance,
  contractAddress: string,
  value: boolean
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress).addBool(value);
    return await input.encrypt();
  } catch (error) {
    throw new EncryptionError('Failed to encrypt bool', {
      value,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Encrypt an address
 */
export async function encryptAddress(
  instance: FhevmInstance,
  contractAddress: string,
  value: string
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress).addAddress(value);
    return await input.encrypt();
  } catch (error) {
    throw new EncryptionError('Failed to encrypt address', {
      value,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Batch encrypt multiple values
 *
 * @example
 * ```typescript
 * const encrypted = await batchEncrypt(fhevm, contractAddress, {
 *   speed: { type: 'uint8', value: 80 },
 *   congestion: { type: 'uint8', value: 60 },
 *   active: { type: 'bool', value: true },
 * });
 * ```
 */
export async function batchEncrypt(
  instance: FhevmInstance,
  contractAddress: string,
  values: Record<string, { type: string; value: any }>
): Promise<EncryptedData> {
  try {
    const input = createEncryptedInput(instance, contractAddress);

    for (const [key, { type, value }] of Object.entries(values)) {
      switch (type) {
        case 'uint8':
          input.add8(value);
          break;
        case 'uint16':
          input.add16(value);
          break;
        case 'uint32':
          input.add32(value);
          break;
        case 'uint64':
          input.add64(BigInt(value));
          break;
        case 'uint128':
          input.add128(BigInt(value));
          break;
        case 'uint256':
          input.add256(BigInt(value));
          break;
        case 'address':
          input.addAddress(value);
          break;
        case 'bool':
          input.addBool(value);
          break;
        default:
          throw new EncryptionError(`Unsupported type: ${type}`, { key, type });
      }
    }

    return await input.encrypt();
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error;
    }
    throw new EncryptionError('Failed to batch encrypt', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Verify encrypted data integrity
 */
export function verifyEncryptedData(data: EncryptedData): boolean {
  return !!(data.data && data.data.length > 0 && data.handles && data.handles.length > 0);
}

/**
 * FHEVM Decryption Utilities
 */

import type { FhevmInstance, DecryptionRequest, DecryptedData } from '../types';
import { DecryptionError } from '../types';

/**
 * Decrypt a single encrypted value
 *
 * @example
 * ```typescript
 * const decrypted = await decrypt(fhevm, {
 *   contractAddress: '0x1234...',
 *   handle: '0xabcd...',
 *   userAddress: '0x5678...',
 * });
 * ```
 */
export async function decrypt(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<DecryptedData> {
  try {
    if (!instance.signer) {
      throw new DecryptionError('Signer required for decryption', {
        contractAddress: request.contractAddress,
      });
    }

    // Request decryption from gateway
    const result = await instance.instance.decrypt(
      request.contractAddress,
      request.handle,
      request.userAddress
    );

    return {
      value: result,
      type: detectType(result),
    };
  } catch (error) {
    throw new DecryptionError('Failed to decrypt value', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Decrypt uint8 value
 */
export async function decryptUint8(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<number> {
  try {
    const result = await decrypt(instance, request);
    return Number(result.value);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt uint8', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Decrypt uint16 value
 */
export async function decryptUint16(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<number> {
  try {
    const result = await decrypt(instance, request);
    return Number(result.value);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt uint16', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Decrypt uint32 value
 */
export async function decryptUint32(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<number> {
  try {
    const result = await decrypt(instance, request);
    return Number(result.value);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt uint32', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Decrypt uint64 value
 */
export async function decryptUint64(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<bigint> {
  try {
    const result = await decrypt(instance, request);
    return BigInt(result.value);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt uint64', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Decrypt boolean value
 */
export async function decryptBool(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<boolean> {
  try {
    const result = await decrypt(instance, request);
    return Boolean(result.value);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt bool', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Decrypt address value
 */
export async function decryptAddress(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<string> {
  try {
    const result = await decrypt(instance, request);
    return String(result.value);
  } catch (error) {
    throw new DecryptionError('Failed to decrypt address', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Batch decrypt multiple values
 *
 * @example
 * ```typescript
 * const decrypted = await batchDecrypt(fhevm, [
 *   { contractAddress: '0x...', handle: '0xaaa', userAddress: '0x...' },
 *   { contractAddress: '0x...', handle: '0xbbb', userAddress: '0x...' },
 * ]);
 * ```
 */
export async function batchDecrypt(
  instance: FhevmInstance,
  requests: DecryptionRequest[]
): Promise<DecryptedData[]> {
  try {
    return await Promise.all(requests.map((request) => decrypt(instance, request)));
  } catch (error) {
    throw new DecryptionError('Failed to batch decrypt', {
      count: requests.length,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Request reencryption for viewing encrypted data
 */
export async function reencrypt(
  instance: FhevmInstance,
  request: DecryptionRequest
): Promise<Uint8Array> {
  try {
    if (!instance.signer) {
      throw new DecryptionError('Signer required for reencryption', {
        contractAddress: request.contractAddress,
      });
    }

    // Generate EIP-712 signature for reencryption
    const signature = await instance.instance.generateSignature(
      request.contractAddress,
      request.userAddress
    );

    // Request reencryption
    const reencrypted = await instance.instance.reencrypt(
      request.handle,
      request.contractAddress,
      signature.publicKey,
      signature.signature
    );

    return reencrypted;
  } catch (error) {
    throw new DecryptionError('Failed to reencrypt value', {
      ...request,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Detect value type from decrypted result
 */
function detectType(value: any): DecryptedData['type'] {
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string' && value.startsWith('0x')) return 'address';
  if (typeof value === 'bigint' || typeof value === 'number') {
    const num = BigInt(value);
    if (num < 256n) return 'uint8';
    if (num < 65536n) return 'uint16';
    if (num < 4294967296n) return 'uint32';
    if (num < 18446744073709551616n) return 'uint64';
    if (num < 340282366920938463463374607431768211456n) return 'uint128';
    return 'uint256';
  }
  return 'uint256';
}

/**
 * Verify decryption request
 */
export function verifyDecryptionRequest(request: DecryptionRequest): boolean {
  return !!(
    request.contractAddress &&
    request.handle &&
    request.userAddress &&
    request.contractAddress.startsWith('0x') &&
    request.handle.startsWith('0x') &&
    request.userAddress.startsWith('0x')
  );
}

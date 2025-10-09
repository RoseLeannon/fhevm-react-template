/**
 * @fhevm/universal-sdk
 *
 * Universal FHEVM SDK for building confidential smart contract frontends
 * Framework-agnostic core library
 *
 * @example
 * ```typescript
 * import { createFhevmInstance, encrypt, decrypt } from '@fhevm/universal-sdk';
 *
 * // Initialize FHEVM instance
 * const fhevm = await createFhevmInstance({
 *   network: 'sepolia',
 *   contractAddress: '0x...',
 * });
 *
 * // Encrypt data
 * const encrypted = await encrypt(fhevm, 42);
 *
 * // Decrypt data
 * const decrypted = await decrypt(fhevm, encryptedValue);
 * ```
 */

export * from './core/instance';
export * from './core/encryption';
export * from './core/decryption';
export * from './core/contract';
export * from './types';
export * from './utils';

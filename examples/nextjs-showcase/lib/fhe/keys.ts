// Key management utilities for FHE operations
import type { KeyPair } from './types';

/**
 * Storage key prefixes for different key types
 */
const STORAGE_KEYS = {
  PUBLIC_KEY: 'fhe_public_key',
  PRIVATE_KEY: 'fhe_private_key',
  KEY_TIMESTAMP: 'fhe_key_timestamp',
  CONTRACT_KEYS: 'fhe_contract_keys',
} as const;

/**
 * Generate a new FHE key pair
 * Note: In production, this would use proper cryptographic key generation
 */
export async function generateKeyPair(): Promise<KeyPair> {
  try {
    // This is a placeholder implementation
    // In a real application, you would use proper key generation from the FHEVM SDK
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2);

    const publicKey = `pub_${timestamp}_${randomValue}`;
    const privateKey = `priv_${timestamp}_${randomValue}`;

    return {
      publicKey,
      privateKey,
    };
  } catch (error) {
    console.error('Failed to generate key pair:', error);
    throw new Error(`Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store key pair in local storage (client-side only)
 */
export function storeKeyPair(keyPair: KeyPair): void {
  if (typeof window === 'undefined') {
    throw new Error('Key storage is only available on the client side');
  }

  try {
    localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, keyPair.publicKey);
    localStorage.setItem(STORAGE_KEYS.PRIVATE_KEY, keyPair.privateKey);
    localStorage.setItem(STORAGE_KEYS.KEY_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('Failed to store key pair:', error);
    throw new Error(`Key storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve key pair from local storage (client-side only)
 */
export function retrieveKeyPair(): KeyPair | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const publicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
    const privateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);

    if (!publicKey || !privateKey) {
      return null;
    }

    return { publicKey, privateKey };
  } catch (error) {
    console.error('Failed to retrieve key pair:', error);
    return null;
  }
}

/**
 * Clear stored key pair from local storage
 */
export function clearKeyPair(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
    localStorage.removeItem(STORAGE_KEYS.PRIVATE_KEY);
    localStorage.removeItem(STORAGE_KEYS.KEY_TIMESTAMP);
  } catch (error) {
    console.error('Failed to clear key pair:', error);
  }
}

/**
 * Check if a key pair exists in storage
 */
export function hasStoredKeyPair(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const publicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
    const privateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);
    return !!(publicKey && privateKey);
  } catch (error) {
    return false;
  }
}

/**
 * Get the timestamp of when keys were created
 */
export function getKeyTimestamp(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.KEY_TIMESTAMP);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if keys are expired (older than specified days)
 */
export function areKeysExpired(expirationDays: number = 30): boolean {
  const timestamp = getKeyTimestamp();
  if (!timestamp) {
    return true;
  }

  const now = Date.now();
  const expirationMs = expirationDays * 24 * 60 * 60 * 1000;
  return now - timestamp > expirationMs;
}

/**
 * Store contract-specific public key
 */
export function storeContractPublicKey(contractAddress: string, publicKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keys = getContractPublicKeys();
    keys[contractAddress] = {
      publicKey,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CONTRACT_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to store contract public key:', error);
  }
}

/**
 * Retrieve contract-specific public key
 */
export function getContractPublicKey(contractAddress: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const keys = getContractPublicKeys();
    return keys[contractAddress]?.publicKey || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get all stored contract public keys
 */
export function getContractPublicKeys(): Record<string, { publicKey: string; timestamp: number }> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONTRACT_KEYS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}

/**
 * Clear contract-specific public key
 */
export function clearContractPublicKey(contractAddress: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keys = getContractPublicKeys();
    delete keys[contractAddress];
    localStorage.setItem(STORAGE_KEYS.CONTRACT_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to clear contract public key:', error);
  }
}

/**
 * Clear all stored contract public keys
 */
export function clearAllContractPublicKeys(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.CONTRACT_KEYS);
  } catch (error) {
    console.error('Failed to clear contract public keys:', error);
  }
}

/**
 * Validate key format
 */
export function validateKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }
  // Basic validation - in production, use proper key validation
  return key.length > 0;
}

/**
 * Export key pair as JSON (for backup purposes)
 */
export function exportKeyPair(keyPair: KeyPair): string {
  return JSON.stringify(keyPair, null, 2);
}

/**
 * Import key pair from JSON
 */
export function importKeyPair(jsonString: string): KeyPair {
  try {
    const keyPair = JSON.parse(jsonString);
    if (!keyPair.publicKey || !keyPair.privateKey) {
      throw new Error('Invalid key pair format');
    }
    return keyPair;
  } catch (error) {
    throw new Error(`Failed to import key pair: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Rotate keys (generate new pair and store)
 */
export async function rotateKeys(): Promise<KeyPair> {
  try {
    const newKeyPair = await generateKeyPair();
    storeKeyPair(newKeyPair);
    return newKeyPair;
  } catch (error) {
    throw new Error(`Key rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

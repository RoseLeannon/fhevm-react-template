/**
 * Core types for FHEVM SDK
 */

import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

/**
 * Supported network configurations
 */
export type SupportedNetwork = 'sepolia' | 'localhost' | 'mainnet' | 'custom';

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  gatewayUrl?: string;
  aclAddress?: string;
}

/**
 * FHEVM instance configuration
 */
export interface FhevmConfig {
  network: SupportedNetwork;
  contractAddress: string;
  provider?: BrowserProvider | JsonRpcProvider;
  signer?: Signer;
  networkConfig?: NetworkConfig;
  publicKey?: string;
  gatewayUrl?: string;
}

/**
 * FHEVM instance
 */
export interface FhevmInstance {
  instance: any; // fhevmjs instance
  provider: BrowserProvider | JsonRpcProvider;
  signer?: Signer;
  contractAddress: string;
  publicKey: string;
  chainId: number;
  network: SupportedNetwork;
}

/**
 * Encryption result
 */
export interface EncryptedData {
  data: Uint8Array;
  handles: string[];
}

/**
 * Decryption request
 */
export interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
}

/**
 * Decryption result
 */
export interface DecryptedData {
  value: bigint | number | boolean | string;
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address' | 'bool';
}

/**
 * Contract interaction options
 */
export interface ContractCallOptions {
  gasLimit?: bigint;
  value?: bigint;
  encryptedInputs?: Record<string, any>;
}

/**
 * Encrypted input for contract calls
 */
export interface EncryptedInput {
  add8(value: number): this;
  add16(value: number): this;
  add32(value: number): this;
  add64(value: bigint): this;
  add128(value: bigint): this;
  add256(value: bigint): this;
  addAddress(value: string): this;
  addBool(value: boolean): this;
  encrypt(): Promise<EncryptedData>;
}

/**
 * SDK Error types
 */
export class FhevmError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'FhevmError';
  }
}

/**
 * Initialization error
 */
export class InitializationError extends FhevmError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'INITIALIZATION_ERROR', context);
    this.name = 'InitializationError';
  }
}

/**
 * Encryption error
 */
export class EncryptionError extends FhevmError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'ENCRYPTION_ERROR', context);
    this.name = 'EncryptionError';
  }
}

/**
 * Decryption error
 */
export class DecryptionError extends FhevmError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DECRYPTION_ERROR', context);
    this.name = 'DecryptionError';
  }
}

/**
 * Contract interaction error
 */
export class ContractError extends FhevmError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONTRACT_ERROR', context);
    this.name = 'ContractError';
  }
}

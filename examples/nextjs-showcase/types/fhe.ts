// FHE-related TypeScript types

export type FHEDataType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'bool' | 'address';

export interface FHEValue {
  type: FHEDataType;
  value: number | bigint | boolean | string;
}

export interface EncryptedValue {
  handle: string;
  type: FHEDataType;
  data: Uint8Array;
}

export interface EncryptionInput {
  contractAddress: string;
  values: Record<string, FHEValue>;
}

export interface DecryptionInput {
  contractAddress: string;
  handle: string;
  userAddress: string;
}

export interface DecryptionResult {
  value: number | bigint | boolean | string;
  type: FHEDataType;
}

export interface FHEConfig {
  network: 'sepolia' | 'mainnet' | 'localhost';
  contractAddress?: string;
  providerUrl?: string;
}

export interface FHEInstance {
  encrypt: (value: FHEValue) => Promise<EncryptedValue>;
  decrypt: (input: DecryptionInput) => Promise<DecryptionResult>;
  createEncryptedInput: (contractAddress: string) => EncryptedInput;
  isInitialized: boolean;
}

export interface EncryptedInput {
  add8: (value: number) => EncryptedInput;
  add16: (value: number) => EncryptedInput;
  add32: (value: number) => EncryptedInput;
  add64: (value: bigint) => EncryptedInput;
  add128: (value: bigint) => EncryptedInput;
  add256: (value: bigint) => EncryptedInput;
  addBool: (value: boolean) => EncryptedInput;
  addAddress: (value: string) => EncryptedInput;
  encrypt: () => Promise<{ data: Uint8Array; handles: string[] }>;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface ComputationResult {
  result: EncryptedValue;
  gasUsed?: bigint;
  transactionHash?: string;
}

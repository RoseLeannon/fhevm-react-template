// API-related TypeScript types

import { FHEValue, FHEDataType } from './fhe';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptRequest {
  contractAddress: string;
  values: Record<string, FHEValue>;
}

export interface EncryptResponse {
  handles: string[];
  data: string; // Base64 encoded Uint8Array
}

export interface DecryptRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
  signature?: string;
}

export interface DecryptResponse {
  value: number | bigint | boolean | string;
  type: FHEDataType;
}

export interface ComputeRequest {
  contractAddress: string;
  functionName: string;
  encryptedInputs: string[];
  args?: any[];
}

export interface ComputeResponse {
  result: string;
  transactionHash?: string;
  gasUsed?: string;
}

export interface KeysRequest {
  generate?: boolean;
  publicKeyOnly?: boolean;
}

export interface KeysResponse {
  publicKey: string;
  privateKey?: string;
}

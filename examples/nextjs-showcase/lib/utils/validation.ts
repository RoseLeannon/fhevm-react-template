// Input validation utilities for FHE operations
import type { FHEDataType, FHEValue } from '../fhe/types';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate FHE data type
 */
export function isValidFHEDataType(type: string): type is FHEDataType {
  const validTypes: FHEDataType[] = [
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'uint128',
    'uint256',
    'bool',
    'address',
  ];
  return validTypes.includes(type as FHEDataType);
}

/**
 * Get the maximum value for a given FHE data type
 */
export function getMaxValueForType(type: FHEDataType): bigint {
  const maxValues: Record<FHEDataType, bigint> = {
    uint8: BigInt(2 ** 8 - 1),
    uint16: BigInt(2 ** 16 - 1),
    uint32: BigInt(2 ** 32 - 1),
    uint64: BigInt(2 ** 64) - BigInt(1),
    uint128: BigInt(2 ** 128) - BigInt(1),
    uint256: (BigInt(2) ** BigInt(256)) - BigInt(1),
    bool: BigInt(1),
    address: BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
  };
  return maxValues[type];
}

/**
 * Validate a value against its FHE data type
 */
export function validateFHEValue(value: FHEValue): ValidationResult {
  const errors: string[] = [];

  // Validate type
  if (!isValidFHEDataType(value.type)) {
    errors.push(`Invalid FHE data type: ${value.type}`);
    return { isValid: false, errors };
  }

  // Validate value based on type
  switch (value.type) {
    case 'bool':
      if (typeof value.value !== 'boolean') {
        errors.push('Boolean type requires a boolean value');
      }
      break;

    case 'address':
      if (typeof value.value !== 'string') {
        errors.push('Address type requires a string value');
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(value.value)) {
        errors.push('Invalid Ethereum address format');
      }
      break;

    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'uint128':
    case 'uint256':
      const numValue = typeof value.value === 'bigint' ? value.value : BigInt(value.value);

      if (numValue < 0) {
        errors.push(`${value.type} cannot be negative`);
      }

      const maxValue = getMaxValueForType(value.type);
      if (numValue > maxValue) {
        errors.push(`Value ${numValue} exceeds maximum for ${value.type} (${maxValue})`);
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple FHE values
 */
export function validateFHEValues(values: Record<string, FHEValue>): ValidationResult {
  const errors: string[] = [];

  if (!values || typeof values !== 'object') {
    errors.push('Values must be an object');
    return { isValid: false, errors };
  }

  for (const [key, value] of Object.entries(values)) {
    const result = validateFHEValue(value);
    if (!result.isValid) {
      errors.push(`${key}: ${result.errors.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate contract address
 */
export function validateContractAddress(address: string): ValidationResult {
  const errors: string[] = [];

  if (!address || typeof address !== 'string') {
    errors.push('Contract address must be a string');
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    errors.push('Invalid contract address format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate user address
 */
export function validateUserAddress(address: string): ValidationResult {
  return validateContractAddress(address);
}

/**
 * Validate handle format
 */
export function validateHandle(handle: string): ValidationResult {
  const errors: string[] = [];

  if (!handle || typeof handle !== 'string') {
    errors.push('Handle must be a string');
  } else if (handle.length === 0) {
    errors.push('Handle cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate encryption input
 */
export function validateEncryptionInput(input: {
  contractAddress: string;
  values: Record<string, FHEValue>;
}): ValidationResult {
  const errors: string[] = [];

  // Validate contract address
  const addressResult = validateContractAddress(input.contractAddress);
  if (!addressResult.isValid) {
    errors.push(...addressResult.errors);
  }

  // Validate values
  const valuesResult = validateFHEValues(input.values);
  if (!valuesResult.isValid) {
    errors.push(...valuesResult.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate decryption input
 */
export function validateDecryptionInput(input: {
  contractAddress: string;
  handle: string;
  userAddress: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate contract address
  const contractResult = validateContractAddress(input.contractAddress);
  if (!contractResult.isValid) {
    errors.push(`Contract: ${contractResult.errors.join(', ')}`);
  }

  // Validate user address
  const userResult = validateUserAddress(input.userAddress);
  if (!userResult.isValid) {
    errors.push(`User: ${userResult.errors.join(', ')}`);
  }

  // Validate handle
  const handleResult = validateHandle(input.handle);
  if (!handleResult.isValid) {
    errors.push(`Handle: ${handleResult.errors.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate network configuration
 */
export function validateNetwork(network: string): ValidationResult {
  const errors: string[] = [];
  const validNetworks = ['sepolia', 'mainnet', 'localhost'];

  if (!validNetworks.includes(network)) {
    errors.push(`Invalid network. Must be one of: ${validNetworks.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize and validate string input
 */
export function validateStringInput(
  input: string,
  minLength: number = 0,
  maxLength: number = 1000
): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'string') {
    errors.push('Input must be a string');
    return { isValid: false, errors };
  }

  if (input.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters`);
  }

  if (input.length > maxLength) {
    errors.push(`Input must be at most ${maxLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate numeric range
 */
export function validateNumericRange(
  value: number | bigint,
  min?: number | bigint,
  max?: number | bigint
): ValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'number' && typeof value !== 'bigint') {
    errors.push('Value must be a number or bigint');
    return { isValid: false, errors };
  }

  if (min !== undefined && value < min) {
    errors.push(`Value must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`Value must be at most ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate array input
 */
export function validateArray(
  input: any[],
  minLength: number = 0,
  maxLength: number = 100
): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(input)) {
    errors.push('Input must be an array');
    return { isValid: false, errors };
  }

  if (input.length < minLength) {
    errors.push(`Array must have at least ${minLength} items`);
  }

  if (input.length > maxLength) {
    errors.push(`Array must have at most ${maxLength} items`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate object has required fields
 */
export function validateRequiredFields(
  obj: Record<string, any>,
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];

  if (!obj || typeof obj !== 'object') {
    errors.push('Input must be an object');
    return { isValid: false, errors };
  }

  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate computation operation
 */
export function validateComputationOperation(
  operation: string
): ValidationResult {
  const errors: string[] = [];
  const validOperations = ['add', 'sub', 'mul', 'div', 'gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'and', 'or', 'not'];

  if (!validOperations.includes(operation)) {
    errors.push(`Invalid operation. Must be one of: ${validOperations.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

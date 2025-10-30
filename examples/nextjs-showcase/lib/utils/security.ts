// Security utilities for FHE operations
import crypto from 'crypto';

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate limiter store
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>'"]/g, '')
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if it's a valid Ethereum address (0x followed by 40 hex characters)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

/**
 * Validate contract address and throw error if invalid
 */
export function validateContractAddress(address: string): void {
  if (!isValidAddress(address)) {
    throw new Error('Invalid contract address format');
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof window !== 'undefined') {
    // Client-side implementation
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Server-side implementation
    return crypto.randomBytes(length).toString('hex');
  }
}

/**
 * Hash sensitive data using SHA-256
 */
export function hashData(data: string): string {
  if (typeof window !== 'undefined') {
    // Client-side: Use Web Crypto API
    throw new Error('Client-side hashing should use async hashDataAsync function');
  } else {
    // Server-side: Use Node.js crypto
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

/**
 * Async hash for client-side using Web Crypto API
 */
export async function hashDataAsync(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Rate limiting function
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const limitData = rateLimitStore.get(identifier);

  // If no data or window expired, reset
  if (!limitData || now >= limitData.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  // Check if limit exceeded
  if (limitData.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: limitData.resetTime };
  }

  // Increment counter
  limitData.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - limitData.count,
    resetTime: limitData.resetTime,
  };
}

/**
 * Clear rate limit data for an identifier
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Validate numeric input for FHE operations
 */
export function validateNumericInput(value: any, min?: number, max?: number): boolean {
  if (typeof value !== 'number' && typeof value !== 'bigint') {
    return false;
  }

  const numValue = Number(value);
  if (isNaN(numValue) || !isFinite(numValue)) {
    return false;
  }

  if (min !== undefined && numValue < min) {
    return false;
  }

  if (max !== undefined && numValue > max) {
    return false;
  }

  return true;
}

/**
 * Secure comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  // Ensure same length to prevent timing attacks
  if (a.length !== b.length) {
    return false;
  }

  if (typeof window === 'undefined') {
    // Server-side: Use Node.js crypto.timingSafeEqual
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    try {
      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch {
      return false;
    }
  } else {
    // Client-side: Simple comparison (less secure but functional)
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * Validate data size to prevent DoS attacks
 */
export function validateDataSize(data: any, maxSizeBytes: number = 1024 * 1024): boolean {
  const size = new Blob([JSON.stringify(data)]).size;
  return size <= maxSizeBytes;
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // In production, return generic message for security
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      return 'An error occurred. Please try again later.';
    }
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Validate API request origin (for CORS)
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  return allowedOrigins.some(allowed => {
    if (allowed === '*') {
      return true;
    }
    return origin === allowed;
  });
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, expected: string): boolean {
  return secureCompare(token, expected);
}

/**
 * Obfuscate sensitive data for logging
 */
export function obfuscateData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars * 2) {
    return '***';
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  return `${start}...${end}`;
}

/**
 * Validate content type for API requests
 */
export function validateContentType(contentType: string | null): boolean {
  const allowedTypes = ['application/json', 'application/x-www-form-urlencoded'];
  return contentType ? allowedTypes.some(type => contentType.includes(type)) : false;
}

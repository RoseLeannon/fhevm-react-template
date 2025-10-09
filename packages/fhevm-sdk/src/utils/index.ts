/**
 * FHEVM SDK Utility Functions
 */

/**
 * Format encrypted handle for display
 */
export function formatHandle(handle: string, length: number = 8): string {
  if (!handle || !handle.startsWith('0x')) return '';
  return `${handle.slice(0, length + 2)}...${handle.slice(-length)}`;
}

/**
 * Format address for display
 */
export function formatAddress(address: string, length: number = 6): string {
  if (!address || !address.startsWith('0x')) return '';
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Convert to hex string
 */
export function toHex(value: number | bigint): string {
  return '0x' + value.toString(16);
}

/**
 * Convert from hex string
 */
export function fromHex(hex: string): bigint {
  return BigInt(hex);
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts - 1) {
        await sleep(delayMs * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Batch array into chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Create logger with prefix
 */
export function createLogger(prefix: string) {
  return {
    info: (...args: any[]) => console.log(`[${prefix}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${prefix}]`, ...args),
    error: (...args: any[]) => console.error(`[${prefix}]`, ...args),
    debug: (...args: any[]) => console.debug(`[${prefix}]`, ...args),
  };
}

/**
 * Parse error message
 */
export function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(value: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * FHEVM Instance Creation and Management
 */

import { BrowserProvider, JsonRpcProvider } from 'ethers';
import type { FhevmConfig, FhevmInstance, NetworkConfig, SupportedNetwork } from '../types';
import { InitializationError } from '../types';

/**
 * Default network configurations
 */
const DEFAULT_NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    gatewayUrl: 'https://gateway.sepolia.fhevm.io',
  },
  localhost: {
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    gatewayUrl: 'http://localhost:8545',
  },
  mainnet: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    gatewayUrl: 'https://gateway.fhevm.io',
  },
  custom: {
    chainId: 0,
    rpcUrl: '',
  },
};

/**
 * Create FHEVM instance
 *
 * @example
 * ```typescript
 * // With Ethereum provider (MetaMask)
 * const fhevm = await createFhevmInstance({
 *   network: 'sepolia',
 *   contractAddress: '0x1234...',
 * });
 *
 * // With custom RPC provider
 * const fhevm = await createFhevmInstance({
 *   network: 'custom',
 *   contractAddress: '0x1234...',
 *   networkConfig: {
 *     chainId: 9000,
 *     rpcUrl: 'https://custom-rpc.com',
 *     gatewayUrl: 'https://custom-gateway.com',
 *   },
 * });
 * ```
 */
export async function createFhevmInstance(config: FhevmConfig): Promise<FhevmInstance> {
  try {
    // Get network configuration
    const networkConfig = config.networkConfig || DEFAULT_NETWORKS[config.network];

    if (!networkConfig) {
      throw new InitializationError('Invalid network configuration', {
        network: config.network,
      });
    }

    // Initialize provider
    let provider: BrowserProvider | JsonRpcProvider;

    if (config.provider) {
      provider = config.provider;
    } else if (typeof window !== 'undefined' && (window as any).ethereum) {
      // Browser environment with injected provider
      provider = new BrowserProvider((window as any).ethereum);
    } else {
      // Use RPC provider
      provider = new JsonRpcProvider(networkConfig.rpcUrl);
    }

    // Get signer if available
    const signer = config.signer || (await getSigner(provider));

    // Initialize fhevmjs instance (lazy import to support SSR)
    const fhevmjs = await import('fhevmjs');
    const instance = await fhevmjs.createInstance({
      chainId: networkConfig.chainId,
      publicKey: config.publicKey,
      gatewayUrl: config.gatewayUrl || networkConfig.gatewayUrl,
    });

    // Get network chain ID
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    // Validate chain ID matches
    if (networkConfig.chainId !== 0 && chainId !== networkConfig.chainId) {
      throw new InitializationError('Chain ID mismatch', {
        expected: networkConfig.chainId,
        actual: chainId,
      });
    }

    return {
      instance,
      provider,
      signer,
      contractAddress: config.contractAddress,
      publicKey: config.publicKey || '',
      chainId,
      network: config.network,
    };
  } catch (error) {
    if (error instanceof InitializationError) {
      throw error;
    }
    throw new InitializationError('Failed to create FHEVM instance', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get signer from provider
 */
async function getSigner(provider: BrowserProvider | JsonRpcProvider) {
  try {
    if ('getSigner' in provider) {
      return await provider.getSigner();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if FHEVM is supported in current environment
 */
export function isFhevmSupported(): boolean {
  // Check for WebAssembly support (required for fhevmjs)
  if (typeof WebAssembly === 'undefined') {
    return false;
  }

  return true;
}

/**
 * Get default network configuration
 */
export function getNetworkConfig(network: SupportedNetwork): NetworkConfig {
  return DEFAULT_NETWORKS[network];
}

/**
 * Validate FHEVM instance
 */
export function validateInstance(instance: FhevmInstance): boolean {
  return !!(
    instance.instance &&
    instance.provider &&
    instance.contractAddress &&
    instance.chainId > 0
  );
}

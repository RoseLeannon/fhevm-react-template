/**
 * FHEVM Contract Interaction Utilities
 */

import { Contract, InterfaceAbi } from 'ethers';
import type { FhevmInstance, ContractCallOptions, EncryptedData } from '../types';
import { ContractError } from '../types';

/**
 * Create contract instance with FHEVM support
 *
 * @example
 * ```typescript
 * const contract = createContract(fhevm, contractAddress, abi);
 * const result = await contract.myFunction();
 * ```
 */
export function createContract(
  instance: FhevmInstance,
  address: string,
  abi: InterfaceAbi
): Contract {
  try {
    const signerOrProvider = instance.signer || instance.provider;
    return new Contract(address, abi, signerOrProvider);
  } catch (error) {
    throw new ContractError('Failed to create contract instance', {
      address,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Call contract function with encrypted inputs
 *
 * @example
 * ```typescript
 * const encrypted = await encryptUint8(fhevm, contractAddress, 42);
 * const tx = await callContractFunction(
 *   contract,
 *   'submitReport',
 *   [encrypted.data, encrypted.handles[0]],
 *   { gasLimit: 500000n }
 * );
 * ```
 */
export async function callContractFunction(
  contract: Contract,
  functionName: string,
  args: any[],
  options?: ContractCallOptions
): Promise<any> {
  try {
    const contractFunction = contract.getFunction(functionName);

    if (!contractFunction) {
      throw new ContractError(`Function ${functionName} not found`, {
        functionName,
      });
    }

    // Build transaction options
    const txOptions: any = {};
    if (options?.gasLimit) txOptions.gasLimit = options.gasLimit;
    if (options?.value) txOptions.value = options.value;

    // Call contract function
    const tx = await contractFunction(...args, txOptions);

    return tx;
  } catch (error) {
    throw new ContractError(`Failed to call function ${functionName}`, {
      functionName,
      args,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Call contract view function
 */
export async function callViewFunction(
  contract: Contract,
  functionName: string,
  args: any[] = []
): Promise<any> {
  try {
    const contractFunction = contract.getFunction(functionName);

    if (!contractFunction) {
      throw new ContractError(`Function ${functionName} not found`, {
        functionName,
      });
    }

    return await contractFunction(...args);
  } catch (error) {
    throw new ContractError(`Failed to call view function ${functionName}`, {
      functionName,
      args,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Submit transaction with encrypted inputs
 *
 * @example
 * ```typescript
 * const tx = await submitEncryptedTransaction(
 *   fhevm,
 *   contract,
 *   'submitReport',
 *   { speed: 80, congestion: 60 },
 *   { gasLimit: 500000n }
 * );
 * await tx.wait();
 * ```
 */
export async function submitEncryptedTransaction(
  instance: FhevmInstance,
  contract: Contract,
  functionName: string,
  encryptedInputs: EncryptedData,
  options?: ContractCallOptions
): Promise<any> {
  try {
    // Call contract with encrypted data
    return await callContractFunction(
      contract,
      functionName,
      [encryptedInputs.data, ...encryptedInputs.handles],
      options
    );
  } catch (error) {
    throw new ContractError('Failed to submit encrypted transaction', {
      functionName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(tx: any, confirmations: number = 1): Promise<any> {
  try {
    return await tx.wait(confirmations);
  } catch (error) {
    throw new ContractError('Transaction failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Estimate gas for contract call
 */
export async function estimateGas(
  contract: Contract,
  functionName: string,
  args: any[]
): Promise<bigint> {
  try {
    const contractFunction = contract.getFunction(functionName);

    if (!contractFunction) {
      throw new ContractError(`Function ${functionName} not found`, {
        functionName,
      });
    }

    return await contractFunction.estimateGas(...args);
  } catch (error) {
    throw new ContractError(`Failed to estimate gas for ${functionName}`, {
      functionName,
      args,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get contract event logs
 */
export async function getEventLogs(
  contract: Contract,
  eventName: string,
  fromBlock?: number,
  toBlock?: number
): Promise<any[]> {
  try {
    const filter = contract.filters[eventName];

    if (!filter) {
      throw new ContractError(`Event ${eventName} not found`, {
        eventName,
      });
    }

    return await contract.queryFilter(filter(), fromBlock, toBlock);
  } catch (error) {
    throw new ContractError(`Failed to get event logs for ${eventName}`, {
      eventName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Listen to contract events
 *
 * @example
 * ```typescript
 * const unsubscribe = listenToEvent(contract, 'ReportSubmitted', (event) => {
 *   console.log('New report:', event.args);
 * });
 *
 * // Stop listening
 * unsubscribe();
 * ```
 */
export function listenToEvent(
  contract: Contract,
  eventName: string,
  callback: (event: any) => void
): () => void {
  try {
    contract.on(eventName, callback);

    // Return unsubscribe function
    return () => {
      contract.off(eventName, callback);
    };
  } catch (error) {
    throw new ContractError(`Failed to listen to event ${eventName}`, {
      eventName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if address has permission (ACL check)
 */
export async function hasPermission(
  contract: Contract,
  userAddress: string,
  permissionType: string
): Promise<boolean> {
  try {
    // Check if contract has isAuthorized or similar function
    const checkFunction = contract.getFunction('isAuthorized') || contract.getFunction('hasRole');

    if (!checkFunction) {
      throw new ContractError('Permission check function not found', {
        userAddress,
        permissionType,
      });
    }

    return await checkFunction(userAddress);
  } catch (error) {
    throw new ContractError('Failed to check permission', {
      userAddress,
      permissionType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

# API Reference

Complete API documentation for FHEVM Universal SDK.

## Table of Contents

- [Core Functions](#core-functions)
- [React Hooks](#react-hooks)
- [Vue Composables](#vue-composables)
- [Types](#types)
- [Utilities](#utilities)

---

## Core Functions

### `createFhevmInstance(config)`

Initialize FHEVM instance.

**Parameters:**
- `config` (FhevmConfig): Configuration object
  - `network` (SupportedNetwork): 'sepolia' | 'localhost' | 'mainnet' | 'custom'
  - `contractAddress` (string): Smart contract address
  - `provider?` (BrowserProvider | JsonRpcProvider): Optional provider
  - `signer?` (Signer): Optional signer
  - `networkConfig?` (NetworkConfig): Optional network config

**Returns:** `Promise<FhevmInstance>`

**Example:**
```typescript
const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x1234...',
});
```

---

### `createEncryptedInput(instance, address)`

Create encrypted input builder.

**Parameters:**
- `instance` (FhevmInstance): FHEVM instance
- `address` (string): Contract address

**Returns:** `EncryptedInput`

**Methods:**
- `add8(value: number)` - Add uint8 value
- `add16(value: number)` - Add uint16 value
- `add32(value: number)` - Add uint32 value
- `add64(value: bigint)` - Add uint64 value
- `add128(value: bigint)` - Add uint128 value
- `add256(value: bigint)` - Add uint256 value
- `addAddress(value: string)` - Add address
- `addBool(value: boolean)` - Add boolean
- `encrypt()` - Encrypt and return data

**Example:**
```typescript
const input = createEncryptedInput(fhevm, contractAddress)
  .add8(42)
  .add16(1000)
  .addBool(true);

const encrypted = await input.encrypt();
```

---

### `batchEncrypt(instance, address, values)`

Encrypt multiple values at once.

**Parameters:**
- `instance` (FhevmInstance): FHEVM instance
- `address` (string): Contract address
- `values` (Record<string, { type: string; value: any }>): Values to encrypt

**Returns:** `Promise<EncryptedData>`

**Example:**
```typescript
const encrypted = await batchEncrypt(fhevm, contractAddress, {
  congestion: { type: 'uint8', value: 75 },
  speed: { type: 'uint16', value: 60 },
  active: { type: 'bool', value: true },
});
```

---

### `decrypt(instance, request)`

Decrypt a single value.

**Parameters:**
- `instance` (FhevmInstance): FHEVM instance
- `request` (DecryptionRequest): Decryption request
  - `contractAddress` (string): Contract address
  - `handle` (string): Encrypted handle
  - `userAddress` (string): User address

**Returns:** `Promise<DecryptedData>`

**Example:**
```typescript
const result = await decrypt(fhevm, {
  contractAddress: '0x...',
  handle: '0xabcd...',
  userAddress: '0x...',
});

console.log(result.value); // Decrypted value
console.log(result.type);  // 'uint8' | 'uint16' | etc.
```

---

### `createContract(instance, address, abi)`

Create contract instance.

**Parameters:**
- `instance` (FhevmInstance): FHEVM instance
- `address` (string): Contract address
- `abi` (InterfaceAbi): Contract ABI

**Returns:** `Contract`

**Example:**
```typescript
const contract = createContract(fhevm, contractAddress, abi);
```

---

### `callContractFunction(contract, functionName, args, options?)`

Call contract function.

**Parameters:**
- `contract` (Contract): Contract instance
- `functionName` (string): Function name
- `args` (any[]): Function arguments
- `options?` (ContractCallOptions): Optional call options
  - `gasLimit?` (bigint): Gas limit
  - `value?` (bigint): ETH value

**Returns:** `Promise<TransactionResponse>`

**Example:**
```typescript
const tx = await callContractFunction(
  contract,
  'submitReport',
  [region, encrypted.data, ...encrypted.handles],
  { gasLimit: 500000n }
);

await tx.wait();
```

---

## React Hooks

### `useFhevm(config)`

FHEVM instance management hook.

**Parameters:**
- `config` (FhevmConfig): Configuration object

**Returns:**
```typescript
{
  fhevm: FhevmInstance | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
}
```

**Example:**
```typescript
const { fhevm, isInitialized, error } = useFhevm({
  network: 'sepolia',
  contractAddress: '0x...',
});
```

---

### `useEncrypt(fhevm)`

Encryption hook.

**Parameters:**
- `fhevm` (FhevmInstance | null): FHEVM instance

**Returns:**
```typescript
{
  encrypt: (address: string, values: Record<string, any>) => Promise<EncryptedData | null>;
  createInput: (address: string) => EncryptedInput;
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example:**
```typescript
const { encrypt, isEncrypting } = useEncrypt(fhevm);

const encrypted = await encrypt(contractAddress, {
  value: { type: 'uint8', value: 42 },
});
```

---

### `useDecrypt(fhevm)`

Decryption hook.

**Parameters:**
- `fhevm` (FhevmInstance | null): FHEVM instance

**Returns:**
```typescript
{
  decrypt: (request: DecryptionRequest) => Promise<DecryptedData | null>;
  decryptBatch: (requests: DecryptionRequest[]) => Promise<DecryptedData[] | null>;
  isDecrypting: boolean;
  error: Error | null;
}
```

---

### `useContract(fhevm, address, abi)`

Contract interaction hook.

**Parameters:**
- `fhevm` (FhevmInstance | null): FHEVM instance
- `address` (string): Contract address
- `abi` (InterfaceAbi): Contract ABI

**Returns:**
```typescript
{
  contract: Contract | null;
  call: (functionName: string, args: any[], options?: any) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
}
```

---

### `useWallet()`

Wallet connection hook.

**Returns:**
```typescript
{
  isConnected: boolean;
  address: string;
  chainId: number;
  connect: () => Promise<void>;
}
```

**Example:**
```typescript
const { connect, isConnected, address } = useWallet();

if (!isConnected) {
  await connect();
}
```

---

### `useContractEvent(contract, eventName, callback)`

Event listener hook.

**Parameters:**
- `contract` (Contract | null): Contract instance
- `eventName` (string): Event name
- `callback` (Function): Event callback

**Example:**
```typescript
useContractEvent(contract, 'ReportSubmitted', (event) => {
  console.log('New report:', event);
});
```

---

## Vue Composables

Vue composables have the same API as React hooks but use Vue's reactivity system.

### Example

```vue
<script setup>
import { useFhevm, useEncrypt } from '@fhevm/universal-sdk/vue';

const { fhevm, isInitialized } = useFhevm({
  network: 'sepolia',
  contractAddress: '0x...',
});

const { encrypt, isEncrypting } = useEncrypt(fhevm);
</script>
```

See [Vue Guide](./vue-guide.md) for details.

---

## Types

### `FhevmConfig`

```typescript
interface FhevmConfig {
  network: SupportedNetwork;
  contractAddress: string;
  provider?: BrowserProvider | JsonRpcProvider;
  signer?: Signer;
  networkConfig?: NetworkConfig;
  publicKey?: string;
  gatewayUrl?: string;
}
```

### `FhevmInstance`

```typescript
interface FhevmInstance {
  instance: any;
  provider: BrowserProvider | JsonRpcProvider;
  signer?: Signer;
  contractAddress: string;
  publicKey: string;
  chainId: number;
  network: SupportedNetwork;
}
```

### `EncryptedData`

```typescript
interface EncryptedData {
  data: Uint8Array;
  handles: string[];
}
```

### `DecryptedData`

```typescript
interface DecryptedData {
  value: bigint | number | boolean | string;
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address' | 'bool';
}
```

---

## Utilities

### `formatHandle(handle, length?)`

Format encrypted handle for display.

```typescript
const formatted = formatHandle('0xabcdef...', 8);
// '0xabcdef...abcdef'
```

### `formatAddress(address, length?)`

Format address for display.

```typescript
const formatted = formatAddress('0x1234...', 6);
// '0x1234...1234'
```

### `isValidAddress(address)`

Validate Ethereum address.

```typescript
if (isValidAddress(address)) {
  // Valid address
}
```

### `retry(fn, maxAttempts?, delayMs?)`

Retry async operation with exponential backoff.

```typescript
const result = await retry(
  async () => await someOperation(),
  3,    // max attempts
  1000  // initial delay
);
```

---

## Error Types

### `FhevmError`

Base error class.

```typescript
class FhevmError extends Error {
  code: string;
  context?: Record<string, any>;
}
```

### `InitializationError`

Thrown during FHEVM initialization.

### `EncryptionError`

Thrown during encryption.

### `DecryptionError`

Thrown during decryption.

### `ContractError`

Thrown during contract interaction.

---

## Next Steps

- [Best Practices](./best-practices.md)
- [Examples](../examples/)
- [Troubleshooting](./troubleshooting.md)

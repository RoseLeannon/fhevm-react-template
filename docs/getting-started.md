# Getting Started with FHEVM Universal SDK

This guide will help you get started with the FHEVM Universal SDK in less than 5 minutes.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18 or higher
- **npm**, **yarn**, or **pnpm**
- A **MetaMask** wallet (or compatible Web3 wallet)
- **Sepolia testnet** ETH for testing

## Installation

Install the SDK using your preferred package manager:

```bash
# npm
npm install @fhevm/universal-sdk

# yarn
yarn add @fhevm/universal-sdk

# pnpm
pnpm add @fhevm/universal-sdk
```

## Quick Start

### 1. Initialize FHEVM

```typescript
import { createFhevmInstance } from '@fhevm/universal-sdk';

const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
});
```

### 2. Encrypt Data

```typescript
import { createEncryptedInput } from '@fhevm/universal-sdk';

const input = createEncryptedInput(fhevm, contractAddress)
  .add8(42)      // uint8
  .add16(1000)   // uint16
  .addBool(true); // bool

const encrypted = await input.encrypt();
```

### 3. Interact with Contract

```typescript
import { createContract, callContractFunction } from '@fhevm/universal-sdk';

const contract = createContract(fhevm, contractAddress, abi);

const tx = await callContractFunction(
  contract,
  'myFunction',
  [encrypted.data, ...encrypted.handles]
);

await tx.wait();
```

## Framework-Specific Guides

### React

```typescript
import { useFhevm, useEncrypt } from '@fhevm/universal-sdk/react';

function App() {
  const { fhevm, isInitialized } = useFhevm({
    network: 'sepolia',
    contractAddress: '0x...',
  });

  const { encrypt, isEncrypting } = useEncrypt(fhevm);

  // Use encrypt in your component
}
```

[Full React Guide →](./react-guide.md)

### Vue

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

[Full Vue Guide →](./vue-guide.md)

### Node.js

```typescript
import { createFhevmInstance, batchEncrypt } from '@fhevm/universal-sdk';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/...');

const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
  provider,
});

const encrypted = await batchEncrypt(fhevm, contractAddress, {
  value1: { type: 'uint8', value: 42 },
  value2: { type: 'uint16', value: 1000 },
});
```

[Full Node.js Guide →](./nodejs-guide.md)

## Next Steps

- [Core Concepts](./core-concepts.md) - Understand FHEVM fundamentals
- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](../examples/) - Real-world examples
- [Best Practices](./best-practices.md) - Tips and patterns

## Common Issues

### Issue: "FHEVM instance not initialized"

Make sure you await the `createFhevmInstance` call:

```typescript
// ❌ Wrong
const fhevm = createFhevmInstance({ ... });

// ✅ Correct
const fhevm = await createFhevmInstance({ ... });
```

### Issue: "No provider detected"

In browser environments, make sure MetaMask is installed:

```typescript
if (!window.ethereum) {
  alert('Please install MetaMask');
}
```

### Issue: "Transaction failed"

Check gas limits and ensure contract address is correct:

```typescript
const tx = await call('myFunction', args, {
  gasLimit: 500000n // Specify gas limit
});
```

## Support

- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)
- [Discord Community](https://discord.gg/zama)
- [Documentation](../README.md)

---

**Next**: [Core Concepts →](./core-concepts.md)

# @fhevm/universal-sdk

> Framework-agnostic SDK for building confidential smart contract frontends

## Quick Start

```bash
npm install @fhevm/universal-sdk
```

```typescript
import { createFhevmInstance, encrypt } from '@fhevm/universal-sdk';

const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
});

const encrypted = await encrypt(fhevm, contractAddress, {
  value: { type: 'uint8', value: 42 },
});
```

## Features

- 🔧 **Framework Agnostic** - Works with React, Vue, Node.js, or vanilla JS
- 📦 **Unified API** - Single package for all FHEVM operations
- 🎯 **Type-Safe** - Full TypeScript support
- ⚡ **Lightweight** - ~50KB bundle size
- 🛠️ **Developer-Friendly** - Intuitive wagmi-inspired API

## Installation

```bash
npm install @fhevm/universal-sdk
# or
yarn add @fhevm/universal-sdk
# or
pnpm add @fhevm/universal-sdk
```

## Usage

### Core API

```typescript
import {
  createFhevmInstance,
  createEncryptedInput,
  encrypt,
  decrypt,
} from '@fhevm/universal-sdk';

// Initialize
const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
});

// Encrypt
const input = createEncryptedInput(fhevm, contractAddress)
  .add8(42)
  .add16(1000);
const encrypted = await input.encrypt();

// Decrypt
const result = await decrypt(fhevm, {
  contractAddress: '0x...',
  handle: '0x...',
  userAddress: '0x...',
});
```

### React Hooks

```typescript
import { useFhevm, useEncrypt, useWallet } from '@fhevm/universal-sdk/react';

function App() {
  const { connect, address } = useWallet();
  const { fhevm, isInitialized } = useFhevm({
    network: 'sepolia',
    contractAddress: '0x...',
  });
  const { encrypt } = useEncrypt(fhevm);

  // Use encrypt, fhevm, etc.
}
```

### Vue Composables

```vue
<script setup>
import { useFhevm, useEncrypt } from '@fhevm/universal-sdk/vue';

const { fhevm } = useFhevm({ network: 'sepolia', contractAddress: '0x...' });
const { encrypt } = useEncrypt(fhevm);
</script>
```

## API Reference

### Core Functions

- `createFhevmInstance(config)` - Initialize FHEVM
- `createEncryptedInput(instance, address)` - Create input builder
- `encrypt*()` - Type-specific encryption
- `decrypt*()` - Type-specific decryption
- `batchEncrypt()` - Encrypt multiple values
- `createContract()` - Create contract instance

### React Hooks

- `useFhevm()` - FHEVM instance
- `useEncrypt()` - Encryption
- `useDecrypt()` - Decryption
- `useContract()` - Contract interaction
- `useWallet()` - Wallet connection

### Vue Composables

Same as React hooks

## TypeScript Support

Full type safety with comprehensive TypeScript definitions:

```typescript
import type {
  FhevmInstance,
  EncryptedData,
  DecryptedData,
  FhevmConfig,
} from '@fhevm/universal-sdk';
```

## License

MIT

## Links

- [Documentation](../../README.md)
- [Examples](../../examples)
- [GitHub](https://github.com/zama-ai/fhevm-react-template)

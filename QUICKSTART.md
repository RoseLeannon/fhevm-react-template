# FHEVM Universal SDK - Quick Start Guide

Get started with FHEVM Universal SDK in 5 minutes!

## 📦 Installation

```bash
npm install @fhevm/universal-sdk
```

## ⚡ 30-Second Quick Start

```typescript
import { createFhevmInstance, encrypt, decrypt } from '@fhevm/universal-sdk';

// 1. Initialize (3 lines)
const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
});

// 2. Encrypt (3 lines)
const encrypted = await encrypt(fhevm, contractAddress, {
  value: { type: 'uint8', value: 42 },
});

// 3. Decrypt (4 lines)
const decrypted = await decrypt(fhevm, {
  contractAddress: '0x...',
  handle: encrypted.handles[0],
  userAddress: '0x...',
});

console.log(decrypted.value); // 42
```

**That's it! You're encrypting and decrypting with FHE in under 10 lines.**

## 🚀 Framework-Specific Examples

### React

```tsx
import { useFhevm, useEncrypt, useWallet } from '@fhevm/universal-sdk/react';

function App() {
  const { connect, address } = useWallet();
  const { fhevm } = useFhevm({
    network: 'sepolia',
    contractAddress: '0x...',
  });
  const { encrypt } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    const result = await encrypt(contractAddress, {
      value: { type: 'uint8', value: 42 },
    });
    console.log('Encrypted!', result);
  };

  return (
    <div>
      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <button onClick={handleEncrypt}>Encrypt Data</button>
      )}
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { useFhevm, useEncrypt, useWallet } from '@fhevm/universal-sdk/vue';

const { connect, address } = useWallet();
const { fhevm } = useFhevm({
  network: 'sepolia',
  contractAddress: '0x...',
});
const { encrypt } = useEncrypt(fhevm);

const handleEncrypt = async () => {
  const result = await encrypt(contractAddress, {
    value: { type: 'uint8', value: 42 },
  });
  console.log('Encrypted!', result);
};
</script>

<template>
  <div>
    <button v-if="!address" @click="connect">Connect Wallet</button>
    <button v-else @click="handleEncrypt">Encrypt Data</button>
  </div>
</template>
```

### Node.js

```typescript
import { createFhevmInstance, encrypt } from '@fhevm/universal-sdk';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY');

const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
  provider,
});

const encrypted = await encrypt(fhevm, contractAddress, {
  value: { type: 'uint8', value: 42 },
});

console.log('Encrypted data:', encrypted);
```

## 🎯 Common Use Cases

### Encrypt Multiple Values

```typescript
import { batchEncrypt } from '@fhevm/universal-sdk';

const encrypted = await batchEncrypt(fhevm, contractAddress, {
  speed: { type: 'uint8', value: 80 },
  congestion: { type: 'uint8', value: 60 },
  active: { type: 'bool', value: true },
});
```

### Submit to Smart Contract

```typescript
import { createContract, callContractFunction } from '@fhevm/universal-sdk';

const contract = createContract(fhevm, contractAddress, abi);

const tx = await callContractFunction(
  contract,
  'submitReport',
  [encrypted.data, ...encrypted.handles],
  { gasLimit: 500000n }
);

await tx.wait();
console.log('Transaction confirmed!');
```

### Decrypt Contract Data

```typescript
const decrypted = await decrypt(fhevm, {
  contractAddress: '0x...',
  handle: '0xabcd...',
  userAddress: address,
});

console.log('Decrypted value:', decrypted.value);
console.log('Type:', decrypted.type);
```

## 📚 Next Steps

### 1. Explore Examples
- **Next.js Showcase**: `examples/nextjs-showcase/`
- **Traffic Analytics**: `examples/traffic-analytics/`

### 2. Read Documentation
- **Main README**: [README.md](./README.md)
- **SDK Docs**: [packages/fhevm-sdk/README.md](./packages/fhevm-sdk/README.md)
- **API Reference**: Inline JSDoc comments

### 3. Try Live Demo
- **🚦 Traffic Analytics**: [https://traffic-aggregator.vercel.app/](https://traffic-aggregator.vercel.app/)

## 🔧 Development Setup

```bash
# Clone repository
git clone https://github.com/RoseLeannon/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK
cd packages/fhevm-sdk
npm run build

# Run Next.js example
cd ../../examples/nextjs-showcase
npm run dev
```

Open http://localhost:3000

## ❓ Common Questions

### Q: Which frameworks are supported?
**A:** React, Vue, Node.js, Next.js, Vite, and vanilla JavaScript.

### Q: Do I need to initialize WASM manually?
**A:** No! The SDK handles all initialization automatically.

### Q: Is TypeScript required?
**A:** No, but highly recommended for better DX.

### Q: What encryption types are supported?
**A:** uint8, uint16, uint32, uint64, uint128, uint256, address, bool

### Q: Can I use this in production?
**A:** Yes! The SDK is production-ready with comprehensive error handling.

### Q: How do I deploy my app?
**A:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/RoseLeannon/fhevm-react-template/issues)
- **Discord**: [Join community](https://discord.gg/zama)
- **Documentation**: [Full docs](./README.md)

## 🎉 You're Ready!

You now have everything you need to build privacy-preserving applications with FHEVM.

**Happy building!** 🚀

---

**What's next?**
- ⭐ Star the repo on GitHub
- 🔨 Build something awesome
- 🤝 Share with the community
- 💡 Contribute improvements

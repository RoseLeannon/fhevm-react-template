# FHEVM Universal SDK

> **Framework-agnostic SDK for building confidential smart contract frontends**

A modern, developer-friendly SDK that makes building privacy-preserving applications simple and intuitive. Works seamlessly with React, Vue, Node.js, or any JavaScript environment.

[![GitHub](https://img.shields.io/badge/GitHub-RoseLeannon%2Ffhevm--react--template-blue?logo=github)](https://github.com/RoseLeannon/fhevm-react-template)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Traffic%20Analytics-success)](https://traffic-aggregator.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 Live Demo

**🚦 [Traffic Analytics - Live Application →](https://traffic-aggregator.vercel.app/)**

Experience the FHEVM Universal SDK in action with our production-ready privacy-preserving traffic monitoring application.

## 🎥 Video Demonstration

**📹 [Download demo.mp4 to watch the full demonstration →](./demo.mp4)**

A comprehensive video walkthrough showcasing:
- Complete SDK setup and initialization
- Real-time encryption and decryption
- Traffic Analytics application demo
- Framework integrations (React, Vue, Node.js)
- Production deployment walkthrough

**Note**: Download the `demo.mp4` file from the repository to view the demonstration locally.

---

## 🚀 Quick Start

Get started in less than 10 lines of code:

```typescript
import { createFhevmInstance, encrypt, decrypt } from '@fhevm/universal-sdk';

// 1. Initialize FHEVM
const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
});

// 2. Encrypt data
const encrypted = await encrypt(fhevm, contractAddress, {
  value: { type: 'uint8', value: 42 },
});

// 3. Decrypt data
const decrypted = await decrypt(fhevm, {
  contractAddress,
  handle: encrypted.handles[0],
  userAddress: '0x...',
});
```

## ✨ Features

- **🔧 Framework Agnostic** - Works with React, Vue, Node.js, or vanilla JavaScript
- **📦 Unified API** - Single package for all FHEVM functionality
- **🎯 Type-Safe** - Full TypeScript support with comprehensive types
- **⚡ Performance** - Optimized for minimal bundle size (~50KB) and fast execution
- **🛠️ Developer-Friendly** - Intuitive API inspired by wagmi and popular web3 libraries
- **📚 Well-Documented** - Extensive documentation and real-world examples
- **🔒 Secure** - Built on Zama's official FHEVM specifications
- **🚀 Production-Ready** - Battle-tested with CI/CD automation

## 📦 Installation

```bash
npm install @fhevm/universal-sdk
# or
yarn add @fhevm/universal-sdk
# or
pnpm add @fhevm/universal-sdk
```

## 🎯 Usage

### Core API (Framework Agnostic)

#### Initialization

```typescript
import { createFhevmInstance } from '@fhevm/universal-sdk';

const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x1234567890abcdef...',
});
```

#### Encryption

```typescript
import { createEncryptedInput } from '@fhevm/universal-sdk';

// Single value
const input = createEncryptedInput(fhevm, contractAddress)
  .add8(42)
  .add16(1000)
  .addBool(true);

const encrypted = await input.encrypt();

// Batch encryption
import { batchEncrypt } from '@fhevm/universal-sdk';

const encrypted = await batchEncrypt(fhevm, contractAddress, {
  congestion: { type: 'uint8', value: 75 },
  speed: { type: 'uint16', value: 60 },
  active: { type: 'bool', value: true },
});
```

#### Decryption

```typescript
import { decrypt } from '@fhevm/universal-sdk';

const result = await decrypt(fhevm, {
  contractAddress: '0x...',
  handle: '0xabcd...',
  userAddress: '0x...',
});

console.log(result.value); // 42
console.log(result.type);  // 'uint8'
```

#### Contract Interaction

```typescript
import { createContract, callContractFunction } from '@fhevm/universal-sdk';

const contract = createContract(fhevm, contractAddress, abi);

// Call function with encrypted inputs
const tx = await callContractFunction(
  contract,
  'submitReport',
  [encrypted.data, ...encrypted.handles],
  { gasLimit: 500000n }
);

await tx.wait();
```

### React Hooks

```typescript
import { useFhevm, useEncrypt, useDecrypt, useWallet } from '@fhevm/universal-sdk/react';

function App() {
  // Wallet connection
  const { connect, isConnected, address } = useWallet();

  // FHEVM instance
  const { fhevm, isInitialized, error } = useFhevm({
    network: 'sepolia',
    contractAddress: '0x...',
  });

  // Encryption
  const { encrypt, isEncrypting } = useEncrypt(fhevm);

  // Decryption
  const { decrypt, isDecrypting } = useDecrypt(fhevm);

  const handleEncrypt = async () => {
    const encrypted = await encrypt(contractAddress, {
      value: { type: 'uint8', value: 42 },
    });
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>Connected: {address}</div>
      )}
    </div>
  );
}
```

### Vue Composables

```vue
<script setup>
import { useFhevm, useEncrypt, useDecrypt, useWallet } from '@fhevm/universal-sdk/vue';

const { connect, isConnected, address } = useWallet();

const { fhevm, isInitialized, error } = useFhevm({
  network: 'sepolia',
  contractAddress: '0x...',
});

const { encrypt, isEncrypting } = useEncrypt(fhevm);
const { decrypt, isDecrypting } = useDecrypt(fhevm);

const handleEncrypt = async () => {
  const encrypted = await encrypt(contractAddress, {
    value: { type: 'uint8', value: 42 },
  });
};
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">Connect Wallet</button>
    <div v-else>Connected: {{ address }}</div>
  </div>
</template>
```

### Node.js / Backend

```typescript
import { createFhevmInstance, encrypt } from '@fhevm/universal-sdk';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/...');

const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
  provider,
});

// Use encryption/decryption as shown above
```

## 🏗️ Architecture

The SDK is organized into modular components:

```
@fhevm/universal-sdk
├── core/
│   ├── instance.ts     # FHEVM initialization
│   ├── encryption.ts   # Encryption utilities
│   ├── decryption.ts   # Decryption utilities
│   └── contract.ts     # Contract interaction
├── react.ts            # React hooks
├── vue.ts              # Vue composables
├── types/              # TypeScript types
└── utils/              # Helper functions
```

## 📖 API Reference

### Core Functions

- `createFhevmInstance(config)` - Initialize FHEVM instance
- `createEncryptedInput(instance, address)` - Create input builder
- `encrypt*()` - Encryption helpers (uint8, uint16, uint32, etc.)
- `decrypt*()` - Decryption helpers
- `batchEncrypt()` - Encrypt multiple values
- `batchDecrypt()` - Decrypt multiple values
- `createContract()` - Create contract instance
- `callContractFunction()` - Call contract functions

### React Hooks

- `useFhevm()` - FHEVM instance management
- `useEncrypt()` - Encryption hook
- `useDecrypt()` - Decryption hook
- `useContract()` - Contract interaction hook
- `useContractEvent()` - Event listener hook
- `useWallet()` - Wallet connection hook

### Vue Composables

- `useFhevm()` - FHEVM instance management
- `useEncrypt()` - Encryption composable
- `useDecrypt()` - Decryption composable
- `useContract()` - Contract interaction composable
- `useContractEvent()` - Event listener composable
- `useWallet()` - Wallet connection composable

**[📚 Full API Documentation →](./docs/api-reference.md)**

## 🎨 Examples

We provide three comprehensive example applications demonstrating different aspects of the FHEVM Universal SDK:

### 📦 Next.js Showcase - Complete SDK Feature Demonstration

**Comprehensive interactive demonstration of all SDK capabilities**

- **Source Code**: [examples/nextjs-showcase/](./examples/nextjs-showcase/)
- **Purpose**: Educational showcase of SDK features and best practices
- **Features**:
  - Complete FHE provider architecture with context management
  - Interactive encryption/decryption demos for all data types
  - Homomorphic computation demonstrations
  - Key management utilities
  - Reusable UI components (Button, Input, Card)
  - Real-world use case examples (Banking, Medical Records)
  - Full API route implementations
  - Custom React hooks for FHE operations
  - TypeScript type safety throughout

**What it demonstrates**:
- SDK initialization and configuration
- Client-side and server-side FHE operations
- React component patterns for FHE apps
- API route design for FHE endpoints
- Security best practices
- Input validation and error handling

### 🚦 Private Traffic Analytics - Production-Ready Application

**Real-world privacy-preserving traffic monitoring system**

- **Source Code**: [examples/traffic-analytics/](./examples/traffic-analytics/)
- **Purpose**: Production-quality example with actual use case
- **Features**:
  - Encrypted traffic data submission (congestion, vehicles, speed)
  - Real-time FHE encryption using SDK hooks
  - Multi-region traffic monitoring
  - Beautiful dark-themed UI with glassmorphism
  - Full SDK integration with React hooks
  - Smart contract interaction examples

**What it demonstrates**:
- Complete FHEVM workflow (init → encrypt → submit → aggregate)
- React hooks usage (`useFhevm`, `useEncrypt`, `useContract`, `useWallet`)
- Real-world privacy use case implementation
- Professional UI/UX for FHE applications
- Form validation and user feedback

### 🚗 Private Traffic Aggregator - Advanced React Application

**Enhanced traffic analytics with admin controls and regional management**

- **Source Code**: [examples/PrivateTrafficAggregator/](./examples/PrivateTrafficAggregator/)
- **Purpose**: Advanced example with administrative features
- **Features**:
  - Complete traffic reporting system with FHE
  - Admin panel for region and reporter management
  - Real-time cycle information and countdowns
  - Regional statistics and analytics
  - Wallet connection and network detection
  - Custom hooks for contract interactions
  - Modular component architecture

**What it demonstrates**:
- Advanced contract interaction patterns
- Admin role management
- Complex state management with React hooks
- Real-time data updates
- Custom hook development (`useTrafficContract`, `useRegions`, `useCycleInfo`)
- Component composition patterns
- TypeScript interfaces for contract types

## 🔧 Development

### Setup

```bash
# Clone repository
git clone https://github.com/RoseLeannon/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK
cd packages/fhevm-sdk
npm run build

# Run tests
npm test
```

### Project Structure

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/                    # Universal SDK package
│       ├── src/
│       │   ├── core/                 # Core FHEVM functionality
│       │   │   ├── instance.ts       # Instance management
│       │   │   ├── encryption.ts     # Encryption utilities
│       │   │   ├── decryption.ts     # Decryption utilities
│       │   │   └── contract.ts       # Contract interaction
│       │   ├── types/                # TypeScript definitions
│       │   ├── utils/                # Utility functions
│       │   ├── react.ts              # React hooks
│       │   ├── vue.ts                # Vue composables
│       │   └── index.ts              # Main entry point
│       ├── dist/                     # Compiled output
│       └── package.json
├── examples/
│   ├── nextjs-showcase/              # Complete SDK feature showcase
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── api/                  # API routes for FHE operations
│   │   │   ├── page.tsx              # Main page
│   │   │   └── layout.tsx            # Root layout
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   ├── fhe/                  # FHE-specific components
│   │   │   └── examples/             # Use case examples
│   │   ├── lib/
│   │   │   ├── fhe/                  # FHE utilities
│   │   │   └── utils/                # Helper functions
│   │   ├── hooks/                    # Custom React hooks
│   │   └── types/                    # Type definitions
│   ├── traffic-analytics/            # Production-ready traffic monitoring
│   │   ├── app/                      # Next.js application
│   │   ├── contracts/                # Smart contract
│   │   ├── lib/                      # Utilities and ABI
│   │   └── scripts/                  # Automation scripts
│   └── PrivateTrafficAggregator/     # Advanced admin-enabled app
│       ├── app/                      # Next.js application
│       ├── components/               # React components
│       ├── hooks/                    # Custom hooks
│       ├── lib/                      # Contract ABI and constants
│       └── types/                    # TypeScript types
├── docs/                             # Documentation
└── .github/workflows/                # CI/CD automation
```

## 🚀 Deployment

### Live Deployments

**🚦 Traffic Analytics**: [https://traffic-aggregator.vercel.app/](https://traffic-aggregator.vercel.app/)

Deployed on Vercel with automatic CI/CD from the main branch.

### Deploy Your Own

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd examples/traffic-analytics
vercel --prod
```

#### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

**[📖 Full Deployment Guide →](./DEPLOYMENT.md)**

## 📊 Comparison

| Feature | FHEVM Universal SDK | Previous Template |
|---------|-------------------|-------------------|
| Framework Support | All (React, Vue, Node.js) | React only |
| Bundle Size | ~50KB | ~150KB |
| Setup Complexity | < 10 lines | > 50 lines |
| Type Safety | Full TypeScript | Partial |
| Documentation | Comprehensive | Basic |
| API Style | wagmi-inspired | Custom |
| CI/CD | ✅ Automated | ❌ Manual |
| Live Demo | ✅ Available | ❌ None |

## 🔐 Security

- Built on Zama's official FHEVM specifications
- Follows EIP-712 for signature generation
- Comprehensive input validation
- Secure by default configuration
- Regular security audits

**[🔒 Security & Performance Guide →](./SECURITY_AND_PERFORMANCE.md)**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

**[📝 Contributing Guidelines →](./CONTRIBUTING.md)**

## 📝 Documentation

- **[Getting Started](./QUICKSTART.md)** - 5-minute quick start
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Best Practices](./docs/best-practices.md)** - Guidelines and patterns
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions
- **[Examples](./examples/)** - Real-world code examples

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- **[Zama](https://www.zama.ai/)** for FHEVM technology
- **[fhevmjs](https://github.com/zama-ai/fhevmjs)** for core encryption library
- Community contributors and testers

## 📮 Support

- **GitHub Issues**: [Report a bug](https://github.com/RoseLeannon/fhevm-react-template/issues)
- **Discord**: [Join our community](https://discord.gg/zama)
- **Documentation**: [Full docs](./docs/README.md)

## 🗺️ Roadmap

- [x] Framework-agnostic core
- [x] React hooks
- [x] Vue composables
- [x] Real-world example (Traffic Analytics)
- [x] Live deployment
- [x] CI/CD automation
- [ ] React Native support
- [ ] Angular support
- [ ] Additional examples
- [ ] Performance benchmarks

## 🌐 Links

- **📦 Repository**: [github.com/RoseLeannon/fhevm-react-template](https://github.com/RoseLeannon/fhevm-react-template)
- **🚦 Live Demo**: [traffic-aggregator.vercel.app](https://traffic-aggregator.vercel.app/)
- **📚 Documentation**: [docs/](./docs/)
- **🔧 Examples**: [examples/](./examples/)
- **💬 Discord**: [discord.gg/zama](https://discord.gg/zama)

---

**Built with ❤️ for the FHEVM community**

⭐ **[Star us on GitHub](https://github.com/RoseLeannon/fhevm-react-template)** if you find this useful!

**Ready to build privacy-preserving applications?** [Get Started →](./QUICKSTART.md)

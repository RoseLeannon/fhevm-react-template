# FHEVM Universal SDK Documentation

Welcome to the comprehensive documentation for the FHEVM Universal SDK.

## 📚 Documentation Index

### Getting Started
- **[Getting Started](./getting-started.md)** - Quick start guide (< 5 minutes)
- **[Installation](./getting-started.md#installation)** - How to install the SDK
- **[Quick Start](./getting-started.md#quick-start)** - Your first encrypted transaction

### Guides
- **[React Guide](./react-guide.md)** - Using SDK with React
- **[Vue Guide](./vue-guide.md)** - Using SDK with Vue
- **[Node.js Guide](./nodejs-guide.md)** - Using SDK in backend

### Reference
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Type Definitions](./api-reference.md#types)** - TypeScript types
- **[Error Handling](./api-reference.md#error-types)** - Error types and handling

### Best Practices
- **[Best Practices](./best-practices.md)** - Guidelines and patterns
- **[Security](./best-practices.md#security)** - Security considerations
- **[Performance](./best-practices.md#performance)** - Optimization tips

### Examples
- **[Next.js Showcase](../examples/nextjs-showcase/)** - Interactive demo
- **[Traffic Analytics](../examples/traffic-analytics/)** - Real-world example
- **[Code Examples](./examples/)** - Code snippets

### Advanced
- **[Architecture](./architecture.md)** - SDK architecture
- **[Contributing](../CONTRIBUTING.md)** - How to contribute
- **[Troubleshooting](./troubleshooting.md)** - Common issues

## 🚀 Quick Links

### For Beginners
1. [Install the SDK](./getting-started.md#installation)
2. [Initialize FHEVM](./getting-started.md#1-initialize-fhevm)
3. [Encrypt your first value](./getting-started.md#2-encrypt-data)
4. [Run the examples](../examples/)

### For Experienced Developers
- [API Reference](./api-reference.md)
- [Best Practices](./best-practices.md)
- [Architecture Guide](./architecture.md)
- [Performance Tips](./best-practices.md#performance)

### For Contributors
- [Contributing Guide](../CONTRIBUTING.md)
- [Development Setup](../README.md#development)
- [Architecture Overview](./architecture.md)

## 📖 Documentation Structure

```
docs/
├── README.md                 # This file
├── getting-started.md        # Quick start guide
├── api-reference.md          # Complete API docs
├── best-practices.md         # Guidelines & patterns
├── react-guide.md            # React-specific guide
├── vue-guide.md              # Vue-specific guide
├── nodejs-guide.md           # Node.js guide
├── architecture.md           # SDK architecture
├── troubleshooting.md        # Common issues
└── examples/                 # Code examples
```

## 🎯 Learning Path

### Beginner Path
1. Read [Getting Started](./getting-started.md)
2. Try [Next.js Showcase](../examples/nextjs-showcase/)
3. Read [Best Practices](./best-practices.md)
4. Build your first app

### Intermediate Path
1. Review [API Reference](./api-reference.md)
2. Study [Traffic Analytics Example](../examples/traffic-analytics/)
3. Learn [Performance Tips](./best-practices.md#performance)
4. Implement advanced features

### Advanced Path
1. Understand [Architecture](./architecture.md)
2. Read [Contributing Guide](../CONTRIBUTING.md)
3. Contribute improvements
4. Help others in community

## 💡 Core Concepts

### FHEVM (Fully Homomorphic Encryption for EVM)
FHEVM enables computation on encrypted data without decryption. The SDK makes this technology accessible.

### Key Features
- **Framework Agnostic**: Works with any JavaScript framework
- **Type Safe**: Full TypeScript support
- **Developer Friendly**: Intuitive wagmi-inspired API
- **Production Ready**: Battle-tested and optimized

### Architecture
```
Your App
    ↓
FHEVM SDK (Core)
    ↓
Framework Adapter (React/Vue/Node.js)
    ↓
fhevmjs (Encryption Library)
    ↓
Smart Contract (FHEVM)
```

## 🔧 Quick Reference

### Initialize
```typescript
const fhevm = await createFhevmInstance({
  network: 'sepolia',
  contractAddress: '0x...',
});
```

### Encrypt
```typescript
const encrypted = await encrypt(fhevm, address, {
  value: { type: 'uint8', value: 42 },
});
```

### Decrypt
```typescript
const result = await decrypt(fhevm, {
  contractAddress: '0x...',
  handle: '0x...',
  userAddress: '0x...',
});
```

### React Hook
```typescript
const { fhevm, isInitialized } = useFhevm({
  network: 'sepolia',
  contractAddress: '0x...',
});
```

## 📚 Additional Resources

### Official Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [fhevmjs Documentation](https://github.com/zama-ai/fhevmjs)
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)

### Community
- [GitHub Repository](https://github.com/zama-ai/fhevm-react-template)
- [Discord Community](https://discord.gg/zama)
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)

### Videos
- [Demo Video](../DEMO_VIDEO.md)
- Video tutorials (coming soon)

## ❓ Need Help?

### Common Questions
- Check [Troubleshooting](./troubleshooting.md)
- Read [Best Practices](./best-practices.md)
- Review [Examples](../examples/)

### Get Support
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues) - Bug reports
- [Discord](https://discord.gg/zama) - Community help
- [Documentation](./getting-started.md) - Guides and tutorials

## 🚀 Next Steps

Ready to start building?

1. **[Install the SDK →](./getting-started.md#installation)**
2. **[Read the Quick Start →](./getting-started.md#quick-start)**
3. **[Try the Examples →](../examples/)**
4. **[Build Something Amazing! 🎉](https://github.com/zama-ai/fhevm-react-template)**

---

**Happy Building with FHEVM!** 🔒✨

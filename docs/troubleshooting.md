# Troubleshooting Guide

Common issues and solutions when using the FHEVM Universal SDK.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Initialization Errors](#initialization-errors)
- [Encryption Problems](#encryption-problems)
- [Contract Interaction](#contract-interaction)
- [Wallet Connection](#wallet-connection)
- [Build and Deploy](#build-and-deploy)

---

## Installation Issues

### Error: Cannot find module '@fhevm/universal-sdk'

**Cause**: SDK not installed or not in node_modules

**Solution**:
```bash
# Install the SDK
npm install @fhevm/universal-sdk

# Or clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: Peer dependencies not met

**Cause**: Missing peer dependencies (ethers, react, vue)

**Solution**:
```bash
# For React apps
npm install ethers@^6.0.0 react@^18.0.0

# For Vue apps
npm install ethers@^6.0.0 vue@^3.0.0

# For Node.js
npm install ethers@^6.0.0
```

---

## Initialization Errors

### Error: "FHEVM instance not initialized"

**Cause**: Trying to use FHEVM before initialization completes

**Solution**:
```typescript
// ❌ Wrong - Not awaiting
const fhevm = createFhevmInstance({ ... });
encrypt(fhevm, ...); // Error!

// ✅ Correct - Await initialization
const fhevm = await createFhevmInstance({ ... });
encrypt(fhevm, ...); // Works!
```

### Error: "Invalid network configuration"

**Cause**: Unsupported network or missing configuration

**Solution**:
```typescript
// ✅ Use supported networks
const fhevm = await createFhevmInstance({
  network: 'sepolia', // or 'localhost', 'mainnet'
  contractAddress: '0x...',
});

// ✅ Or provide custom config
const fhevm = await createFhevmInstance({
  network: 'custom',
  contractAddress: '0x...',
  networkConfig: {
    chainId: 9000,
    rpcUrl: 'https://custom-rpc.com',
  },
});
```

### Error: "Chain ID mismatch"

**Cause**: Wallet connected to different network

**Solution**:
```typescript
// Check current network
const { chainId } = useWallet();

if (chainId !== 11155111) { // Sepolia
  alert('Please switch to Sepolia network');
}
```

---

## Encryption Problems

### Error: "Failed to create encrypted input"

**Cause**: Invalid contract address or FHEVM instance

**Solution**:
```typescript
// ✅ Verify contract address
if (!isValidAddress(contractAddress)) {
  throw new Error('Invalid contract address');
}

// ✅ Ensure FHEVM is initialized
if (!fhevm) {
  throw new Error('FHEVM not initialized');
}
```

### Error: "Invalid encryption type"

**Cause**: Unsupported data type

**Solution**:
```typescript
// ✅ Use supported types
const encrypted = await encrypt(fhevm, address, {
  value: { type: 'uint8', value: 42 }, // Supported types:
  // uint8, uint16, uint32, uint64, uint128, uint256, address, bool
});

// ❌ Don't use unsupported types
const encrypted = await encrypt(fhevm, address, {
  value: { type: 'string', value: 'hello' }, // Not supported!
});
```

### Error: "Value out of range"

**Cause**: Value exceeds type limits

**Solution**:
```typescript
// ✅ Respect type limits
// uint8: 0-255
await encrypt(fhevm, address, {
  value: { type: 'uint8', value: 100 } // OK
});

// ❌ Value too large
await encrypt(fhevm, address, {
  value: { type: 'uint8', value: 300 } // Error!
});
```

---

## Contract Interaction

### Error: "Transaction reverted"

**Cause**: Contract function failed

**Solution**:
```typescript
// ✅ Check requirements
// 1. Verify you're authorized
const isAuthorized = await contract.isAuthorized(address);
if (!isAuthorized) {
  throw new Error('Not authorized');
}

// 2. Specify gas limit
const tx = await call('myFunction', args, {
  gasLimit: 500000n
});

// 3. Check contract state
const canSubmit = await contract.canSubmit();
```

### Error: "Insufficient gas"

**Cause**: Gas limit too low

**Solution**:
```typescript
// ✅ Estimate gas first
const estimatedGas = await estimateGas(contract, 'myFunction', args);
const gasLimit = estimatedGas * 120n / 100n; // Add 20% buffer

const tx = await call('myFunction', args, {
  gasLimit
});
```

### Error: "Nonce too low"

**Cause**: Transaction nonce out of sync

**Solution**:
```typescript
// ✅ Wait for previous transaction
const tx1 = await call('function1', args);
await tx1.wait(); // Wait for confirmation

const tx2 = await call('function2', args);
await tx2.wait();
```

---

## Wallet Connection

### Error: "No provider detected"

**Cause**: MetaMask or wallet not installed

**Solution**:
```typescript
// ✅ Check for provider
if (!window.ethereum) {
  return (
    <div>
      <p>Please install MetaMask</p>
      <a href="https://metamask.io">Download MetaMask</a>
    </div>
  );
}
```

### Error: "User rejected request"

**Cause**: User declined wallet connection

**Solution**:
```typescript
// ✅ Handle rejection gracefully
try {
  await connect();
} catch (error) {
  if (error.code === 4001) {
    // User rejected
    setError('Connection cancelled. Please try again.');
  } else {
    setError('Failed to connect wallet');
  }
}
```

### Error: "Wrong network"

**Cause**: Wallet on incorrect network

**Solution**:
```typescript
// ✅ Request network switch
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xaa36a7' }], // Sepolia
  });
} catch (error) {
  if (error.code === 4902) {
    // Network not added, add it
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xaa36a7',
        chainName: 'Sepolia',
        rpcUrls: ['https://sepolia.infura.io/v3/...'],
      }],
    });
  }
}
```

---

## Build and Deploy

### Error: "Module not found: Can't resolve '@fhevm/universal-sdk'"

**Cause**: SDK not in workspace dependencies

**Solution**:
```json
// package.json
{
  "dependencies": {
    "@fhevm/universal-sdk": "workspace:*" // For monorepo
    // OR
    "@fhevm/universal-sdk": "^1.0.0" // For standalone
  }
}
```

### Error: "WebAssembly is not defined"

**Cause**: WASM not supported in build environment

**Solution**:
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};
```

### Error: "Cannot use import statement outside a module"

**Cause**: ES modules not configured

**Solution**:
```json
// package.json
{
  "type": "module"
}

// OR tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## React-Specific Issues

### Error: "Rendered more hooks than during the previous render"

**Cause**: Conditional hook usage

**Solution**:
```typescript
// ❌ Wrong - Conditional hook
if (condition) {
  const { fhevm } = useFhevm({ ... });
}

// ✅ Correct - Always call hooks
const { fhevm } = useFhevm({ ... });
if (condition && fhevm) {
  // Use fhevm
}
```

### Error: "Cannot read properties of null"

**Cause**: Using FHEVM before initialization

**Solution**:
```typescript
// ✅ Check before using
const { fhevm, isInitialized } = useFhevm({ ... });

if (!isInitialized || !fhevm) {
  return <Loading />;
}

// Safe to use fhevm now
```

---

## Vue-Specific Issues

### Error: "Not a ref"

**Cause**: Not accessing .value property

**Solution**:
```vue
<script setup>
const { fhevm } = useFhevm({ ... });

// ❌ Wrong
encrypt(fhevm, ...);

// ✅ Correct
encrypt(fhevm.value, ...);
</script>
```

---

## Performance Issues

### Issue: Slow encryption

**Cause**: Large batch or slow network

**Solution**:
```typescript
// ✅ Show progress
setStatus('Encrypting...');
const encrypted = await encrypt(fhevm, address, values);
setStatus('Submitting...');

// ✅ Batch wisely - don't batch too many
// Split into smaller batches if needed
```

### Issue: High gas costs

**Cause**: Inefficient contract calls

**Solution**:
```typescript
// ✅ Optimize data types
// Use smallest type that fits
{ type: 'uint8', value: 100 } // Good
{ type: 'uint256', value: 100 } // Wasteful

// ✅ Batch operations in contract
// Call one function that does multiple things
// Instead of multiple separate calls
```

---

## Debugging Tips

### Enable Debug Logging

```typescript
// Enable console logging
localStorage.setItem('DEBUG', '@fhevm/*');

// Check FHEVM instance
console.log('FHEVM instance:', fhevm);
console.log('Is initialized:', isInitialized);
```

### Check Network Status

```typescript
// Verify network connection
const network = await provider.getNetwork();
console.log('Network:', network);

// Check block number
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);
```

### Verify Contract

```typescript
// Check if contract exists
const code = await provider.getCode(contractAddress);
if (code === '0x') {
  console.error('No contract at this address!');
}
```

---

## Still Having Issues?

If your issue isn't covered here:

1. **Check Examples**: Review [working examples](../examples/)
2. **Search Issues**: Look for [similar issues](https://github.com/zama-ai/fhevm-react-template/issues)
3. **Ask Community**: Join [Discord](https://discord.gg/zama)
4. **Open Issue**: Create a [new issue](https://github.com/zama-ai/fhevm-react-template/issues/new)

### When Opening an Issue

Include:
- SDK version
- Framework and version (React/Vue/Node.js)
- Error message and stack trace
- Minimal reproduction code
- Steps to reproduce

---

**Need More Help?** Check out:
- [API Reference](./api-reference.md)
- [Best Practices](./best-practices.md)
- [Examples](../examples/)

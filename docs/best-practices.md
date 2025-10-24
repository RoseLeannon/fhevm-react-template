# Best Practices

Guidelines and best practices for using the FHEVM Universal SDK.

## Table of Contents

- [General Guidelines](#general-guidelines)
- [Security](#security)
- [Performance](#performance)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Production Deployment](#production-deployment)

---

## General Guidelines

### 1. Initialize Once

Initialize FHEVM instance once and reuse it throughout your application.

```typescript
// ✅ Good - Initialize once at app level
const fhevm = await createFhevmInstance({ ... });

// ❌ Bad - Initialize multiple times
function MyComponent() {
  const fhevm = await createFhevmInstance({ ... }); // Don't do this
}
```

### 2. Use Hooks/Composables

In React or Vue applications, use the provided hooks/composables:

```typescript
// ✅ Good - Use hooks
const { fhevm } = useFhevm({ ... });

// ❌ Bad - Manual state management
const [fhevm, setFhevm] = useState(null);
useEffect(() => {
  createFhevmInstance({ ... }).then(setFhevm);
}, []);
```

### 3. Type Everything

Use TypeScript for type safety:

```typescript
// ✅ Good - Type-safe
import type { FhevmInstance, EncryptedData } from '@fhevm/universal-sdk';

const handleEncrypt = async (fhevm: FhevmInstance): Promise<EncryptedData> => {
  // ...
};

// ❌ Bad - No types
const handleEncrypt = async (fhevm) => {
  // ...
};
```

---

## Security

### 1. Never Expose Private Keys

```typescript
// ❌ NEVER do this
const PRIVATE_KEY = '0x1234...'; // Don't hardcode

// ✅ Use environment variables
const privateKey = process.env.PRIVATE_KEY;
```

### 2. Validate User Input

Always validate input before encryption:

```typescript
// ✅ Good - Validate first
function submitReport(congestion: number) {
  if (congestion < 0 || congestion > 100) {
    throw new Error('Invalid congestion level');
  }

  return encrypt(fhevm, contractAddress, {
    congestion: { type: 'uint8', value: congestion },
  });
}
```

### 3. Use ACL Permissions

Set proper ACL permissions in your smart contract:

```solidity
// ✅ Set ACL for encrypted values
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, address);
```

### 4. Verify Contract Addresses

Always verify contract addresses before interaction:

```typescript
// ✅ Good - Verify address
if (!isValidAddress(contractAddress)) {
  throw new Error('Invalid contract address');
}
```

---

## Performance

### 1. Batch Operations

Use batch operations when encrypting multiple values:

```typescript
// ✅ Good - Batch encrypt
const encrypted = await batchEncrypt(fhevm, contractAddress, {
  value1: { type: 'uint8', value: 42 },
  value2: { type: 'uint16', value: 1000 },
  value3: { type: 'bool', value: true },
});

// ❌ Bad - Multiple separate encryptions
const enc1 = await encryptUint8(fhevm, contractAddress, 42);
const enc2 = await encryptUint16(fhevm, contractAddress, 1000);
const enc3 = await encryptBool(fhevm, contractAddress, true);
```

### 2. Optimize Gas Usage

Specify gas limits to avoid out-of-gas errors:

```typescript
// ✅ Good - Specify gas limit
const tx = await call('myFunction', args, {
  gasLimit: 500000n
});

// ❌ Bad - No gas limit
const tx = await call('myFunction', args);
```

### 3. Cache Contract Instances

Reuse contract instances instead of creating new ones:

```typescript
// ✅ Good - Create once, reuse
const contract = createContract(fhevm, address, abi);

// Use contract multiple times
await contract.function1();
await contract.function2();
```

### 4. Use Appropriate Data Types

Choose the smallest data type that fits your needs:

```typescript
// ✅ Good - Use uint8 for 0-100
const encrypted = await encrypt(fhevm, address, {
  percentage: { type: 'uint8', value: 75 }
});

// ❌ Bad - Unnecessary uint256
const encrypted = await encrypt(fhevm, address, {
  percentage: { type: 'uint256', value: 75 }
});
```

---

## Error Handling

### 1. Handle All Errors

Always wrap SDK calls in try-catch:

```typescript
// ✅ Good - Proper error handling
try {
  const encrypted = await encrypt(fhevm, address, values);
  const tx = await call('submit', [encrypted.data]);
  await tx.wait();
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('Encryption failed:', error);
  } else if (error instanceof ContractError) {
    console.error('Contract call failed:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### 2. Provide User Feedback

Show meaningful error messages to users:

```typescript
// ✅ Good - User-friendly errors
try {
  await submitReport();
} catch (error) {
  if (error.code === 'INSUFFICIENT_GAS') {
    setError('Not enough gas. Please add more ETH.');
  } else if (error.code === 'USER_REJECTED') {
    setError('Transaction cancelled.');
  } else {
    setError('An error occurred. Please try again.');
  }
}
```

### 3. Implement Retry Logic

Use retry for transient failures:

```typescript
// ✅ Good - Retry on failure
import { retry } from '@fhevm/universal-sdk';

const result = await retry(
  async () => await encrypt(fhevm, address, values),
  3,    // max attempts
  1000  // initial delay
);
```

---

## Testing

### 1. Mock FHEVM Instance

Mock the FHEVM instance in tests:

```typescript
// ✅ Good - Mock for testing
const mockFhevm = {
  instance: mockInstance,
  provider: mockProvider,
  contractAddress: '0x...',
  // ...
};
```

### 2. Test Error Cases

Always test error scenarios:

```typescript
// ✅ Good - Test errors
it('should handle encryption failure', async () => {
  const invalidData = { value: -1 };

  await expect(
    encrypt(fhevm, address, invalidData)
  ).rejects.toThrow(EncryptionError);
});
```

### 3. Test Type Safety

Ensure type safety in tests:

```typescript
// ✅ Good - Type-safe tests
it('should return correct type', async () => {
  const result = await decrypt(fhevm, request);

  expect(result.type).toBe('uint8');
  expect(typeof result.value).toBe('number');
});
```

---

## Production Deployment

### 1. Environment Variables

Use environment variables for configuration:

```bash
# .env.production
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/...
```

### 2. Error Monitoring

Implement error tracking:

```typescript
// ✅ Good - Track errors
import * as Sentry from '@sentry/nextjs';

try {
  await operation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 3. Rate Limiting

Implement rate limiting for API calls:

```typescript
// ✅ Good - Rate limit
import { throttle } from '@fhevm/universal-sdk';

const throttledSubmit = throttle(submitReport, 1000);
```

### 4. Performance Monitoring

Monitor SDK performance:

```typescript
// ✅ Good - Monitor performance
const start = performance.now();
await encrypt(fhevm, address, values);
const duration = performance.now() - start;

console.log(`Encryption took ${duration}ms`);
```

### 5. Verify Deployments

Always verify contract addresses after deployment:

```typescript
// ✅ Good - Verify deployment
const code = await provider.getCode(contractAddress);
if (code === '0x') {
  throw new Error('Contract not deployed at this address');
}
```

---

## Common Patterns

### Pattern 1: Progressive Enhancement

```typescript
// ✅ Check for wallet before using SDK
if (!window.ethereum) {
  return <InstallMetaMaskPrompt />;
}

return <App />;
```

### Pattern 2: Optimistic Updates

```typescript
// ✅ Update UI optimistically
setStatus('submitting');
try {
  await submitReport();
  setStatus('success');
} catch (error) {
  setStatus('error');
  // Revert optimistic update
}
```

### Pattern 3: Loading States

```typescript
// ✅ Show loading states
const { isEncrypting } = useEncrypt(fhevm);

return (
  <button disabled={isEncrypting}>
    {isEncrypting ? 'Encrypting...' : 'Submit'}
  </button>
);
```

---

## Checklist

Before deploying to production:

- [ ] All sensitive data is encrypted
- [ ] Environment variables are set
- [ ] Error handling is implemented
- [ ] Gas limits are specified
- [ ] Contract addresses are verified
- [ ] User feedback is clear
- [ ] Loading states are shown
- [ ] Errors are logged
- [ ] Performance is monitored
- [ ] Tests are passing

---

## Additional Resources

- [API Reference](./api-reference.md)
- [Examples](../examples/)
- [Troubleshooting](./troubleshooting.md)
- [Security Audit](../SECURITY_AND_PERFORMANCE.md)

---

**Need Help?** [Open an issue](https://github.com/zama-ai/fhevm-react-template/issues)

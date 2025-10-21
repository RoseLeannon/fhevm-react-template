# Deployment Guide

This document provides deployment instructions and links to live demos.

## Live Deployments

### 🚦 Traffic Analytics Application
**URL**: https://traffic-aggregator.vercel.app/
**Status**: ✅ Live
**Features**:
- Private traffic reporting with FHE encryption
- Encrypted data aggregation
- Multi-region support
- Real-time FHEVM SDK demonstration
- Production-ready implementation

### Repository
**URL**: https://github.com/RoseLeannon/fhevm-react-template
**Status**: ✅ Active
**Branches**:
- `main` - Production branch (auto-deploys to Vercel)
- `develop` - Development branch

### Video Demonstration
**File**: `demo.mp4` (in repository root)
**How to watch**: Download the demo.mp4 file from the repository to view locally
**Content**:
- Complete SDK walkthrough
- Traffic Analytics demo
- Deployment process
- Framework integrations

---

## Deployment Instructions

### Traffic Analytics Application

#### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd examples/traffic-analytics
   vercel --prod
   ```

3. **Environment Variables**
   Set these in Vercel dashboard:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/...
   ```

#### Manual Deployment

1. **Build**
   ```bash
   cd examples/traffic-analytics
   npm run build
   ```

2. **Deploy to your hosting provider**
   - Upload `.next` folder
   - Set Node.js version to 18+
   - Configure environment variables

### Next.js Showcase

Same deployment process as Traffic Analytics application.

### SDK Package (npm)

#### Publish to npm

1. **Build**
   ```bash
   cd packages/fhevm-sdk
   npm run build
   ```

2. **Test**
   ```bash
   npm test
   ```

3. **Publish**
   ```bash
   npm publish
   ```

---

## Smart Contract Deployment

### Sepolia Testnet

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Fill in your values
   ```

2. **Deploy Contract**
   ```bash
   cd examples/traffic-analytics
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Verify Contract**
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_ADDRESS
   ```

4. **Update Frontend**
   Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel

---

## Environment Variables

### Required for Frontend

```bash
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Required for Contract Deployment

```bash
# Network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Wallet
PRIVATE_KEY=0x...

# Verification
ETHERSCAN_API_KEY=YOUR_KEY
```

---

## CI/CD Pipeline

### GitHub Actions

Automatic deployment on push to main:

The repository includes automated workflows:
- **CI**: Tests and builds on every push/PR
- **Deploy**: Auto-deploys to Vercel on push to main
- **Publish**: Publishes SDK to npm on release

Check `.github/workflows/` for configuration.

---

## Performance Optimization

### Build Optimization

1. **Enable caching**
   ```json
   {
     "cacheDirectories": [
       "node_modules",
       ".next/cache"
     ]
   }
   ```

2. **Compression**
   - Enable gzip/brotli
   - Minimize bundle size
   - Tree shaking

3. **CDN**
   - Use Vercel Edge Network
   - Cache static assets
   - Optimize images

---

## Monitoring

### Analytics

- **Vercel Analytics**: Enabled by default
- **Custom Events**: Track encryption/decryption
- **Error Tracking**: Consider Sentry integration

### Performance

- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle Analysis**: Use `@next/bundle-analyzer`
- **Lighthouse Scores**: Target 90+ in all categories

---

## Security

### Best Practices

1. **Environment Variables**: Never commit secrets
2. **HTTPS Only**: Force secure connections
3. **CSP Headers**: Content Security Policy
4. **Rate Limiting**: Prevent abuse
5. **CORS**: Configure properly

### Headers Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

---

## Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version (18+)
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`

**Environment Variables Not Working**
- Prefix with `NEXT_PUBLIC_` for client-side
- Restart dev server after changes
- Check Vercel dashboard settings

**Contract Not Found**
- Verify contract address
- Check network (Sepolia vs Mainnet)
- Ensure contract is verified on Etherscan

---

## Support

- **GitHub Issues**: [Report deployment issues](https://github.com/RoseLeannon/fhevm-react-template/issues)
- **Discord**: [Get help from community](https://discord.gg/zama)
- **Documentation**: [Check full docs](./docs/README.md)

---

## Deployment Checklist

- [ ] Build succeeds locally
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Smart contracts deployed and verified
- [ ] Frontend deployed to Vercel
- [ ] DNS configured (if custom domain)
- [ ] Analytics enabled
- [ ] Security headers configured
- [ ] Error tracking setup
- [ ] Performance monitoring enabled

---

## Live Application Links

**🚦 Traffic Analytics**: [https://traffic-aggregator.vercel.app/](https://traffic-aggregator.vercel.app/)

**📦 Repository**: [https://github.com/RoseLeannon/fhevm-react-template](https://github.com/RoseLeannon/fhevm-react-template)

---

**Last Updated**: January 2025
**Deployment Status**: ✅ All systems operational

# Deployment Guide

This document provides deployment instructions and links to live demos.

## Live Deployments

### Next.js Showcase Application
**URL**: https://fhevm-sdk-showcase.vercel.app
**Status**: ✅ Live
**Features**:
- Interactive encryption/decryption demo
- Wallet connection
- Real-time FHEVM operations
- Responsive design

### Traffic Analytics Example
**URL**: https://fhevm-traffic-analytics.vercel.app
**Status**: ✅ Live
**Features**:
- Private traffic reporting
- Encrypted data aggregation
- Multi-region support
- Admin dashboard

## Deployment Instructions

### Next.js Showcase

#### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd examples/nextjs-showcase
   vercel --prod
   ```

3. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/...
   ```

#### Manual Deployment

1. **Build**
   ```bash
   cd examples/nextjs-showcase
   npm run build
   ```

2. **Deploy to your hosting provider**
   - Upload `.next` folder
   - Set Node.js version to 18+
   - Configure environment variables

### Traffic Analytics Example

Same deployment process as Next.js Showcase.

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

## CI/CD Pipeline

### GitHub Actions

Automatic deployment on push to main:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

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

## Monitoring

### Analytics

- **Vercel Analytics**: Enabled by default
- **Custom Events**: Track encryption/decryption
- **Error Tracking**: Sentry integration

### Performance

- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle Analysis**: Use `@next/bundle-analyzer`
- **Lighthouse Scores**: Target 90+ in all categories

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

## Support

- **GitHub Issues**: Report deployment issues
- **Discord**: Get help from community
- **Documentation**: Check full docs

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

**Last Updated**: January 2025
**Deployment Status**: All systems operational ✅

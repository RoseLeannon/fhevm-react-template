# Contributing to FHEVM Universal SDK

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Provide detailed reproduction steps
4. Include environment information

### Suggesting Features

1. Check existing feature requests
2. Clearly describe the use case
3. Explain why this feature would be useful
4. Provide examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK
cd packages/fhevm-sdk
npm run build

# Run tests
npm test

# Start development
npm run dev
```

## Code Style

- Use TypeScript for all code
- Follow existing code formatting (Prettier)
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Ensure type safety (no `any` types)

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for 80%+ code coverage
- Test across different frameworks (React, Vue, Node.js)

## Documentation

- Update README.md for new features
- Add JSDoc comments to public APIs
- Include usage examples
- Update CHANGELOG.md

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

Example:
```
feat: add batch decryption support

- Implement batchDecrypt function
- Add tests for batch operations
- Update documentation
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

## Questions?

- Open a GitHub Discussion
- Join our Discord server
- Check existing documentation

Thank you for contributing! 🙏

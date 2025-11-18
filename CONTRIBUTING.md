# Contributing to Face Marker Web

Thank you for your interest in contributing to Face Marker Web! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/face-marker-web.git
   cd face-marker-web
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see your changes in real-time.

### Running Tests

Always run tests before submitting a pull request:

```bash
# Run all tests
npm test

# Run tests in watch mode while developing
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npx tsc --noEmit
```

### Building

```bash
npm run build
```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:

- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `test: Add tests for service`
- `refactor: Refactor utility function`
- `style: Format code`
- `chore: Update dependencies`

### Testing Guidelines

1. **Write tests for new features**: All new features should include tests
2. **Maintain test coverage**: Aim for >80% coverage
3. **Test edge cases**: Consider boundary conditions and error scenarios
4. **Use descriptive test names**: Test names should clearly describe what is being tested

Example:
```typescript
describe('ComponentName', () => {
  it('should render correctly with valid props', () => {
    // Test implementation
  });

  it('should handle errors gracefully', () => {
    // Test implementation
  });
});
```

## Pull Request Process

1. **Update documentation**: If you change functionality, update relevant docs
2. **Add tests**: Ensure your changes are covered by tests
3. **Run all checks**: Make sure tests pass and code is linted
4. **Update CHANGELOG**: Add a note about your changes
5. **Create pull request**: Provide a clear description of changes
6. **Wait for review**: A maintainer will review your PR

### Pull Request Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing you've done

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass locally
- [ ] Code is linted
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

## Areas for Contribution

### Priority Areas

1. **Performance Optimization**
   - Improve video processing speed
   - Optimize memory usage
   - Better WebGPU utilization

2. **New Features**
   - Additional blur effects (pixelation, mosaic)
   - Batch processing
   - PWA support
   - Keyboard shortcuts

3. **Testing**
   - Increase test coverage
   - Add E2E tests
   - Performance benchmarks

4. **Documentation**
   - Improve user guides
   - Add code examples
   - Create video tutorials

5. **Browser Compatibility**
   - Test on different browsers
   - Fix browser-specific issues
   - Improve fallbacks

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

## Development Tips

### Debugging

- Use browser DevTools for debugging
- Check console for TensorFlow.js logs
- Use React DevTools for component inspection
- Enable source maps for better debugging

### Testing Tips

- Mock browser APIs (Canvas, MediaRecorder, etc.)
- Use `@testing-library/react` utilities
- Test user interactions, not implementation details
- Keep tests isolated and independent

### Performance Tips

- Profile with Chrome DevTools Performance tab
- Monitor memory usage during video processing
- Test with different video sizes and formats
- Check bundle size impact of new dependencies

## Questions?

If you have questions:
1. Check existing issues and discussions
2. Read the documentation
3. Ask in a new issue or discussion

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

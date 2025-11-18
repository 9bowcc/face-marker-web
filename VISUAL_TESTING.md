# Visual Regression Testing

This project uses Playwright for visual regression testing to ensure UI consistency across changes.

## Quick Start

```bash
# Run all visual tests
npm run visual

# Update baselines after intentional UI changes
npm run visual:update

# View test results
npm run visual:report
```

## Full Documentation

For comprehensive documentation including test structure, best practices, and troubleshooting, see [visual-tests/README.md](./visual-tests/README.md).

## Common Commands

- `npm run visual` - Run all visual regression tests
- `npm run visual:ui` - Interactive UI mode
- `npm run visual:update` - Update baseline screenshots
- `npm run visual:report` - View HTML test report
- `npm run visual:chromium` - Test in Chrome only
- `npm run visual:firefox` - Test in Firefox only
- `npm run visual:webkit` - Test in Safari only

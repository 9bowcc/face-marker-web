# Visual Regression Testing Guide

Quick reference guide for visual regression testing in Face Marker Web.

## Quick Start

```bash
# Run all visual tests
npm run visual

# Update baselines after intentional UI changes
npm run visual:update

# View test results
npm run visual:report
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run visual` | Run all visual regression tests |
| `npm run visual:ui` | Interactive UI mode |
| `npm run visual:headed` | Run with visible browser |
| `npm run visual:update` | Update baseline screenshots |
| `npm run visual:report` | View HTML test report |
| `npm run visual:chromium` | Test in Chrome only |
| `npm run visual:firefox` | Test in Firefox only |
| `npm run visual:webkit` | Test in Safari only |
| `npm run visual:mobile` | Test mobile viewports |
| `npm run visual:debug` | Debug mode with DevTools |

## When to Update Baselines

Update baselines when you make **intentional** UI changes:

✅ **DO update baselines for:**
- Layout changes
- Color/styling updates
- New UI components
- Typography changes
- Icon updates
- Spacing/padding adjustments

❌ **DON'T update baselines for:**
- Bug fixes (unless the bug was visual)
- Unexpected visual changes
- Flaky test failures
- Random pixel differences

## Workflow

### 1. Making UI Changes

```bash
# 1. Make your UI changes
# 2. Run visual tests
npm run visual

# 3. If tests fail, review differences
npm run visual:report

# 4. If changes are intentional
npm run visual:update

# 5. Commit both code and baselines
git add .
git commit -m "Update UI: [description]"
```

### 2. Fixing Visual Regressions

```bash
# 1. Run tests to see failures
npm run visual

# 2. Open report to see differences
npm run visual:report

# 3. Fix the code issue
# 4. Re-run tests to verify fix
npm run visual

# 5. Commit the fix (no baseline update needed)
git commit -m "Fix: [description]"
```

## Test Coverage

### Components Tested
- ✅ FileUploader (upload area, hover states, drag-and-drop)
- ✅ ImageProcessor (face detection, selection, blur controls)
- ✅ VideoProcessor (video player, face tracks, controls)
- ✅ App layout (header, navigation, footer)

### States Tested
- ✅ Loading states (initialization, processing)
- ✅ Error states (initialization, processing, network)
- ✅ Success states (detection complete, processing complete)
- ✅ Empty states (no faces detected, no file selected)

### Responsive Design
- ✅ Mobile (375x667) - 2-column layout
- ✅ Tablet (768x1024) - 3-column layout
- ✅ Desktop (1280x720) - 4-column layout
- ✅ Large Desktop (1920x1080) - max width constraints

### Browsers
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ Tablet (iPad Pro)

## CI/CD

Visual tests run automatically on:
- Pull requests
- Pushes to main/master branches
- Pushes to claude/** branches

### CI Artifacts

If tests fail in CI:
1. Go to Actions tab
2. Click on failed workflow
3. Download artifacts:
   - `playwright-report` - Full HTML report
   - `visual-test-failures` - Failed screenshots

### PR Comments

When visual tests fail on a PR, you'll see:
- ⚠️ Automated comment with failure notice
- Link to test artifacts
- Instructions for reviewing changes

## Troubleshooting

### Tests fail locally but pass in CI
- Ensure you have latest baselines: `git pull`
- Ensure browsers are updated: `npx playwright install`

### Tests fail in CI but pass locally
- Different OS/browser versions
- Check CI artifacts for actual differences
- May need to adjust tolerance in config

### Flaky tests (intermittent failures)
- Check for animations not disabled
- Ensure dynamic content is hidden
- Increase wait times if needed
- Adjust `maxDiffPixels` in config

### Missing baselines
- Run `npm run visual:update` to generate
- Ensure `__snapshots__` directories are committed

## Configuration

Edit `playwright.config.ts` to adjust:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,      // Max pixels that can differ
    threshold: 0.2,          // Color difference threshold
    animations: 'disabled',  // Disable animations
  },
}
```

## File Structure

```
visual-tests/
├── __snapshots__/              # Baseline screenshots (committed)
├── helpers/
│   └── test-utils.ts          # Helper functions
├── fixtures/
│   └── README.md              # Test fixtures
├── file-uploader.spec.ts      # FileUploader tests
├── image-processor.spec.ts    # ImageProcessor tests
├── video-processor.spec.ts    # VideoProcessor tests
├── error-and-loading-states.spec.ts
├── responsive-design.spec.ts
└── README.md                  # Detailed documentation
```

## Best Practices

1. **Always review visual changes** before updating baselines
2. **Commit baselines with code changes** in the same commit
3. **Run tests before pushing** to catch issues early
4. **Use descriptive test names** that explain what's being tested
5. **Test one thing per test** for easier debugging
6. **Hide dynamic content** (timestamps, IDs) for stable tests
7. **Wait for stable UI** before taking screenshots
8. **Use element screenshots** when possible for faster tests

## Getting Help

- Full documentation: `visual-tests/README.md`
- Playwright docs: https://playwright.dev/
- Visual testing guide: https://playwright.dev/docs/test-snapshots

## Example: Updating Baselines

```bash
# Scenario: You changed the primary color from blue to green

# 1. Run tests - they will fail
npm run visual
# ❌ file-uploader-default.png failed
# ❌ desktop-app-bar.png failed

# 2. Review the differences
npm run visual:report
# Opens browser showing old (blue) vs new (green)

# 3. Confirm changes are intentional
# Visual diff shows primary color changed from #1976d2 to #00ff00
# This matches your code changes ✓

# 4. Update baselines
npm run visual:update
# ✅ Baselines updated

# 5. Verify tests now pass
npm run visual
# ✅ All tests passed

# 6. Commit everything together
git add .
git commit -m "Update primary color to green

- Changed theme primary color from blue to green
- Updated visual regression baselines"
git push
```

## Common Scenarios

### New Component
1. Write visual tests for the new component
2. Run `npm run visual:update` to create baselines
3. Commit component + tests + baselines

### UI Bug Fix
1. Fix the bug
2. Run `npm run visual` to verify fix
3. Tests should pass (baselines unchanged)
4. Commit the fix

### Styling Refactor
1. Make styling changes
2. Run `npm run visual` to see visual diff
3. If visual output is unchanged, tests pass
4. If visual output changed, update baselines
5. Commit changes + updated baselines

### Responsive Design Changes
1. Make responsive changes
2. Run `npm run visual:mobile` to test mobile
3. Review differences at each breakpoint
4. Update baselines: `npm run visual:update`
5. Commit changes + baselines

## Tips

- Use `--ui` mode for interactive debugging
- Use `--headed` to see tests run in real browser
- Use `--project=chromium` to test one browser quickly
- Use `--grep "search term"` to run specific tests
- Use `--debug` to step through tests with DevTools

## Maintenance

### Regular Tasks
- Review and update baselines when UI changes
- Keep Playwright updated: `npm update @playwright/test`
- Update browsers: `npx playwright install`
- Clean old test results: `rm -rf test-results playwright-report`

### Monitoring
- Watch for flaky tests (intermittent failures)
- Monitor CI run time (optimize slow tests)
- Track baseline size (compress images if needed)

# Visual Regression Testing

This directory contains visual regression tests for the Face Marker Web application. Visual regression testing helps detect unintended UI changes by comparing screenshots of the application against baseline images.

## Overview

Visual regression tests use [Playwright](https://playwright.dev/) to:
- Capture screenshots of UI components in different states
- Compare screenshots against baseline images
- Detect visual differences that may indicate bugs or unintended changes
- Test responsive design across multiple viewport sizes
- Verify UI consistency across different browsers

## Test Structure

```
visual-tests/
├── helpers/
│   └── test-utils.ts          # Helper functions for tests
├── fixtures/
│   └── README.md              # Test fixture files
├── file-uploader.spec.ts      # FileUploader component tests
├── image-processor.spec.ts    # ImageProcessor component tests
├── video-processor.spec.ts    # VideoProcessor component tests
├── error-and-loading-states.spec.ts  # Error/loading state tests
├── responsive-design.spec.ts  # Responsive design tests
└── README.md                  # This file
```

## What's Tested

### Components
- **FileUploader**: Upload area, hover states, drag-and-drop states
- **ImageProcessor**: Face detection UI, face selection, blur controls
- **VideoProcessor**: Video player, face tracks, processing controls
- **App**: Main layout, navigation, header, footer

### States
- **Loading states**: Initialization, face detection, processing
- **Error states**: Initialization errors, processing errors, network errors
- **Success states**: Face detection complete, processing complete
- **Empty states**: No faces detected, no file selected

### Responsive Design
- **Mobile** (375x667): 2-column face grid layout
- **Tablet** (768x1024): 3-column face grid layout
- **Desktop** (1280x720): 4-column face grid layout
- **Large Desktop** (1920x1080): Maximum width constraints

### Browsers
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

## Running Tests

### Run all visual tests
```bash
npm run visual
```

### Run tests in UI mode (interactive)
```bash
npm run visual:ui
```

### Run tests in headed mode (see browser)
```bash
npm run visual:headed
```

### Run tests for specific browser
```bash
npm run visual:chromium
npm run visual:firefox
npm run visual:webkit
npm run visual:mobile
```

### Debug tests
```bash
npm run visual:debug
```

### View test report
```bash
npm run visual:report
```

## Updating Baselines

When you make intentional UI changes, you need to update the baseline screenshots:

### Update all baselines
```bash
npm run visual:update
```

### Update specific test file
```bash
npx playwright test file-uploader.spec.ts --update-snapshots
```

### Update specific test
```bash
npx playwright test -g "should render file upload area" --update-snapshots
```

### Update for specific browser
```bash
npx playwright test --project=chromium --update-snapshots
```

## Workflow

### 1. Making UI Changes

When you modify UI components:

1. Make your changes to the component
2. Run visual tests: `npm run visual`
3. If tests fail, review the differences
4. If changes are intentional, update baselines: `npm run visual:update`
5. Commit both code changes AND updated baseline screenshots

### 2. Reviewing Visual Differences

When tests fail:

1. Check the HTML report: `npm run visual:report`
2. The report shows:
   - **Expected**: The baseline screenshot
   - **Actual**: The new screenshot
   - **Diff**: Highlighted differences
3. Decide if the differences are:
   - **Intentional**: Update the baseline
   - **Bugs**: Fix the code
   - **Flaky**: Adjust test configuration

### 3. Handling Flaky Tests

If tests are inconsistent:

1. Check for dynamic content (timestamps, random IDs)
2. Use `hideDynamicElements()` helper
3. Adjust `maxDiffPixels` or `threshold` in `playwright.config.ts`
4. Add `waitForStableUI()` calls to ensure animations complete

## CI/CD Integration

Visual regression tests run automatically in CI:

- **On Pull Requests**: Tests run and report visual changes
- **On Push**: Tests validate no unintended changes
- **Artifacts**: Failed test screenshots are uploaded for review

### CI Workflow

1. Tests run on every PR and push
2. If tests fail:
   - Screenshots are uploaded as artifacts
   - A comment is added to the PR
   - You can download and review the differences
3. If changes are intentional:
   - Update baselines locally
   - Commit the new baselines
   - Push to your branch

### Viewing CI Results

1. Go to the Actions tab in GitHub
2. Click on the failed workflow
3. Download the `playwright-report` or `visual-test-failures` artifacts
4. Extract and open `index.html` to view the report

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   test('should render upload area in hover state', async ({ page }) => {
   ```

2. **Hide dynamic content**
   ```typescript
   await hideDynamicElements(page);
   ```

3. **Wait for stable UI**
   ```typescript
   await waitForStableUI(page);
   ```

4. **Use specific selectors**
   ```typescript
   const uploadArea = page.locator('[data-testid="file-uploader"]');
   ```

5. **Take screenshots of specific elements when possible**
   ```typescript
   await expect(element).toHaveScreenshot('element.png');
   ```

### Maintaining Tests

1. **Review visual changes carefully**
   - Don't blindly update baselines
   - Understand what changed and why

2. **Keep baselines in version control**
   - Commit baseline screenshots
   - Track changes over time

3. **Update baselines after intentional changes**
   - Don't commit broken tests
   - Update baselines in the same commit as code changes

4. **Run tests before committing**
   - Catch visual regressions early
   - Ensure all tests pass

## Configuration

Visual regression settings are in `playwright.config.ts`:

- **maxDiffPixels**: Maximum number of pixels that can differ (default: 100)
- **threshold**: Color difference threshold 0-1 (default: 0.2)
- **animations**: Disabled for consistent screenshots
- **timeout**: 120 seconds for web server startup

## Troubleshooting

### Tests fail with "locator not found"

- Component may not have rendered yet
- Add `await page.waitForSelector()`
- Increase timeout if needed

### Screenshots differ slightly on CI vs local

- Different OS/browser versions
- Adjust `maxDiffPixels` or `threshold`
- Ensure animations are disabled

### Tests are slow

- Run specific browser: `npm run visual:chromium`
- Run specific file: `npx playwright test file-uploader.spec.ts`
- Use `--workers=4` to parallelize

### Baselines are missing

- Run `npm run visual:update` to generate initial baselines
- Ensure `__snapshots__` directories are committed

## Helper Functions

### `waitForStableUI(page, timeout)`
Waits for network idle and animations to complete.

### `hideDynamicElements(page)`
Hides elements with changing content (timestamps, spinners).

### `setViewport(page, viewport)`
Sets viewport size and waits for CSS reflow.

### `mockFaceDetection(page)`
Injects mock face detection results for consistent tests.

### `takeFullPageScreenshot(page, name, options)`
Takes a full page screenshot with consistent settings.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Visual Comparisons Guide](https://playwright.dev/docs/test-snapshots)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [CI Integration](https://playwright.dev/docs/ci)

## Support

If you encounter issues with visual regression tests:

1. Check this README
2. Review the Playwright documentation
3. Check CI logs and artifacts
4. Open an issue with:
   - Test name
   - Error message
   - Screenshots (if available)

# E2E Test Suite

This directory contains end-to-end (E2E) tests for the Face Marker Web application using Playwright.

## Directory Structure

```
e2e/
├── helpers/
│   └── test-utils.ts          # Test utilities and helper functions
├── fixtures/                   # Test fixture files (images, videos)
├── image-upload.spec.ts        # Image upload and face detection tests
├── video-upload.spec.ts        # Video upload and face detection tests
├── face-blur.spec.ts          # Face selection and blur application tests
├── export.spec.ts             # Export functionality tests
├── error-handling.spec.ts     # Error handling and edge case tests
└── README.md                  # This file
```

## Test Coverage

### Image Upload Tests (`image-upload.spec.ts`)
- Upload interface display
- Privacy notice visibility
- Image file upload workflow
- Face detection in images
- Navigation (back button)
- Image preview display
- Multiple sequential uploads

### Video Upload Tests (`video-upload.spec.ts`)
- Video file upload workflow
- Video processing UI elements
- Face detection in video frames
- Progress indicators during processing
- Video format support (MP4, WebM)
- Video metadata display

### Face Blur Tests (`face-blur.spec.ts`)
- Blur control visibility
- Blur intensity adjustment
- Face selection UI (checkboxes/toggles)
- Individual face selection
- Apply blur functionality
- Blurred image preview
- Dynamic blur intensity changes
- Face count information display

### Export Tests (`export.spec.ts`)
- Export/download button display
- Download trigger functionality
- Processed image export
- Video export with correct format
- Filename generation
- Image quality maintenance
- Export success messages

### Error Handling Tests (`error-handling.spec.ts`)
- Initialization error handling
- Invalid file type rejection
- Corrupted file handling (images and videos)
- Large file processing
- Face detection failures
- Network error handling
- User-friendly error messages
- Browser compatibility warnings
- Memory limitation handling
- Processing error recovery
- Empty/zero-byte file validation
- Rapid upload handling
- Loading state display

## Running E2E Tests

### Basic Commands

```bash
# Run all E2E tests
npm run e2e

# Run E2E tests with UI (interactive mode)
npm run e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run e2e:headed

# Debug E2E tests (step through tests)
npm run e2e:debug

# View test report
npm run e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/image-upload.spec.ts

# Run tests with specific name
npx playwright test -g "should upload an image"

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Helpers

The `helpers/test-utils.ts` file provides utility functions:

- `createTestImage()`: Creates a test image data URL
- `createTestFile()`: Creates a test file from data URL
- `waitForInitialization()`: Waits for app initialization
- `uploadFile()`: Uploads a file via file input
- `waitForFaceDetection()`: Waits for face detection to complete
- `mockFileUpload()`: Mocks file upload for testing
- `getTestImageBuffer()`: Returns a minimal valid JPEG buffer
- `getTestVideoBuffer()`: Returns a minimal valid MP4 buffer

## Test Fixtures

Test fixtures (sample images and videos) should be placed in the `e2e/fixtures/` directory. These files are used by tests to simulate real user workflows.

Due to their size, fixture files are not committed to the repository. Tests use programmatically generated minimal valid files for testing.

## Writing New Tests

When adding new E2E tests, follow these guidelines:

1. **Use descriptive test names**: Clearly describe what the test verifies
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Keep tests independent**: Each test should work in isolation
4. **Use test helpers**: Leverage existing utility functions
5. **Handle async properly**: Use `await` for all async operations
6. **Add appropriate timeouts**: Some operations (face detection) may take time
7. **Clean up state**: Use `beforeEach` for consistent starting state

### Example Test Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForInitialization(page);
  });

  test('should perform specific action', async ({ page }) => {
    // Arrange
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Act
    await page.click('text=Drop your file here or click to browse');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    // Assert
    await expect(page.getByText(/Processing/i)).toBeVisible();
  });
});
```

## Best Practices

1. **Stable Selectors**: Use semantic selectors (role, label) over brittle selectors (CSS classes, IDs)
2. **Auto-waiting**: Playwright automatically waits for elements; avoid manual waits unless necessary
3. **Page Object Pattern**: For complex pages, consider using page objects
4. **Test Data**: Use programmatically generated test data when possible
5. **Error Screenshots**: Playwright captures screenshots on failure automatically
6. **Video Recording**: Videos are recorded for failed tests (see `playwright.config.ts`)

## Debugging Tests

### Visual Debugging

```bash
# Open Playwright Inspector
npm run e2e:debug

# Run with browser visible
npm run e2e:headed
```

### Trace Viewer

```bash
# Generate trace on failure (configured in playwright.config.ts)
npm run e2e

# View trace
npx playwright show-trace trace.zip
```

### Console Logs

Add `console.log()` statements in tests or use Playwright's built-in debugging:

```typescript
await page.pause(); // Pauses test execution
await page.screenshot({ path: 'debug.png' }); // Take screenshot
console.log(await page.content()); // Log page HTML
```

## CI/CD Integration

E2E tests run automatically in CI/CD pipeline:

- Triggered on push and pull requests
- Run on Ubuntu with Chromium browser
- Test results uploaded as artifacts
- Videos captured for failed tests
- Reports available for 30 days

See `.github/workflows/ci.yml` for configuration details.

## Troubleshooting

### Tests Failing Locally

1. Ensure Playwright browsers are installed: `npx playwright install`
2. Check if dev server is running (Playwright starts it automatically)
3. Verify Node.js version matches CI (18.x or 20.x)
4. Clear Playwright cache: `npx playwright install --force`

### Timeouts

If tests timeout frequently:

1. Increase timeout in `playwright.config.ts`
2. Check if face detection models are cached
3. Ensure sufficient system resources
4. Consider running fewer parallel tests

### Flaky Tests

If tests are flaky:

1. Add explicit waits for async operations
2. Use Playwright's auto-waiting features
3. Avoid manual `waitForTimeout()` when possible
4. Check for race conditions in app code

## Contributing

When contributing E2E tests:

1. Ensure tests pass locally before pushing
2. Add test documentation in this README if adding new test categories
3. Follow existing test patterns and naming conventions
4. Update helpers if adding reusable utilities
5. Consider edge cases and error scenarios

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Debugging Tests](https://playwright.dev/docs/debug)

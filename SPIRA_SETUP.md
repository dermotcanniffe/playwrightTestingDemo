# Spira Integration Setup

This guide explains how to configure the Playwright test project to automatically report test results to your Spira test management instance.

## Required Connection Settings

The Spira reporter requires five environment variables. All must be present for results to be submitted.

| Variable | Purpose |
|----------|---------|
| `SPIRA_BASE_URL` | The base URL of your Spira instance (e.g., `https://mycompany.spiraservice.net`) |
| `SPIRA_USERNAME` | Your Spira login username |
| `SPIRA_API_KEY` | Your RSS token / API key (found in your Spira profile under **My Profile > RSS Token**) |
| `SPIRA_PROJECT_ID` | The numeric project ID in Spira (visible in the URL when viewing your project) |
| `SPIRA_RELEASE_ID` | The numeric release ID to record test results against (visible in the release details page) |

## How Test Case Mapping Works

Tests are mapped to Spira test cases using Playwright's built-in annotation system. Each test includes an annotation with the Spira test case ID:

```typescript
test('verify home page loads', async ({ page }) => {
  test.info().annotations.push({ type: 'spira', description: '1234' });

  // test body...
});
```

- The `type` must be `'spira'`
- The `description` is the numeric Spira test case ID as a string (e.g., `'1234'`)
- When the test completes, the custom reporter reads this annotation and submits the result to the matching Spira test case

If a test does not have a `spira` annotation, the reporter simply skips it — no result is sent to Spira for that test.

## Configuration Steps

### 1. Copy the environment template

```bash
cp .env.example .env
```

### 2. Fill in your Spira connection values

Open the `.env` file and provide your Spira settings:

```ini
# LIS Application Credentials
LIS_USERNAME=librarian
LIS_PASSWORD=your-password-here

# Spira Test Management
SPIRA_BASE_URL=https://mycompany.spiraservice.net
SPIRA_USERNAME=your-spira-username
SPIRA_API_KEY=your-rss-token-here
SPIRA_PROJECT_ID=1
SPIRA_RELEASE_ID=1
```

To find your API key in Spira:
1. Log in to your Spira instance
2. Go to **My Profile** (click your username in the top-right)
3. Locate the **RSS Token** field — this is your API key

To find your project and release IDs:
- **Project ID**: Navigate to your project in Spira and check the URL (e.g., `/ProjectId/1/...`)
- **Release ID**: Open the Releases page in your project and click a release — the ID appears in the URL

### 3. Map test case IDs in your test spec files

In each test, add the Spira annotation with the corresponding test case ID from your Spira project:

```typescript
test('search returns results for known term', async ({ page }) => {
  test.info().annotations.push({ type: 'spira', description: '5678' });

  // test implementation...
});
```

Replace `'5678'` with the actual numeric test case ID from Spira.

### 4. Run tests — results auto-submit to Spira

```bash
# Run all tests (headless)
npm test

# Or run in demo mode (headed browser with slow motion)
npm run test:demo

# Or run a specific category
npm run test:login
```

After each test completes, the reporter automatically sends the result (passed, failed, or blocked) to Spira via the REST API.

## Graceful Fallback

If any required Spira settings are missing or empty, the reporter **gracefully skips** submission:

- A warning is logged to the console listing the missing settings
- Tests still run normally and produce all other outputs (HTML report, screenshots, traces)
- The test run exit code is determined solely by test pass/fail status, not by Spira connectivity

This means you can run the test suite without configuring Spira at all — reporting is entirely optional.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Skipping submission. Missing settings: ..." | Check your `.env` file has all five Spira variables filled in |
| Connection timeout errors in console | Verify `SPIRA_BASE_URL` is correct and accessible from your network |
| HTTP 401/403 errors | Confirm `SPIRA_USERNAME` and `SPIRA_API_KEY` are valid |
| Results not appearing in Spira | Verify the test case IDs in annotations match existing test cases in the specified project |
| No Spira-related output at all | Ensure `.env` is in the project root directory (same level as `playwright.config.ts`) |

# Playwright Demo Tests

Automated end-to-end test suite for the [Library Information System](https://v3.libraryinformationsystem.org/angularui/home) (LIS) demo application. Built with Playwright and TypeScript for live demo presentations with optional Spira test management integration.

## Target Application

**URL:** https://v3.libraryinformationsystem.org/angularui/home

The LIS is an Angular-based library catalog application used as the system under test.

## Prerequisites

- **Node.js** v18 or higher
- **npm** (included with Node.js)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:

   ```bash
   npm run install:browsers
   ```

3. Configure credentials:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your LIS login credentials (`LIS_USERNAME` and `LIS_PASSWORD`). These are required for login, navigation (to book catalog), and search tests.

## Running Tests

### All Tests

| Mode | Command | Description |
|------|---------|-------------|
| Headless | `npm test` | Run all tests in headless Chromium |
| Demo | `npm run test:demo` | Visible browser with 500ms slow motion |

### Individual Test Categories

| Category | Headless | Demo Mode |
|----------|----------|-----------|
| Navigation | `npm run test:navigation` | `npm run test:navigation:demo` |
| Search | `npm run test:search` | `npm run test:search:demo` |
| Login | `npm run test:login` | `npm run test:login:demo` |

Demo mode opens a Chromium window (1280×720) with a 500ms delay between actions — ideal for live presentations.

### View HTML Report

```bash
npm run report
```

## Test Artifacts

| Artifact | Location | When Generated |
|----------|----------|----------------|
| Screenshots (PNG) | `test-results/` | On test failure |
| Trace files | `test-results/` | On first retry of a failed test |
| HTML report | `playwright-report/` | After every test run |

## Spira Integration (Optional)

Test results can be reported to a Spira test management instance automatically. The reporter creates new test cases in Spira when no mapping exists and reuses IDs on subsequent runs.

To enable:
1. Uncomment the Spira reporter line in `playwright.config.ts`
2. Fill in the Spira env vars in `.env`

See [SPIRA_SETUP.md](./SPIRA_SETUP.md) for full configuration details.

## Project Structure

```
├── playwright.config.ts       # Playwright configuration (chromium + demo projects)
├── .env.example               # Environment variable template
├── SPIRA_SETUP.md             # Spira integration guide
├── src/
│   ├── pages/                 # Page Object Model classes
│   │   ├── base.page.ts      #   Abstract base class
│   │   ├── home.page.ts      #   Home page interactions
│   │   ├── login.page.ts     #   Login/logout interactions
│   │   ├── book-catalog.page.ts   # Book catalog + search
│   │   └── search-results.page.ts # Search results
│   ├── reporters/
│   │   └── spira-reporter.ts # Custom reporter for Spira
│   └── utils/
│       └── spira-client.ts   # HTTP client for Spira REST API v7
├── tests/
│   ├── navigation.spec.ts    # Home page and catalog navigation
│   ├── search.spec.ts        # Book search/filter tests
│   └── login.spec.ts         # Authentication tests
├── test-results/              # Screenshots and traces (gitignored)
└── playwright-report/         # HTML report (gitignored)
```

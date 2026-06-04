import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { BookCatalogPage } from '../src/pages/book-catalog.page';

test.describe('Search Functionality', () => {
  // All search tests require login since the book catalog is behind auth
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.LIS_USERNAME || !process.env.LIS_PASSWORD, 'Login credentials required');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LIS_USERNAME!, process.env.LIS_PASSWORD!);

    // Navigate to books page
    const bookCatalogPage = new BookCatalogPage(page);
    await bookCatalogPage.navigate();
  });

  test('known keyword returns search results', async ({ page }) => {
    const catalogPage = new BookCatalogPage(page);
    await catalogPage.search('Pride');

    const bookCount = await catalogPage.getBookCount();
    expect(bookCount).toBeGreaterThanOrEqual(1);
  });

  test('search results contain search term', async ({ page }) => {
    const catalogPage = new BookCatalogPage(page);
    await catalogPage.search('Pride');

    const bookCount = await catalogPage.getBookCount();
    expect(bookCount).toBeGreaterThanOrEqual(1);

    const bookNames = await catalogPage.getBookNames();
    expect(bookNames.length).toBeGreaterThanOrEqual(1);
    for (const name of bookNames) {
      expect(name.toLowerCase()).toContain('pride');
    }
  });

  test('empty search shows all books', async ({ page }) => {
    const catalogPage = new BookCatalogPage(page);

    // Get initial count
    const initialCount = await catalogPage.getBookCount();

    // Search with empty string
    await catalogPage.search('');

    // Should still show books
    const bookCount = await catalogPage.getBookCount();
    expect(bookCount).toBeGreaterThanOrEqual(1);
    expect(bookCount).toBe(initialCount);
  });

  test('non-matching search shows no results', async ({ page }) => {
    const catalogPage = new BookCatalogPage(page);
    await catalogPage.search('xyznonexistent12345');

    const isNoResults = await catalogPage.isNoResultsDisplayed();
    expect(isNoResults).toBe(true);
  });
});

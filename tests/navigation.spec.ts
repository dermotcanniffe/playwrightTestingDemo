import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/home.page';
import { LoginPage } from '../src/pages/login.page';
import { BookCatalogPage } from '../src/pages/book-catalog.page';

test.describe('Navigation and Page Load', () => {
  test('home page loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const heading = await homePage.getHeadingText();
    expect(heading).toBeTruthy();
  });

  test('home page displays correct heading', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const heading = await homePage.getHeadingText();
    expect(heading.toLowerCase()).toContain('library information system');
  });

  test('books link navigates to book catalog', async ({ page }) => {
    test.skip(!process.env.LIS_USERNAME || !process.env.LIS_PASSWORD, 'Login credentials required');

    // Login first (books page requires auth)
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LIS_USERNAME!, process.env.LIS_PASSWORD!);
    expect(await loginPage.isLoggedIn()).toBe(true);

    // Click the books link
    const homePage = new HomePage(page);
    await homePage.navigateToCatalog();

    expect(page.url()).toContain('books');
  });

  test('book catalog displays books', async ({ page }) => {
    test.skip(!process.env.LIS_USERNAME || !process.env.LIS_PASSWORD, 'Login credentials required');

    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LIS_USERNAME!, process.env.LIS_PASSWORD!);
    expect(await loginPage.isLoggedIn()).toBe(true);

    // Navigate to books
    const bookCatalogPage = new BookCatalogPage(page);
    await bookCatalogPage.navigate();

    const bookCount = await bookCatalogPage.getBookCount();
    expect(bookCount).toBeGreaterThanOrEqual(1);
  });
});

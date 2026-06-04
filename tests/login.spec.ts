import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';

test.describe('User Authentication', () => {
  test('valid credentials authenticate successfully', async ({ page }) => {
    test.skip(!process.env.LIS_USERNAME || !process.env.LIS_PASSWORD, 'Login credentials not configured');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LIS_USERNAME!, process.env.LIS_PASSWORD!);

    expect(await loginPage.isLoggedIn()).toBe(true);
  });

  test('invalid credentials show error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('baduser', 'badpassword');

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).not.toBeNull();
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('logout returns to unauthenticated state', async ({ page }) => {
    test.skip(!process.env.LIS_USERNAME || !process.env.LIS_PASSWORD, 'Login credentials not configured');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LIS_USERNAME!, process.env.LIS_PASSWORD!);

    expect(await loginPage.isLoggedIn()).toBe(true);

    await loginPage.logout();

    // After logout, the login form should be visible again
    expect(await loginPage.isLoggedIn()).toBe(false);
  });
});

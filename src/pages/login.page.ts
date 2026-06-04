import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Login form elements (on home page)
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly submitButton = this.page.locator('button[type="submit"]');

  // Post-login elements
  private readonly loggedInText = this.page.locator('text=Logged in as');
  private readonly logoutLink = this.page.locator('a[href="/angularui/home"]', { hasText: 'Logout' });

  // Error indicator — the login form stays visible with invalid credentials
  private readonly loginForm = this.page.locator('h3', { hasText: 'Please login' });

  async navigate(): Promise<void> {
    await this.page.goto('/angularui/home');
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // Wait for the page to respond to login
    await this.page.waitForTimeout(2000);
  }

  async getErrorMessage(): Promise<string | null> {
    // On failed login, the login form stays visible and no "Logged in as" appears
    const loginFormVisible = await this.loginForm.isVisible();
    const loggedIn = await this.loggedInText.isVisible({ timeout: 3000 }).catch(() => false);
    if (loginFormVisible && !loggedIn) {
      return 'Login failed - credentials not accepted';
    }
    return null;
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.loggedInText.isVisible({ timeout: 10_000 }).catch(() => false);
  }

  async getUserDisplayName(): Promise<string> {
    const text = await this.loggedInText.innerText();
    return text;
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await this.page.waitForTimeout(2000);
  }
}

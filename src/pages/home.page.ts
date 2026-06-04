import { BasePage } from './base.page';

export class HomePage extends BasePage {
  private readonly welcomeHeading = this.page.locator('h2', { hasText: 'Welcome to the Library Information System' });
  private readonly booksLink = this.page.getByRole('link', { name: 'Books' });
  private readonly authorsLink = this.page.locator('a[href="/angularui/authors"]');

  async navigate(): Promise<void> {
    await this.page.goto('/angularui/home');
    await this.waitForPageLoad();
  }

  async getHeadingText(): Promise<string> {
    return await this.welcomeHeading.innerText();
  }

  async navigateToCatalog(): Promise<void> {
    await this.booksLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}

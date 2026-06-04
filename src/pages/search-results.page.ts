import { BasePage } from './base.page';

export class SearchResultsPage extends BasePage {
  private readonly resultItems = this.page.locator('.search-result, .book-item, .result-row');
  private readonly noResultsMessage = this.page.locator('.no-results, .empty-state, .no-match');

  async navigate(): Promise<void> {
    // Search results page is reached via search action, not direct nav
    await this.waitForPageLoad();
  }

  async getResultCount(): Promise<number> {
    return await this.resultItems.count();
  }

  async getResultTexts(): Promise<string[]> {
    return await this.resultItems.allInnerTexts();
  }

  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible({ timeout: 10_000 });
  }
}

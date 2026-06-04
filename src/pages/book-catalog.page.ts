import { BasePage } from './base.page';

export class BookCatalogPage extends BasePage {
  // The search/filter input at the top of the books page
  private readonly searchInput = this.page.locator('input[name="bookSearch"]');
  // Book rows in the SlickGrid
  private readonly bookRows = this.page.locator('.slick-row');
  // Individual cells within a row (name is the 2nd cell, index 1)
  private readonly bookNameCells = this.page.locator('.slick-row .slick-cell:nth-child(2)');

  async navigate(): Promise<void> {
    // Books page requires auth, so navigate via clicking the Books nav link
    await this.page.getByRole('link', { name: 'Books' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async getBookCount(): Promise<number> {
    return await this.bookRows.count();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    // The search is an instant filter — wait for grid to update
    await this.page.waitForTimeout(1000);
  }

  async getSearchResults(): Promise<string[]> {
    // Return the full text content of each visible book row
    const count = await this.bookRows.count();
    if (count === 0) return [];
    return await this.bookRows.allInnerTexts();
  }

  async getBookNames(): Promise<string[]> {
    // Return just the book name from each visible row (2nd cell)
    const count = await this.bookNameCells.count();
    if (count === 0) return [];
    return await this.bookNameCells.allInnerTexts();
  }

  async isNoResultsDisplayed(): Promise<boolean> {
    // When filtering returns nothing, there are zero slick rows
    await this.page.waitForTimeout(500);
    const count = await this.bookRows.count();
    return count === 0;
  }
}

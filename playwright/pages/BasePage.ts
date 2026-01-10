import { Page, Locator } from '@playwright/test';

/**
 * BasePage - Abstract base class for Page Object Model.
 *
 * Provides common functionality for all page objects:
 * - Navigation helpers with wait states
 * - Reusable interaction methods
 * - Screenshot utilities
 *
 * All page objects should extend this class.
 */
export abstract class BasePage {
  /**
   * The Playwright Page instance.
   * Protected to allow access in child classes.
   */
  protected readonly page: Page;

  /**
   * The URL path for this page (relative to baseURL).
   * Must be implemented by child classes.
   */
  abstract readonly url: string;

  /**
   * Creates a new BasePage instance.
   * @param page - The Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page's URL.
   * Uses the route defined in the `url` property.
   */
  async navigate(): Promise<void> {
    // Navigate with extended timeout and wait until load event
    await this.page.goto(this.url, {
      waitUntil: 'load',
      timeout: 60000
    });
    await this.waitForLoad();
  }

  /**
   * Wait for the page to be fully loaded.
   * Override in child classes for page-specific load conditions.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the page title.
   * @returns The document title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get the current URL.
   * @returns The current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for an element to be visible.
   * @param locator - The Playwright Locator
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for an element to be hidden.
   * @param locator - The Playwright Locator
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click an element and wait for navigation.
   * Useful for buttons that trigger page redirects.
   * @param locator - The Playwright Locator to click
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForURL(/.*/, { waitUntil: 'networkidle' }),
      locator.click()
    ]);
  }

  /**
   * Fill a form field after clearing existing content.
   * @param locator - The Playwright Locator for the input
   * @param value - The value to fill
   */
  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Take a screenshot of the current page.
   * @param name - Name for the screenshot file
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `playwright-report/${name}.png` });
  }

  /**
   * Check if an element is visible.
   * @param locator - The Playwright Locator
   * @returns true if visible, false otherwise
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Get text content from an element.
   * @param locator - The Playwright Locator
   * @returns The text content or null
   */
  async getText(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }
}

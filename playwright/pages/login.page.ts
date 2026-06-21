/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { LOGIN_SELECTORS } from '../config/selectors';
import { ROUTES } from '../config/routes';
import { BEHAVIOR } from '../config/behavior';

/**
 * LoginPage - Page Object for the Mifos X Login page.
 *
 * All selectors are sourced from `playwright/config/selectors.ts`
 * (Layer 2). No selector string is hard-coded in this file.
 *
 * The wrapper-click helpers (`usernameDivWrapper`, `passwordDivWrapper`)
 * remain as locator-chain helpers because they encode an interaction
 * pattern (click the surrounding div before the input to mimic the user
 * gesture that focuses the floating label) rather than a selectable
 * element. They are not part of the cross-framework contract.
 *
 * Behavior flags (e.g. `loginButtonStartsDisabled`) are read from
 * `playwright/config/behavior.ts` so specs stay framework-agnostic.
 */
export class LoginPage extends BasePage {
  /**
   * The URL path for the login page, sourced from the Layer-2 route
   * registry.
   */
  readonly url = ROUTES.login;

  /**
   * Get the username input wrapper div.
   * Codegen interaction helper — not a Layer-2 selector.
   */
  get usernameDivWrapper(): Locator {
    return this.page.locator('div').filter({ hasText: 'Username' }).nth(5);
  }

  /**
   * Get the username input field.
   */
  get usernameInput(): Locator {
    return this.page.locator(LOGIN_SELECTORS.usernameInput);
  }

  /**
   * Get the password input wrapper div.
   * Codegen interaction helper — see `usernameDivWrapper`.
   */
  get passwordDivWrapper(): Locator {
    return this.page.locator('div').filter({ hasText: 'Password' }).nth(5);
  }

  /**
   * Get the password input field.
   */
  get passwordInput(): Locator {
    return this.page.locator(LOGIN_SELECTORS.passwordInput);
  }

  /**
   * Get the login button.
   *
   * Kept as `getByRole` because the React counterpart resolves to the
   * same accessible name, preserving the cross-framework contract
   * without coupling to Angular Material markup.
   */
  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  public divLocator(className: string): Locator {
    return this.page.locator(className);
  }

  /**
   * Get all error messages on the page.
   */
  get errorMessages(): Locator {
    return this.page.locator(LOGIN_SELECTORS.errorMessage);
  }

  /**
   * Get the progress bar (loading indicator).
   */
  get progressBar(): Locator {
    return this.page.locator(LOGIN_SELECTORS.progressBar);
  }

  /**
   * Wait for the login page to be fully loaded.
   * Overrides BasePage to wait for login form visibility.
   */
  async waitForLoad(): Promise<void> {
    // Wait for basic page load
    await this.page.waitForLoadState('domcontentloaded');

    // Try to wait for network idle, but don't fail if it takes too long
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log('Network idle timeout - proceeding anyway');
    }

    // Wait for the login button to be visible with extended timeout
    await this.loginButton.waitFor({ state: 'visible', timeout: 60000 });
  }

  /**
   * Perform login with the given credentials.
   *
   * @param username - The username to enter
   * @param password - The password to enter
   */
  async login(username: string, password: string): Promise<void> {
    // Fill the username input
    await this.usernameInput.click();
    await this.usernameInput.fill(username);

    // Fill the password input
    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    // Click the login button
    await this.loginButton.click();
  }

  /**
   * Perform login and wait for successful navigation.
   * Use this when expecting a successful login.
   *
   * @param username - The username to enter
   * @param password - The password to enter
   */
  async loginAndWaitForDashboard(username: string, password: string): Promise<void> {
    await this.login(username, password);
    // Wait for navigation away from login page
    await this.page.waitForURL(/.*(?<!login)$/, {
      timeout: 30000,
      waitUntil: 'networkidle'
    });
  }

  /**
   * Check if the login button is enabled.
   * @returns true if the login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return this.loginButton.isEnabled();
  }

  /**
   * Get the count of validation errors displayed.
   * @returns Number of visible error messages
   */
  async getErrorCount(): Promise<number> {
    return this.errorMessages.count();
  }

  /**
   * Check if page is showing a loading state.
   * @returns true if progress bar is visible
   */
  async isLoading(): Promise<boolean> {
    return this.progressBar.isVisible();
  }

  /**
   * Assert that we are on the login page.
   */
  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*login/);
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Assert successful login by checking we're no longer on login page.
   */
  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).not.toHaveURL(/.*login/, { timeout: 30000 });
  }

  /**
   * Assert that a validation error is displayed.
   */
  async assertValidationError(): Promise<void> {
    await expect(this.errorMessages.first()).toBeVisible();
  }

  /**
   * Assert the login button's initial state for an empty form.
   *
   * Driven by `BEHAVIOR.loginButtonStartsDisabled` — Angular: true,
   * React: false. Specs call this method instead of branching on the
   * flag themselves, so spec files stay identical across frameworks.
   */
  async assertLoginButtonInitialState(): Promise<void> {
    if (BEHAVIOR.loginButtonStartsDisabled) {
      await expect(this.loginButton).toBeDisabled();
    } else {
      await expect(this.loginButton).toBeEnabled();
    }
  }
}

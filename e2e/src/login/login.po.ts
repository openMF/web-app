/** Protractor Imports */
import { browser, element, by } from 'protractor';

/**
 * Login Page e2e page object
 */
export class LoginPage {

  /** username field */
  usernameField = element(by.css('input[formControlName="username"]'));
  /** password field */
  passwordField = element(by.css('input[formControlName="password"]'));
  /** login button */
  loginButton = element(by.cssContainingText('.login-button', 'Login'));

  /** Forces default language */
  constructor() {
    this.navigateTo();
    browser.executeScript(() => localStorage.setItem('language', 'en-US'));
  }

  /** Navigate to specified url */
  navigateTo() {
    return browser.get('/');
  }

  /** Login with correct credentials */
  validLogin() {
    this.usernameField.sendKeys('mifos');
    this.passwordField.sendKeys('password');
    this.loginButton.click();
  }

  /** Login with incorrect credentials */
  invalidLogin() {
    this.usernameField.sendKeys('test');
    this.passwordField.sendKeys('123');
    this.loginButton.click();
  }

}

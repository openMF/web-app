import { browser, by, element } from 'protractor';
import { LoginPage } from './login.po';

describe('app', () => {
  let page: LoginPage;

  beforeAll(() => {
    page = new LoginPage();
  });

  it('should display login page', () => {
    expect(browser.getCurrentUrl()).toContain('/login');
  });

  it('should display error with invalid credentials', () => {
    page.invalidLogin();
    expect(element(by.tagName('mat-error')).isPresent()).toBe(true);
  });

  it('should login into the app', () => {
    page.validLogin();
  });

});

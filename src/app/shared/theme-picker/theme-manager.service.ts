/** Angular Imports */
import { Injectable } from '@angular/core';

/**
 * Theme manager service.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeManagerService {

  /** Stylesheet class for the theme of the application. */
  private themeManagerClass = 'theme-manager';

  constructor() { }

  /**
   * Sets a new theme for the application.
   * @param {string} href Link to stylesheet.
   */
  setTheme(href: string) {
    this.getLinkElement().setAttribute('href', href);
  }

  /**
   * Removes the current theme of the application.
   */
  removeTheme() {
    const existingLinkElement = this.getExistingLinkElement();
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }

  /**
   * @returns link element of stylesheet
   */
  private getLinkElement() {
    return this.getExistingLinkElement() || this.createLinkElement();
  }

  /**
   * @returns existing link element of stylesheet with theme manager class
   */
  private getExistingLinkElement() {
    return document.head.querySelector(`link[rel="stylesheet"].${this.themeManagerClass}`);
  }

  /**
   * @returns newly created link element of stylesheet with theme manager class
   */
  private createLinkElement() {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.classList.add(this.themeManagerClass);
    document.head.appendChild(linkElement);
    return linkElement;
  }

}

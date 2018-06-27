import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeManagerService {

  private themeManagerClass = 'theme-manager';

  constructor() { }

  setTheme(href: string) {
    this.getLinkElement().setAttribute('href', href);
  }

  removeTheme() {
    const existingLinkElement = this.getExistingLinkElement();
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }

  private getLinkElement() {
    return this.getExistingLinkElement() || this.createLinkElement();
  }

  private getExistingLinkElement() {
    return document.head.querySelector(`link[rel="stylesheet"].${this.themeManagerClass}`);
  }

  private createLinkElement() {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.classList.add(this.themeManagerClass);
    document.head.appendChild(linkElement);
    return linkElement;
  }

}

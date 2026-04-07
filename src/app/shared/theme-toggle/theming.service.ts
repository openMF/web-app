import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  private darkModeOn = false;

  themes = [
    'dark-theme',
    'light-theme'
  ]; // <- list all themes in this array
  theme = new BehaviorSubject('light-theme'); // <- initial theme

  constructor(private ref: ApplicationRef) {
    // Initially check if dark mode is enabled on system
    this.darkModeOn = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // If dark mode is enabled then directly switch to the dark-theme
    this.setDarkMode(this.darkModeOn);

    // Watch for changes of the preference
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      const turnOn = e.matches;
      this.theme.next(turnOn ? 'dark-theme' : 'light-theme');

      // Trigger refresh of UI
      this.ref.tick();
    });
  }

  isDarkMode(): boolean {
    this.darkModeOn = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return this.darkModeOn;
  }

  setDarkMode(isDarkMode: boolean) {
    this.darkModeOn = isDarkMode;
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      this.theme.next('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      this.theme.next('light-theme');
    }
  }

  setInitialDarkMode(): void {
    this.setDarkMode(this.darkModeOn);
  }
}

import { Component } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'theme-toggle-component',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent {
  isDarkMode: boolean;

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.isDarkMode();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }
}

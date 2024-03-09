import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ThemingService } from './theming.service';

@Component({
  selector: 'mifosx-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit, OnChanges {

  darkModeOn: boolean;

  constructor(private themingService: ThemingService) {
    this.darkModeOn = this.themingService.isDarkMode();
  }

  ngOnInit(): void {
    this.darkModeOn = this.themingService.isDarkMode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.darkModeOn = this.themingService.isDarkMode();
  }

  toggleTheme() {
    this.darkModeOn = !this.darkModeOn;
    this.themingService.setDarkMode(this.darkModeOn);
  }

}

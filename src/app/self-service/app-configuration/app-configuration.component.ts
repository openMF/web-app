import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss']
})
export class AppConfigurationComponent implements OnInit {

  languages: string[];
  dateFormats: string[];
  mobileAppThemes: string[];
  mobileAppFonts: string[];
  onlineBankingAppThemes: string[];
  onlineBankingAppFonts: string[];

  constructor() { }

  ngOnInit() {
  }

}

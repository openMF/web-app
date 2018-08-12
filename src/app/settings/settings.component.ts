/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/**
 * Settings component.
 */
@Component({
  selector: 'mifosx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  /** Placeholder for languages. */
  languages: any;
  /** Placeholder for date formats. */
  dateFormats: any;
  /** Placeholder for fonts. */
  fonts: any;

  constructor() { }

  ngOnInit() {
  }

}

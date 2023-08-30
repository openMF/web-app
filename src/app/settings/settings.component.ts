/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/** Custom Service */
import { SettingsService } from './settings.service';
import { UntypedFormControl } from '@angular/forms';

/**
 * Settings component.
 */
@Component({
  selector: 'mifosx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  /** Placeholder for languages. update once translations are set up */
  languages: any[] = [
    {
      name: 'English',
      code: 'en'
    }
  ];
  /** Date formats. */
  dateFormats: string[] = [
    'dd MMMM yyyy',
    'dd/MMMM/yyyy',
    'dd-MMMM-yyyy',
    'dd-MM-yy',
    'MMMM-dd-yyyy',
    'MMMM dd yyyy',
    'MMMM/dd/yyyy',
    'MM-dd-yy',
    'yyyy-MM-dd'
  ];
    /** Decimals. */
    decimals: string[] = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
   ];
  /** Placeholder for fonts. */
  fonts: any;

  /** Language Setting */
  language = new UntypedFormControl('');
  /** Date Format Setting */
  dateFormat =  new UntypedFormControl('');
  /** Decimals to Display Setting */
  decimalsToDisplay =  new UntypedFormControl('');

  /**
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.language.patchValue(this.settingsService.language);
    this.dateFormat.patchValue(this.settingsService.dateFormat);
    this.decimalsToDisplay.patchValue(this.settingsService.decimals);
    this.buildDependencies();
  }

  /**
   * Subscribe to value changes.
   */
  buildDependencies() {
    this.language.valueChanges.subscribe((language: any) => {
      this.settingsService.setLanguage(language);
    });
    this.dateFormat.valueChanges.subscribe((dateFormat: string) => {
      this.settingsService.setDateFormat(dateFormat);
    });
    this.decimalsToDisplay.valueChanges.subscribe((decimals: string) => {
      this.settingsService.setDecimalToDisplay(decimals);
    });
  }

  /**
   * Compare function for mat-select.
   * Useful in patching values if value is an object.
   * @param {any} option1 option 1
   * @param {any} option2 option 2.
   */
  compareOptions(option1: any, option2: any) {
    return option1 && option2 && option1.code === option2.code;
  }

}

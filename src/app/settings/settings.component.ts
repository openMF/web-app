/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';

/** Custom Service */
import { SettingsService } from './settings.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { FileUploadComponent } from '../shared/file-upload/file-upload.component';
import { ThemePickerComponent } from '../shared/theme-picker/theme-picker.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Settings component.
 */
@Component({
  selector: 'mifosx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    FileUploadComponent,
    ThemePickerComponent
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();

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
  datetimeFormats: string[] = [
    // All date formats with HH:mm:ss (seconds)
    'dd MMMM yyyy HH:mm:ss',
    'dd/MMMM/yyyy HH:mm:ss',
    'dd-MMMM-yyyy HH:mm:ss',
    'dd-MM-yy HH:mm:ss',
    'MMMM-dd-yyyy HH:mm:ss',
    'MMMM dd yyyy HH:mm:ss',
    'MMMM/dd/yyyy HH:mm:ss',
    'MM-dd-yy HH:mm:ss',
    'yyyy-MM-dd HH:mm:ss',
    // All date formats with HH:mm (no seconds)
    'dd MMMM yyyy HH:mm',
    'dd/MMMM/yyyy HH:mm',
    'dd-MMMM-yyyy HH:mm',
    'dd-MM-yy HH:mm',
    'MMMM-dd-yyyy HH:mm',
    'MMMM dd yyyy HH:mm',
    'MMMM/dd/yyyy HH:mm',
    'MM-dd-yy HH:mm',
    'yyyy-MM-dd HH:mm'
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
    '8'
  ];
  /** Placeholder for fonts. */
  fonts: any;

  /** Language Setting */
  language = new FormControl('');
  /** Date Format Setting */
  dateFormat = new FormControl('');
  /** Datetime Format Setting */
  datetimeFormat = new FormControl('');
  /** Decimals to Display Setting */
  decimalsToDisplay = new FormControl('');

  ngOnInit() {
    this.language.patchValue(this.settingsService.language);
    this.dateFormat.patchValue(this.settingsService.dateFormat);
    this.datetimeFormat.patchValue(this.settingsService.datetimeFormat);
    this.decimalsToDisplay.patchValue(this.settingsService.decimals);
    this.buildDependencies();
  }

  /**
   * Subscribe to value changes.
   */
  buildDependencies() {
    this.language.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((language: any) => {
      this.settingsService.setLanguage(language);
    });
    this.dateFormat.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((dateFormat: string) => {
      this.settingsService.setDateFormat(dateFormat);
    });
    this.datetimeFormat.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((datetimeFormat: string) => {
      this.settingsService.setDatetimeFormat(datetimeFormat);
    });
    this.decimalsToDisplay.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((decimals: string) => {
      this.settingsService.setDecimalToDisplay(decimals);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

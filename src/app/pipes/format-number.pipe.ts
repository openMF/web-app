import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

@Pipe({ name: 'formatNumber' })
export class FormatNumberPipe implements PipeTransform {
  constructor(
    private decimalFormat: DecimalPipe,
    private settingsService: SettingsService
  ) {}

<<<<<<< HEAD
  transform(value: string | number, defaultValue: any): string {
=======
  transform(value: string | number, defaultValue?: any, digits?: string | number): string {
>>>>>>> origin/dev
    if (value === undefined) {
      return defaultValue ? defaultValue : '';
    }
    const decimals = digits !== undefined ? digits : this.settingsService.decimals;
    const format = `1.${decimals}-${decimals}`;
    return this.decimalFormat.transform(value, format);
  }
}

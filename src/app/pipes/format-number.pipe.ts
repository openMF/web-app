import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

@Pipe({ name: 'formatNumber' })
export class FormatNumberPipe implements PipeTransform {
  constructor(
    private decimalFormat: DecimalPipe,
    private settingsService: SettingsService
  ) {}

  transform(value: string | number, defaultValue: any): string {
    if (value === undefined) {
      return defaultValue ? defaultValue : '';
    }
    const decimals = this.settingsService.decimals;
    const format = `1.${decimals}-${decimals}`;
    return this.decimalFormat.transform(value, format);
  }
}

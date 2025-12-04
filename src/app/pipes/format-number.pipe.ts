import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

@Pipe({ name: 'formatNumber' })
export class FormatNumberPipe implements PipeTransform {
  private decimalFormat = inject(DecimalPipe);
  private settingsService = inject(SettingsService);

  transform(value: string | number, defaultValue: any): string {
    if (value === undefined) {
      return defaultValue ? defaultValue : '';
    }
    const decimals = this.settingsService.decimals;
    const format = `1.${decimals}-${decimals}`;
    return this.decimalFormat.transform(value, format);
  }
}

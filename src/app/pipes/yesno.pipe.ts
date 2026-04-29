import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'yesNo' })
export class YesnoPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: boolean, ...args: unknown[]): string {
    if (value == null) {
      return null;
    }
    const result = value ? 'Yes' : 'No';
    return this.translateService.instant('labels.buttons.' + result);
  }
}

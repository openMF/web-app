import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'yesNo' })
export class YesnoPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(value: boolean, ...args: unknown[]): string {
    if (value == null) {
      return null;
    }
    const result = value ? 'Yes' : 'No';
    return this.translateService.instant('labels.buttons.' + result);
  }
}

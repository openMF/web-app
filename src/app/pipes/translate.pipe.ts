import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'translateKey', standalone: true })
export class TranslatePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(attributeValue: any, group: string, prefix: string = 'labels'): string {
    const translationKey = `${prefix}.${group}.${attributeValue}`;
    return this.translateService.instant(translationKey);
  }
}

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'translateKey', standalone: true })
export class TranslatePipe implements PipeTransform {
  private translateService = inject(TranslateService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  transform(attributeValue: any, group: string, prefix: string = 'labels'): string {
    const translationKey = `${prefix}.${group}.${attributeValue}`;
    return this.translateService.instant(translationKey);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateCatalog'
})
export class TranslateCatalogPipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  transform(attributeValue: any, suffix?: string): string {
    return this.translateService.instant('labels.catalogs.' + attributeValue);
  }

}

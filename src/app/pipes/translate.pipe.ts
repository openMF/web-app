import { Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Pipe({ name: 'translateKey', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translateService = inject(TranslateService);
  private onLangChange: Subscription;

  constructor() {
    this.onLangChange = this.translateService.onLangChange.subscribe(() => {
      // Trigger change detection when language changes
    });
  }

  ngOnDestroy(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
    }
  }

  transform(attributeValue: any, group: string, prefix: string = 'labels'): string {
    if (!attributeValue) {
      return attributeValue;
    }
    const translationKey = `${prefix}.${group}.${attributeValue}`;
    return this.translateService.instant(translationKey);
  }
}

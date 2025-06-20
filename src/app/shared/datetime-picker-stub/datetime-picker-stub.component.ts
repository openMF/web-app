import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/prefer-standalone */
@Component({
  selector: 'ngx-mat-datetime-picker',
  template: `
    <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker></mat-datepicker>
  `,
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class DatetimePickerStubComponent {
  @Input() enableMeridian: boolean = true;
}

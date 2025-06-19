import { Component, Input } from '@angular/core';
import { MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';

/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/prefer-standalone */
@Component({
  selector: 'ngx-mat-datetime-picker',
  template: `
    <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker></mat-datepicker>
  `,
  imports: [
    MatDatepickerToggle,
    MatDatepicker
  ]
})
export class DatetimePickerStubComponent {
  @Input() enableMeridian: boolean = true;
}

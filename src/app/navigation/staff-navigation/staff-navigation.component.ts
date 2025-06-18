/** Angular Imports */
import { Component, Input } from '@angular/core';
import {
  MatCardHeader,
  MatCardTitleGroup,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { YesnoPipe } from '../../pipes/yesno.pipe';

@Component({
  selector: 'mifosx-staff-navigation',
  templateUrl: './staff-navigation.component.html',
  styleUrls: ['./staff-navigation.component.scss'],
  imports: [
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatTooltip,
    MatCardSubtitle,
    MatCardContent,
    NgIf,
    TranslatePipe,
    DateFormatPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class StaffNavigationComponent {
  @Input() employeeData: any;
  @Input() centerData: any;

  constructor() {}
}

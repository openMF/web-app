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
import { NgIf } from '@angular/common';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-office-navigation',
  templateUrl: './office-navigation.component.html',
  styleUrls: ['./office-navigation.component.scss'],
  imports: [
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatCardSubtitle,
    NgIf,
    ExternalIdentifierComponent,
    MatCardContent,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class OfficeNavigationComponent {
  @Input() officeData: any;
  @Input() employeeData: any;

  constructor() {}
}

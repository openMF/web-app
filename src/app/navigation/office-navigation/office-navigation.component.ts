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
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-office-navigation',
  templateUrl: './office-navigation.component.html',
  styleUrls: ['./office-navigation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    MatCardTitleGroup,
    MatCardTitle,
    MatCardSubtitle,
    ExternalIdentifierComponent,
    DateFormatPipe
  ]
})
export class OfficeNavigationComponent {
  @Input() officeData: any;
  @Input() employeeData: any;

  constructor() {}
}

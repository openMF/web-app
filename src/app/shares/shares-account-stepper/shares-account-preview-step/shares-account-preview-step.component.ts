/** Angular Imports */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

/**
 * Shares account preview step
 */
@Component({
  selector: 'mifosx-shares-account-preview-step',
  templateUrl: './shares-account-preview-step.component.html',
  styleUrls: ['./shares-account-preview-step.component.scss'],
  imports: [
    MatDivider,
    NgIf,
    ExternalIdentifierComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    RouterLink,
    TranslatePipe,
    FindPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class SharesAccountPreviewStepComponent {
  /** Shares Account Product Template */
  @Input() sharesAccountProductTemplate: any;
  /** Shares Account Template */
  @Input() sharesAccountTemplate: any;
  /** Shares Account Terms Form */
  @Input() sharesAccountTermsForm: any;
  /** Shares Account */
  @Input() sharesAccount: any;

  /** Display columns for charges table. */
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType'
  ];

  /** Form submission event */
  @Output() submitEvent = new EventEmitter();

  constructor() {}
}

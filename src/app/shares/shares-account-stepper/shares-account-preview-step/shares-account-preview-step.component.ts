/** Angular Imports */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
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
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Shares account preview step
 */
@Component({
  selector: 'mifosx-shares-account-preview-step',
  templateUrl: './shares-account-preview-step.component.html',
  styleUrls: ['./shares-account-preview-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
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
    MatStepperPrevious,
    FaIconComponent,
    FindPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
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

/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MatTableDataSource,
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
import { MatDivider } from '@angular/material/divider';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Savings account preview step
 */
@Component({
  selector: 'mifosx-savings-account-preview-step',
  templateUrl: './savings-account-preview-step.component.html',
  styleUrls: ['./savings-account-preview-step.component.scss'],
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
export class SavingsAccountPreviewStepComponent implements OnChanges {
  /** Savings Account Product Template */
  @Input() savingsAccountProductTemplate: any;
  /** Savings Account Template */
  @Input() savingsAccountTemplate: any;
  /** Savings Account Terms Form */
  @Input() savingsAccountTermsForm: any;
  /** Savings Account */
  @Input() savingsAccount: any;
  /** active Client Members in case of GSIM Account */
  @Input() activeClientMembers?: any;

  /** Table Data Source */
  dataSource: any;

  /** Display columns for charges table */
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date',
    'repaymentsEvery'
  ];
  /** Columns to be displayed in active members table. */
  membersDisplayedColumns: string[] = [
    'id',
    'name'
  ];

  /** Form submission event */
  @Output() submitEvent = new EventEmitter();

  constructor(private translateService: TranslateService) {}

  ngOnChanges(): void {
    if (this.activeClientMembers?.length > 0) {
      this.dataSource = new MatTableDataSource<any>(this.activeClientMembers.filter((member: any) => member.selected));
    }
  }

  getCatalogTranslation(text: string): string {
    return this.translateService.instant('labels.catalogs.' + text);
  }
}

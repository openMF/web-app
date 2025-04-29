/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

/**
 * Savings account preview step
 */
@Component({
  selector: 'mifosx-savings-account-preview-step',
  templateUrl: './savings-account-preview-step.component.html',
  styleUrls: ['./savings-account-preview-step.component.scss']
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

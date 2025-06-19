/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
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
import { MatSort } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { StatusLookupPipe } from '../../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Center General Tab Component
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatTooltip,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    StatusLookupPipe,
    DateFormatPipe
  ]
})
export class GeneralTabComponent {
  /** Savings Account Table Columns */
  savingsAccountColumns: string[] = [
    'Account No',
    'Products',
    'Balance',
    'Actions'
  ];
  /** Groups Table Columns */
  groupsColumns: string[] = [
    'Account No',
    'Group Name',
    'Office Name',
    'Submitted On'
  ];
  /** Stores the summary of center */
  centerSummaryData: any;
  /** Stores Center Data for particular center */
  centerViewData: any;
  /** Stores Saving Account for particular center */
  savingsAccountData: any;
  /** Stores Group Data */
  groupResourceData: any;

  /**
   * Retrieves the data for centers
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { centerSummaryData: any; centerViewData: any; savingsAccountData: any }) => {
      this.centerSummaryData = data.centerSummaryData[0];
      this.centerViewData = data.centerViewData;
      this.savingsAccountData = data.savingsAccountData.savingsAccounts;
      this.groupResourceData = data.centerViewData.groupMembers;
    });
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }
}

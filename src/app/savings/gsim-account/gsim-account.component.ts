/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface SavingAccount {
  accountNo: string;
  savingsProductName?: string;
  status: {
    code: string;
    value: string;
  };
  summary?: {
    accountBalance: number;
  };
}

interface GroupData {
  groupName?: string;
}

/**
 * GSIM Accounts Overview component.
 */
@Component({
  selector: 'mifosx-gsim-account',
  templateUrl: './gsim-account.component.html',
  styleUrls: ['./gsim-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgClass,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    StatusLookupPipe
  ]
})
export class GsimAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  /** Columns to be displayed in charge overview table. */
  displayedColumns: string[] = [
    'clientDetails',
    'savingsAccount',
    'products',
    'balance',
    'Actions'
  ];
  /** Data source for charge overview table. */
  dataSource: MatTableDataSource<any>;
  /** Charge Overview data */
  gsimOverviewData: any;

  savingAccountData: SavingAccount | null = null;

  groupsData: GroupData | null = null;

  /** Paginator for charge overview table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /**
   * Retrieves the charge overview data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor() {
    this.route.data.subscribe((data: { gsimData: any; savingAccountData: any; groupsData: any }) => {
      this.gsimOverviewData = data.gsimData[0].childGSIMAccounts;
      this.savingAccountData = data.savingAccountData;
      this.groupsData = data.groupsData;
    });
  }

  ngOnInit(): void {
    this.setLoanClientChargeOverview();
  }

  /**
   * Set Client Charge Overview.
   */
  setLoanClientChargeOverview() {
    this.dataSource = new MatTableDataSource(this.gsimOverviewData);
    // this.dataSource.paginator = this.paginator;
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }
}

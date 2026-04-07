/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component } from '@angular/core';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Bulk Import component.
 */
@Component({
  selector: 'mifosx-bulk-import',
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatNavList,
    MatListItem,
    MatIcon,
    FaIconComponent
  ]
})
export class BulkImportComponent {
  // Initialize an array of 17 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(17).fill(false);

  /** Bulk Import Options */
  bulkImportOptions = [
    {
      permission: 'CREATE_OFFICE',
      routerLink: 'Offices',
      icon: 'building',
      title: 'labels.heading.Offices',
      explanation: 'labels.text.Download, Upload Offices Template',
      index: 0
    },
    {
      permission: 'READ_USER',
      routerLink: 'Users',
      icon: 'user',
      title: 'labels.heading.Users',
      explanation: 'labels.text.Download offices template and Upload office excel files',
      index: 1
    },
    {
      permission: 'READ_GROUP',
      routerLink: 'Groups',
      icon: 'users',
      title: 'labels.heading.Groups',
      explanation: 'labels.text.Download groups template and Upload group excel files',
      index: 2
    },
    {
      permission: 'READ_LOAN',
      routerLink: 'Loan Accounts',
      icon: 'money-bill-alt',
      title: 'labels.heading.Loan Accounts',
      explanation: 'labels.text.Download loan accounts template and upload loan account excel files',
      index: 3
    },
    {
      permission: 'READ_SAVINGSACCOUNT',
      routerLink: 'Savings Accounts',
      icon: 'briefcase',
      title: 'labels.heading.Savings Accounts',
      explanation: 'labels.text.Download savings accounts template and upload savings account excel files',
      index: 4
    },
    {
      permission: 'READ_FIXEDDEPOSITACCOUNT',
      routerLink: 'Fixed Deposit Accounts',
      icon: 'briefcase',
      title: 'labels.heading.Fixed Deposit Accounts',
      explanation: 'labels.text.Download fixed deposit accounts template and upload fixed deposit account excel files',
      index: 5
    },
    {
      permission: 'READ_GLACCOUNT',
      routerLink: 'Chart of Accounts',
      icon: 'money-bill-alt',
      title: 'labels.heading.Chart of Accounts',
      explanation: 'labels.text.Download chart of accounts template and upload chart of account excel files',
      index: 6
    },
    {
      permission: 'READ_SHAREACCOUNT',
      routerLink: 'Share Accounts',
      icon: 'briefcase',
      title: 'labels.heading.Share Accounts',
      explanation: 'labels.text.Download share accounts template and upload share account excel files',
      index: 7
    },
    {
      permission: 'READ_STAFF',
      routerLink: 'Employees',
      icon: 'user',
      title: 'labels.heading.Employees',
      explanation: 'labels.text.Download employees template and upload employees excel files',
      index: 8
    },
    {
      permission: 'READ_CLIENT',
      routerLink: 'Clients',
      icon: 'user',
      title: 'labels.heading.Clients',
      explanation: 'labels.text.Download clients template and upload clients excel files',
      index: 9
    },
    {
      permission: 'READ_CENTER',
      routerLink: 'Centers',
      icon: 'users',
      title: 'labels.heading.Centers',
      explanation: 'labels.text.Download centers template and upload centers excel files',
      index: 10
    },
    {
      permission: 'READ_LOAN',
      routerLink: 'Loan Repayments',
      icon: 'briefcase',
      title: 'labels.heading.Loan Repayments',
      explanation: 'labels.text.Download loan repayments template and upload loan repayment excel files',
      index: 11
    },
    {
      permission: 'READ_SAVINGSACCOUNT',
      routerLink: 'Savings Transactions',
      icon: 'briefcase',
      title: 'labels.heading.Savings Transactions',
      explanation: 'labels.text.Download savings transactions template and upload savings transaction excel files',
      index: 12
    },
    {
      permission: 'READ_FIXEDDEPOSITACCOUNT',
      routerLink: 'Fixed Deposit Transactions',
      icon: 'briefcase',
      title: 'labels.heading.Fixed Deposit Transactions',
      explanation:
        'labels.text.Download fixed deposit transactions template and upload fixed deposit transaction excel files',
      index: 13
    },
    {
      permission: 'READ_RECURRINGDEPOSITACCOUNT',
      routerLink: 'Recurring Deposit Transactions',
      icon: 'briefcase',
      title: 'labels.heading.Recurring Deposit Transactions',
      explanation:
        'labels.text.Download recurring deposit transactions template and upload recurring deposit transaction excel files',
      index: 14
    },
    {
      permission: 'READ_JOURNALENTRY',
      routerLink: 'Journal Entries',
      icon: 'chevron-right',
      title: 'labels.heading.Journal Entries',
      explanation: 'labels.text.Download journal entries template and upload journal entries excel files',
      index: 15
    },
    {
      permission: 'READ_GUARANTOR',
      routerLink: 'Guarantors',
      icon: 'chevron-right',
      title: 'labels.heading.Guarantors',
      explanation: 'labels.text.Download guarantors template and upload guarantor excel files',
      index: 16
    }
  ];

  constructor() {}

  /**
   * Popover function
   * @param arrowNumber - The index of the boolean value to toggle.
   */
  arrowBooleansToggle(arrowNumber: number) {
    // Toggle the boolean value at the given index
    this.arrowBooleans[arrowNumber] = !this.arrowBooleans[arrowNumber];
  }
}

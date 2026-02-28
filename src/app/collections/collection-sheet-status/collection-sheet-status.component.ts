/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsService } from '../collections.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'mifosx-collection-sheet-status',
  templateUrl: './collection-sheet-status.component.html',
  styleUrl: './collection-sheet-status.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class CollectionSheetStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collectionsService = inject(CollectionsService);

  sheetId: number;
  collectionSheet: any = null;
  groups: any[] = [];
  expandedClients: { [key: string]: boolean } = {};
  isLoading = true;
  isRetrying = false;
  errorMessage: string = '';
  txnColumns = [
    'transactionType',
    'productName',
    'accountNo',
    'amount',
    'status',
    'transactionId',
    'errorMessage'
  ];

  // Summary
  summary = { total: 0, success: 0, failed: 0, partial: 0, pending: 0 };
  centerTotal = 0;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.sheetId = Number(idParam);
      this.fetchDetails();
    } else {
      this.router.navigate(['/collections/submitted-collection-sheets']);
    }
  }

  fetchDetails() {
    this.isLoading = true;
    this.errorMessage = '';
    this.collectionsService.getCollectionSheetDetails(this.sheetId).subscribe({
      next: (response: any) => {
        this.collectionSheet = response;
        this.processGroups(response);
        this.updateSummary(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch collection sheet details', err);
        this.errorMessage = 'Failed to load collection sheet details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  processGroups(sheet: any) {
    const rawClients = sheet.clients || [];
    let centerTotal = 0;
    let successClients = 0;
    let partialClients = 0;
    let failedClients = 0;
    let pendingClients = 0;

    // Group clients by groupId
    const groupMap: { [key: number]: any } = {};
    for (const client of rawClients) {
      const gid = client.groupId || 0;
      if (!groupMap[gid]) {
        groupMap[gid] = {
          groupId: gid,
          groupName: client.groupName || 'Group #' + gid,
          clients: [],
          groupTotal: 0
        };
      }
      const txns = client.transactions || [];
      const clientTotal = txns.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      centerTotal += clientTotal;
      groupMap[gid].groupTotal += clientTotal;

      // Compute actual status from transaction data
      const txnSuccess = txns.filter((t: any) => t.status === 'SUCCESS').length;
      const txnFailed = txns.filter((t: any) => t.status === 'FAILED').length;
      let computedStatus = client.status;
      if (txns.length > 0) {
        if (txnFailed === 0) {
          computedStatus = 'SUCCESS';
          successClients++;
        } else if (txnSuccess > 0) {
          computedStatus = 'PARTIAL_FAILURE';
          partialClients++;
        } else {
          computedStatus = 'FAILED';
          failedClients++;
        }
      } else if (client.status === 'PENDING') {
        pendingClients++;
      } else {
        successClients++;
      }

      groupMap[gid].clients.push({ ...client, clientTotal, status: computedStatus });
    }

    this.groups = Object.values(groupMap);
    this.centerTotal = centerTotal;

    this.summary = {
      total: rawClients.length,
      success: successClients,
      partial: partialClients,
      failed: failedClients,
      pending: pendingClients
    };

    // Expand all clients by default
    for (const client of rawClients) {
      this.expandedClients[client.clientEntryId] = true;
    }
  }

  updateSummary(sheet: any) {
    // Counts are now computed in processGroups from actual transaction data
  }

  toggleClient(clientEntryId: number) {
    this.expandedClients[clientEntryId] = !this.expandedClients[clientEntryId];
  }

  retryAllFailed() {
    if (this.isRetrying) return;
    this.isRetrying = true;
    this.collectionsService.retryCollectionSheet(this.sheetId).subscribe({
      next: () => {
        this.isRetrying = false;
        this.fetchDetails();
      },
      error: (err) => {
        console.error('Failed to retry', err);
        this.isRetrying = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/collections/submitted-collection-sheets']);
  }
}

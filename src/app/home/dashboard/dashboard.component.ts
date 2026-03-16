/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { activities } from '../activities';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { AsyncPipe, DecimalPipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { ClientTrendsBarComponent } from './client-trends-bar/client-trends-bar.component';
import { AmountDisbursedPieComponent } from './amount-disbursed-pie/amount-disbursed-pie.component';
import { AmountCollectedPieComponent } from './amount-collected-pie/amount-collected-pie.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'mifosx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocompleteTrigger,
    MatAutocomplete,
    ClientTrendsBarComponent,
    AmountDisbursedPieComponent,
    AmountCollectedPieComponent,
    AsyncPipe,
    DecimalPipe,
    CurrencyPipe,
    PercentPipe
  ]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private dashboardService = inject(DashboardService);

  activeLoans = 0;
  totalCollections = 0;
  parRatio = 0;
  newClients = 0;

  userActivity: string[];
  recentActivities: string[];
  frequentActivities: string[];
  searchText: UntypedFormControl = new UntypedFormControl();
  filteredActivities: Observable<any[]>;
  allActivities: any[] = activities;

  constructor() {
    try {
      const savedLocation = localStorage.getItem('mifosXLocation');
      this.userActivity = savedLocation ? JSON.parse(savedLocation) : [];
      if (!Array.isArray(this.userActivity)) {
        this.userActivity = [];
      }
    } catch (e) {
      this.userActivity = [];
    }
  }

  ngOnInit() {
    this.recentActivities = this.getRecentActivities();
    this.frequentActivities = this.getFrequentActivities();
    this.setFilteredActivities();
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.dashboardService.getActiveLoansSummary().subscribe({
      next: (response: any) => {
        if (response && response.columnHeaders && response.data) {
          const cols = response.columnHeaders;
          const activeLoansIdx = cols.findIndex((c: any) => c.columnName === 'No. Active Loans');
          const clientsIdx = cols.findIndex((c: any) => c.columnName === 'No. of Clients');
          const princRepaidIdx = cols.findIndex((c: any) => c.columnName === 'Principal Repaid');
          const intRepaidIdx = cols.findIndex((c: any) => c.columnName === 'Interest Repaid');
          const feesRepaidIdx = cols.findIndex((c: any) => c.columnName === 'Fees Repaid');
          const penRepaidIdx = cols.findIndex((c: any) => c.columnName === 'Penalties Repaid');
          const princOverdueIdx = cols.findIndex((c: any) => c.columnName === 'Principal Overdue');
          const princOutIdx = cols.findIndex((c: any) => c.columnName === 'Principal Outstanding');

          if (activeLoansIdx === -1 || princOutIdx === -1) {
            return;
          }

          let totalActiveLoans = 0;
          let totalClients = 0;
          let totalRepaid = 0;
          let totalOverdue = 0;
          let totalOutstanding = 0;

          response.data.forEach((item: any) => {
            const row = item.row;
            totalActiveLoans += row[activeLoansIdx] || 0;
            totalClients += row[clientsIdx] || 0;
            totalRepaid +=
              (princRepaidIdx !== -1 ? row[princRepaidIdx] || 0 : 0) +
              (intRepaidIdx !== -1 ? row[intRepaidIdx] || 0 : 0) +
              (feesRepaidIdx !== -1 ? row[feesRepaidIdx] || 0 : 0) +
              (penRepaidIdx !== -1 ? row[penRepaidIdx] || 0 : 0);
            totalOverdue += princOverdueIdx !== -1 ? row[princOverdueIdx] || 0 : 0;
            totalOutstanding += row[princOutIdx] || 0;
          });

          this.activeLoans = totalActiveLoans;
          this.newClients = totalClients;
          this.totalCollections = totalRepaid;
          this.parRatio = totalOutstanding > 0 ? totalOverdue / totalOutstanding : 0;
        }
      },
      error: () => {
        this.activeLoans = 0;
        this.newClients = 0;
        this.totalCollections = 0;
        this.parRatio = 0;
      }
    });
  }

  getRecentActivities() {
    const reverseActivities = [...this.userActivity].reverse();
    const uniqueActivities: string[] = [];
    reverseActivities.forEach((activity: string) => {
      if (!uniqueActivities.includes(activity)) {
        uniqueActivities.push(activity);
      }
    });
    return uniqueActivities
      .filter(
        (activity: string) => ![
            '/',
            '/login',
            '/home',
            '/dashboard'
          ].includes(activity)
      )
      .slice(0, 8);
  }

  getFrequentActivities() {
    const frequencyCounts: any = {};
    let index = this.userActivity?.length;
    while (index) {
      const activity = this.userActivity[--index];
      frequencyCounts[activity] = (frequencyCounts[activity] || 0) + 1;
    }
    return Object.entries(frequencyCounts)
      .sort((a: any, b: any) => b[1] - a[1])
      .map((entry: any[]) => entry[0])
      .filter(
        (activity: string) => ![
            '/',
            '/login',
            '/home',
            '/dashboard'
          ].includes(activity)
      )
      .slice(0, 8);
  }

  navigatetoActivity(activity: string) {
    this.router.navigateByUrl(activity);
  }

  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges.pipe(
      map((activity: any) => (typeof activity === 'string' ? activity : activity.activity)),
      map((activityName: string) => (activityName ? this.filterActivity(activityName) : this.allActivities))
    );
  }

  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter((activity) => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }
}

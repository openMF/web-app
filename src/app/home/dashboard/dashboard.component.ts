/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { activities } from '../activities';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { NgFor, AsyncPipe } from '@angular/common';
import { ClientTrendsBarComponent } from './client-trends-bar/client-trends-bar.component';
import { AmountDisbursedPieComponent } from './amount-disbursed-pie/amount-disbursed-pie.component';
import { AmountCollectedPieComponent } from './amount-collected-pie/amount-collected-pie.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
/**
 * Dashboard component.
 */
@Component({
  selector: 'mifosx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocompleteTrigger,
    MatAutocomplete,
    ClientTrendsBarComponent,
    AmountDisbursedPieComponent,
    AmountCollectedPieComponent,
    AsyncPipe
  ]
})
export class DashboardComponent implements OnInit {
  /** Array of all user activities */
  userActivity: string[];
  /** Array of most recent user activities */
  recentActivities: string[];
  /** Array of most frequent user activities */
  frequentActivities: string[];
  /** Search Text. */
  searchText: UntypedFormControl = new UntypedFormControl();
  /** Filtered Activities. */
  filteredActivities: Observable<any[]>;
  /** All User Activities. */
  allActivities: any[] = activities;

  /**
   * Gets user activities from local storage.
   */
  constructor(private router: Router) {
    this.userActivity = JSON.parse(localStorage.getItem('mifosXLocation'));
  }

  ngOnInit() {
    this.recentActivities = this.getRecentActivities();
    this.frequentActivities = this.getFrequentActivities();
    this.setFilteredActivities();
  }

  /**
   * Returns top eight recent activities.
   */
  getRecentActivities() {
    const reverseActivities = this.userActivity.reverse();
    const uniqueActivities: string[] = [];
    reverseActivities.forEach((activity: string) => {
      if (!uniqueActivities.includes(activity)) {
        uniqueActivities.push(activity);
      }
    });
    const topEightRecentActivities = uniqueActivities
      .filter(
        (activity: string) => ![
            '/',
            '/login',
            '/home',
            '/dashboard'
          ].includes(activity)
      )
      .slice(0, 8);
    return topEightRecentActivities;
  }

  /**
   * Returns top eight frequent activities.
   */
  getFrequentActivities() {
    const frequencyCounts: any = {};
    let index = this.userActivity?.length;
    while (index) {
      frequencyCounts[this.userActivity[--index]] = (frequencyCounts[this.userActivity[index]] || 0) + 1;
    }
    const frequencyCountsArray = Object.entries(frequencyCounts);
    const topEigthFrequentActivities = frequencyCountsArray
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
    return topEigthFrequentActivities;
  }

  /**
   * Navigates to the activity
   */
  navigatetoActivity(activity: string) {
    this.router.navigateByUrl(activity);
  }

  /**
   * Sets filtered activities for autocomplete.
   */
  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges.pipe(
      map((activity: any) => (typeof activity === 'string' ? activity : activity.activity)),
      map((activityName: string) => (activityName ? this.filterActivity(activityName) : this.allActivities))
    );
  }

  /**
   * Filters activities.
   * @param activityName Activity name to filter activity by.
   * @returns {any} Filtered activities.
   */
  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter((activity) => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }
}

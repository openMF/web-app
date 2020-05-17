/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

/** Custom Imports. */
import { activities } from './activities';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';

/**
 * Home component.
 */
@Component({
  selector: 'mifosx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  /** Username of authenticated user. */
  username: string;
  /** Activity Form. */
  activityForm: any;
  /** Search Text. */
  searchText: FormControl = new FormControl();
  /** Filtered Activities. */
  filteredActivities: Observable<any[]>;
  /** All User Activities. */
  allActivities: any[] = activities;

  /**
   * @param {AuthenticationService} authenticationService Authentication Service.
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor(private authenticationService: AuthenticationService) { }

  /**
   * Sets the username of the authenticated user.
   * Set Form.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.setFilteredActivities();
  }

  /**
   * Sets filtered activities for autocomplete.
   */
  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges
    .pipe(
      map((activity: any) => typeof activity === 'string' ? activity : activity.activity),
      map((activityName: string) => activityName ? this.filterActivity(activityName) : this.allActivities));
  }

  /**
   * Filters activities.
   * @param activityName Activity name to filter activity by.
   * @returns {any} Filtered activities.
   */
  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter(activity => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }

}

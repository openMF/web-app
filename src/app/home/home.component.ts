/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

/** Custom Imports. */
import { activities } from './activities';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';
import { KeycloakService } from 'keycloak-angular';

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
  searchText: UntypedFormControl = new UntypedFormControl();
  /** Filtered Activities. */
  filteredActivities: Observable<any[]>;
  /** All User Activities. */
  allActivities: any[] = activities;

  /**
   * @param {AuthenticationService} authenticationService Authentication Service.
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor(private authenticationService: AuthenticationService, private keyCloakService: KeycloakService) { }

  /**
   * Sets the username of the authenticated user.
   * Set Form.
   */
  ngOnInit() {
    this.setFilteredActivities();
  }

  ngDoCheck() {
    if(!this.username) {
      this.username = this.authenticationService.getConnectedUsername();
    }
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

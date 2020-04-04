/** Angular Imports */
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  /** Check if searched. */
  isSeearched: boolean = false;
  /** Activity Form. */
  activityForm: any;
  /** Search Text. */
  searchText: any;
  /** All User Activities. */
  allActivities: any[] = [
    { activity: 'client', path: '/clients'},
    { activity: 'groups', path: '/groups'},
    { activity: 'centers', path: '/centers'},
    { activity: 'accounting', path: '/accounting'},
    { activity: 'users', path: '/users'},
    { activity: 'organization', path: '/organization'},
    { activity: 'system', path: '/system'},
    { activity: 'templates', path: '/templates'},
    { activity: 'self-service users', path: '/self-service/users'},
    { activity: 'self-service app-configuration', path: '/self-service/app-configuration'},
    { activity: 'task management', path: '/self-service/task-management'}
  ]

  /**
   * @param {AuthenticationService} authenticationService Authentication Service.
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor(private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder) { }

  /**
   * Sets the username of the authenticated user.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.setSearchForm();
  }

  /**
   * Set Search Form.
   */
  setSearchForm() {
    this.activityForm = this.formBuilder.group({
      'searchText': []
    });
  }

}

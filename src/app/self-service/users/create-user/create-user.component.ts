/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

/**
 * Create self service user component.
 *
 * TODO: Complete functionality once API is available.
 */
@Component({
  selector: 'mifosx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  /** Denotes type of user. */
  userTypes = ['Existing User', 'New User'];
  /** Radio button group form control for type of user. */
  userType = new FormControl(this.userTypes[0]);
  /** Placeholder for office data. */
  officeData = ['Office 1', 'Office 2'];
  /** Placeholder for staff data. */
  staffData = ['Staff 1', 'Staff 2'];
  /** Placeholder for client data. */
  clientData = ['Client 1', 'Client 2'];
  /** Placeholder for gender data. */
  genderData = ['Male', 'Female'];
  /** Minimum date of birth of user allowed. */
  minDate = new Date(1900, 0, 1);
  /** Maximum date of birth of user allowed. */
  maxDate = new Date();

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  isCollapsed = false;
  userTypes = ['Existing User', 'New User'];
  currentUserType = this.userTypes[0];
  officeData: string[];
  staffData: string[];
  clientData: string[];
  genderData: string[];

  constructor() { }

  ngOnInit() {
  }

}

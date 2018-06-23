import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  page = 1;
  isCollapsed = true;

  constructor() { }

  ngOnInit() {
  }

}

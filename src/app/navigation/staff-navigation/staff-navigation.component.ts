/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mifosx-staff-navigation',
  templateUrl: './staff-navigation.component.html',
  styleUrls: ['./staff-navigation.component.scss']
})
export class StaffNavigationComponent implements OnInit {

  @Input() employeeData: any;
  @Input() centerData: any;

  constructor() { }

  ngOnInit() {
  }

}

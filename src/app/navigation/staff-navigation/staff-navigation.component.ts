/** Angular Imports */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'mifosx-staff-navigation',
  templateUrl: './staff-navigation.component.html',
  styleUrls: ['./staff-navigation.component.scss']
})
export class StaffNavigationComponent {

  @Input() employeeData: any;
  @Input() centerData: any;

  constructor() { }

}

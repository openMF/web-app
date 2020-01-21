
/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mifosx-office-navigation',
  templateUrl: './office-navigation.component.html',
  styleUrls: ['./office-navigation.component.scss']
})
export class OfficeNavigationComponent implements OnInit {

  @Input() officeData: any;
  @Input() employeeData: any;

  constructor() { }

  ngOnInit() {
  }

}

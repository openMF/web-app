/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/**
 * Manage Tax Configurations component.
 */
@Component({
  selector: 'mifosx-manage-tax-configurations',
  templateUrl: './manage-tax-configurations.component.html',
})
export class ManageTaxConfigurationsComponent implements OnInit {
  // Initialize an array of 2 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(2).fill(false);

  constructor() { }

  ngOnInit() {
  }

  /**
   * Popover function
   * @param arrowNumber - The index of the boolean value to toggle.
   */

  arrowBooleansToggle(arrowNumber:  number) {
    // Toggle the boolean value at the given index
    this.arrowBooleans[arrowNumber] = !this.arrowBooleans[arrowNumber];
  }

}

/** Angular Imports */
import { Component } from '@angular/core';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Manage Tax Configurations component.
 */
@Component({
  selector: 'mifosx-manage-tax-configurations',
  templateUrl: './manage-tax-configurations.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatNavList,
    MatListItem,
    MatIcon,
    FaIconComponent,
    MatLine
  ]
})
export class ManageTaxConfigurationsComponent {
  // Initialize an array of 2 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(2).fill(false);

  constructor() {}

  /**
   * Popover function
   * @param arrowNumber - The index of the boolean value to toggle.
   */

  arrowBooleansToggle(arrowNumber: number) {
    // Toggle the boolean value at the given index
    this.arrowBooleans[arrowNumber] = !this.arrowBooleans[arrowNumber];
  }
}

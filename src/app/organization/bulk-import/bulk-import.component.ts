/** Angular Imports */
import { Component } from '@angular/core';

/**
 * Bulk Import component.
 */
@Component({
  selector: 'mifosx-bulk-import',
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.scss']
})
export class BulkImportComponent {
  // Initialize an array of 17 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(17).fill(false);

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

/** Angular Imports */
import { Component } from '@angular/core';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Bulk Import component.
 */
@Component({
  selector: 'mifosx-bulk-import',
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatNavList,
    MatListItem,
    MatIcon,
    FaIconComponent,
    MatLine
  ]
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

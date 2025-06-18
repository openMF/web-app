/** Angular Imports */
import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatNavList, MatListItem } from '@angular/material/list';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Bulk Import component.
 */
@Component({
  selector: 'mifosx-bulk-import',
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.scss'],
  imports: [
    MatCard,
    MatNavList,
    HasPermissionDirective,
    MatListItem,
    MatIcon,
    RouterLink,
    FaIconComponent,
    MatLine,
    NgIf,
    TranslatePipe,
    NgxTranslatePipe
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

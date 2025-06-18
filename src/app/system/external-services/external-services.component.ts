/** Angular Imports */
import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatNavList, MatListItem } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * External Services component.
 */
@Component({
  selector: 'mifosx-external-services',
  templateUrl: './external-services.component.html',
  imports: [
    MatCard,
    MatNavList,
    MatListItem,
    RouterLink,
    MatIcon,
    FaIconComponent,
    MatLine,
    NgIf,
    NgxTranslatePipe
  ]
})
export class ExternalServicesComponent {
  // Initialize an array of 4 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(4).fill(false);

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

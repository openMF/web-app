/** Angular Imports */
import { Component } from '@angular/core';

/**
 * External Services component.
 */
@Component({
  selector: 'mifosx-external-services',
  templateUrl: './external-services.component.html',
})
export class ExternalServicesComponent {
  // Initialize an array of 4 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(4).fill(false);

  constructor() { }

  /**
   * Popover function
   * @param arrowNumber - The index of the boolean value to toggle.
   */

  arrowBooleansToggle(arrowNumber:  number) {
    // Toggle the boolean value at the given index
    this.arrowBooleans[arrowNumber] = !this.arrowBooleans[arrowNumber];
  }

}

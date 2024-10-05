import { Component } from '@angular/core';

@Component({
  selector: 'mifosx-manage-delinquency-buckets',
  templateUrl: './manage-delinquency-buckets.component.html',
  styleUrls: ['./manage-delinquency-buckets.component.scss']
})
export class ManageDelinquencyBucketsComponent {
  // Initialize an array of 2 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(2).fill(false);

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

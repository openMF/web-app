import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatNavList, MatListItem } from '@angular/material/list';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-manage-delinquency-buckets',
  templateUrl: './manage-delinquency-buckets.component.html',
  styleUrls: ['./manage-delinquency-buckets.component.scss'],
  imports: [
    MatCard,
    MatNavList,
    HasPermissionDirective,
    MatListItem,
    RouterLink,
    MatIcon,
    FaIconComponent,
    MatLine,
    NgIf,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ManageDelinquencyBucketsComponent {
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

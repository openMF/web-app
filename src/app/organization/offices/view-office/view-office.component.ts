/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * View Office Component
 */
@Component({
  selector: 'mifosx-view-office',
  templateUrl: './view-office.component.html',
  styleUrls: ['./view-office.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    NgFor,
    HasPermissionDirective,
    MatTabNavPanel,
    RouterOutlet,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ViewOfficeComponent {
  /** Office datatables data */
  officeDatatables: any;

  /**
   * Fetches office datatables from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { officeDatatables: any }) => {
      this.officeDatatables = data.officeDatatables;
    });
  }
}

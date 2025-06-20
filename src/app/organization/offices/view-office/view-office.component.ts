/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Office Component
 */
@Component({
  selector: 'mifosx-view-office',
  templateUrl: './view-office.component.html',
  styleUrls: ['./view-office.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
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

/** Angular Imports */
import { Component, inject } from '@angular/core';
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
  private route = inject(ActivatedRoute);

  /** Office datatables data */
  officeDatatables: any;

  /**
   * Fetches office datatables from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor() {
    this.route.data.subscribe((data: { officeDatatables: any }) => {
      this.officeDatatables = data.officeDatatables;
    });
  }
}

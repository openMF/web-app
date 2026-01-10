/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-share-product',
  templateUrl: './view-share-product.component.html',
  styleUrls: ['./view-share-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ]
})
export class ViewShareProductComponent {
  private route = inject(ActivatedRoute);

  shareProductDatatables: any = [];

  constructor() {
    this.route.data.subscribe((data: { shareProductDatatables: any }) => {
      this.shareProductDatatables = [];
      data.shareProductDatatables.forEach((datatable: any) => {
        this.shareProductDatatables.push(datatable);
      });
    });
  }
}

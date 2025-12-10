import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-saving-product',
  templateUrl: './view-saving-product.component.html',
  styleUrls: ['./view-saving-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ]
})
export class ViewSavingProductComponent {
  private route = inject(ActivatedRoute);

  savingProductDatatables: any = [];

  constructor() {
    this.route.data.subscribe((data: { savingProductDatatables: any }) => {
      this.savingProductDatatables = [];
      data.savingProductDatatables.forEach((datatable: any) => {
        if (datatable.entitySubType === 'Savings Product') {
          this.savingProductDatatables.push(datatable);
        }
      });
    });
  }
}

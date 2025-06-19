import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-saving-product',
  templateUrl: './view-saving-product.component.html',
  styleUrls: ['./view-saving-product.component.scss'],
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
export class ViewSavingProductComponent {
  savingProductDatatables: any = [];

  constructor(private route: ActivatedRoute) {
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

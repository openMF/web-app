import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-share-product',
  templateUrl: './view-share-product.component.html',
  styleUrls: ['./view-share-product.component.scss'],
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
export class ViewShareProductComponent {
  shareProductDatatables: any = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { shareProductDatatables: any }) => {
      this.shareProductDatatables = [];
      data.shareProductDatatables.forEach((datatable: any) => {
        this.shareProductDatatables.push(datatable);
      });
    });
  }
}

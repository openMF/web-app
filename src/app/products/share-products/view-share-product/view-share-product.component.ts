import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-share-product',
  templateUrl: './view-share-product.component.html',
  styleUrls: ['./view-share-product.component.scss']
})
export class ViewShareProductComponent implements OnInit {

  shareProductDatatables: any = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { shareProductDatatables: any }) => {
      this.shareProductDatatables = [];
      data.shareProductDatatables.forEach((datatable: any) => {
        this.shareProductDatatables.push(datatable);
      });
    });
  }

  ngOnInit() {
  }

}

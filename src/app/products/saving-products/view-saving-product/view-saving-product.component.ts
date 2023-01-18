import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-saving-product',
  templateUrl: './view-saving-product.component.html',
  styleUrls: ['./view-saving-product.component.scss']
})
export class ViewSavingProductComponent implements OnInit {

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

  ngOnInit() {
  }

}

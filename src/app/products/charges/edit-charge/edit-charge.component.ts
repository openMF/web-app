import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'app/products/products.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mifosx-edit-charge',
  templateUrl: './edit-charge.component.html',
  styleUrls: ['./edit-charge.component.scss']
})
export class EditChargeComponent implements OnInit {

  /** Selected Data. */
  chargeData: any;

    /**
     * Retrieves the charge data from `resolve`.
     * @param {ProductsService} productsService Products Service.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     * @param {MatDialog} dialog Dialog reference.
     */

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.route.data.subscribe((data: { chargesTemplate: any }) => {
      this.chargeData = data.chargesTemplate;
      //(<HTMLInputElement>document.getElementById('chargeAppliesTo')).value=this.chargeData.chargeAppliesTo.value;
    });
  }

  ngOnInit() {
    console.log(this.chargeData);
  }

}

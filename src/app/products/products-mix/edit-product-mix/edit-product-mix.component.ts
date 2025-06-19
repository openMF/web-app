/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { ProductsService } from '../../products.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Edit Product mix component.
 */
@Component({
  selector: 'mifosx-edit-product-mix',
  templateUrl: './edit-product-mix.component.html',
  styleUrls: ['./edit-product-mix.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    NgIf,
    MatSelect,
    NgFor,
    MatOption,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    NgxTranslatePipe
  ]
})
export class EditProductMixComponent implements OnInit {
  /** Product mix form. */
  productMixForm: UntypedFormGroup;
  /** Products mix template data. */
  productMixData: any;
  /** Product option data. */
  productOptionData: any;
  /** Product data. */
  productData: any;

  /**
   * Retrieves the Products mix template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { productMix: any }) => {
      this.productMixData = data.productMix;
    });
  }

  /**
   * Creates the product mix form and sets data of the product mix form.
   */
  ngOnInit() {
    this.createProductMixForm();
    this.setFormData();
  }

  /**
   * Creates the product mix form
   */
  createProductMixForm() {
    this.productMixForm = this.formBuilder.group({
      productId: [{ value: this.productMixData.productName, disabled: true }],
      restrictedProducts: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Sets the conditional controls of the product mix form.
   */
  setFormData() {
    const restrictedProductsData: {}[] = this.productMixData.restrictedProducts;
    this.productData = [
      ...restrictedProductsData,
      ...this.productMixData.allowedProducts
    ];
    this.productMixForm
      .get('restrictedProducts')
      .setValue([...restrictedProductsData.map((restrictedProduct: any) => restrictedProduct.id)]);
  }

  /**
   * Submits the product mix form and edits product mix,
   * if successful redirects to products mix.
   */
  submit() {
    const productMix = {
      restrictedProducts: this.productMixForm.value.restrictedProducts
    };
    const productMixId = this.productMixData.productId;
    this.productsService.updateProductMix(productMix, productMixId).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}

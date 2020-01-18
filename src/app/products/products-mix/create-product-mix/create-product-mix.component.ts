/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Create Product mix component.
 */
@Component({
  selector: 'mifosx-create-product-mix',
  templateUrl: './create-product-mix.component.html',
  styleUrls: ['./create-product-mix.component.scss']
})
export class CreateProductMixComponent implements OnInit {

  /** Product mix form. */
  productMixForm: FormGroup;
  /** Products mix template data. */
  productsMixTemplateData: any;
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
  constructor(private formBuilder: FormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe(( data: { productsMixTemplate: any }) => {
      this.productsMixTemplateData = data.productsMixTemplate;
    });
  }

  /**
   * Creates the product mix form and conditional controls of the product mix form.
   */
  ngOnInit() {
    this.createProductMixForm();
    this.setConditionalControls();
  }

  /**
   * Creates the product mix form
   */
  createProductMixForm() {
    this.productOptionData = this.productsMixTemplateData.productOptions;
    this.productMixForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'restrictedProducts': ['', Validators.required]
    });
  }

  /**
   * Sets the conditional controls of the product mix form.
   */
  setConditionalControls() {
    this.productMixForm.get('productId').valueChanges.subscribe(productId => {
      this.productData = undefined;
      this.productMixForm.get('restrictedProducts').reset();
      this.productsService.getProductMixTemplate(productId).subscribe((productMixTemplateData: any) => {
        const restrictedProductsData = productMixTemplateData.restrictedProducts;
        this.productData = [...restrictedProductsData, ...productMixTemplateData.allowedProducts];
        this.productMixForm.get('restrictedProducts').setValue([...restrictedProductsData.map((restrictedProduct: any) => restrictedProduct.id)]);
        }
      );
    });
  }

  /**
   * Submits the product mix form and creates product mix,
   * if successful redirects to products mix.
   */
  submit() {
    const productMix = {
      restrictedProducts: this.productMixForm.value.restrictedProducts
    };
    const productMixId = this.productMixForm.value.productId;
    this.productsService.createProductMix(productMix, productMixId).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }
}

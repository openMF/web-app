/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Create Collateral component.
 */
@Component({
  selector: 'mifosx-create-collateral',
  templateUrl: './create-collateral.component.html',
  styleUrls: ['./create-collateral.component.scss']
})
export class CreateCollateralComponent implements OnInit {

  /** Collateral form */
  collateralForm: UntypedFormGroup;
  /** Charges Template data */
  collateralTemplateData: any;

  /**
   * Retrieves the collateral template data
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private productsService: ProductsService,
              private route:  ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
                this.route.data.subscribe((data: { collateralTemplate: any }) => {
                  this.collateralTemplateData = data.collateralTemplate;
                });
               }

  /**
   * Create and sets Collateral Form
   */
  ngOnInit(): void {
    this.createCollateralForm();
  }

  /**
   * Create the Collateral Form
   */
  createCollateralForm() {
    this.collateralForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'unitType': ['', Validators.required],
      'basePrice': ['', Validators.required],
      'pctToBase': ['', Validators.required],
      'currency': ['', Validators.required],
      'quality': ['', Validators.required]
    });
  }

  /**
   * Submit a new collateral Product form
   */
  submit() {
    const collateralFormData = this.collateralForm.value;
    const locale = this.settingsService.language.code;
    const data = {
      ...collateralFormData,
      locale
    };
    this.productsService.createCollateral(data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }



}

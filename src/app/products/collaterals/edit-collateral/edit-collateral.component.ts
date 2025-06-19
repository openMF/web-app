/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-edit-collateral',
  templateUrl: './edit-collateral.component.html',
  styleUrls: ['./edit-collateral.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    NgIf,
    MatError,
    MatSelect,
    NgFor,
    MatOption,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class EditCollateralComponent implements OnInit {
  /** Colalteral Data */
  collateralData: any;
  /** Collateral Template */
  collateralTemplateData: any;
  /** Collateral Form */
  collateralForm: UntypedFormGroup;

  /**
   * Retrieves the Collateral Data from `resolve`
   * @param {ProductsService} productsService Products Service.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(
    private productsService: ProductsService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { collateral: any; collateralTemplate: any }) => {
      this.collateralData = data.collateral;
      this.collateralTemplateData = data.collateralTemplate;
    });
  }

  ngOnInit(): void {
    this.editCollateralForm();
  }

  /**
   * Edit Collateral Form
   */
  editCollateralForm() {
    this.collateralForm = this.formBuilder.group({
      name: [
        this.collateralData.name,
        Validators.required
      ],
      quality: [
        this.collateralData.quality,
        Validators.required
      ],
      unitType: [
        this.collateralData.unitType,
        Validators.required
      ],
      basePrice: [
        this.collateralData.basePrice,
        Validators.required
      ],
      pctToBase: [
        this.collateralData.pctToBase,
        Validators.required
      ],
      currency: [
        this.collateralData.currency,
        Validators.required
      ]
    });
  }

  /**
   * Submits the updated Collateral Form
   */
  submit() {
    const collateral = this.collateralForm.value;
    collateral.locale = this.settingsService.language.code;
    this.productsService.updateCollateral(this.collateralData.id.toString(), collateral).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}

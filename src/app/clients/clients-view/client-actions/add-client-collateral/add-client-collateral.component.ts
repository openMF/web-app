/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Custom Services
 */
import { ClientsService } from 'app/clients/clients.service';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-add-client-collateral',
  templateUrl: './add-client-collateral.component.html',
  styleUrls: ['./add-client-collateral.component.scss']
})
export class AddClientCollateralComponent implements OnInit {

  /** Client Collateral Form */
  clientCollateralForm: UntypedFormGroup;
  /** Client Collateral Options */
  clientCollateralOptions: any;
  /** Client Id */
  clientId: any;
  /** Collateral Details */
  collateralDetails: any;

  /**
   * Retirives Collateral Form from `resolve`
   * @param {FormBuilder} formBuilder Form bUilder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ProductsService} productsService Products Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    ) {
      this.route.data.subscribe((data: { clientActionData: any }) => {
        this.clientCollateralOptions = data.clientActionData;
        console.log(this.clientCollateralOptions);
      });
      this.clientId = this.route.parent.snapshot.params['clientId'];
    }

  ngOnInit(): void {
    this.createClientCollateralForm();
    this.buildDependencies();
  }

  /**
   * Subscribe to Form controls value changes
   */
  buildDependencies() {
    this.clientCollateralForm.controls.collateralId.valueChanges.subscribe(collateralId => {
      this.productsService.getCollateral(collateralId).subscribe((data: any) => {
        this.collateralDetails = data;
        console.log(data);
        this.clientCollateralForm.patchValue({
          'name': data.name,
          'quality': data.quality,
          'unitType': data.unitType,
          'basePrice': this.collateralDetails.basePrice,
          'pctToBase': this.collateralDetails.pctToBase,
        });
      });
    });
    this.clientCollateralForm.controls.quantity.valueChanges.subscribe((quantity: any) => {
      this.clientCollateralForm.patchValue({
        'totalValue': this.collateralDetails.basePrice * quantity,
        'totalCollateralValue': this.collateralDetails.basePrice * this.collateralDetails.pctToBase * quantity / 100
      });
    });
  }

  /**
   * Creates the Clients Collaterals Form
   */
  createClientCollateralForm() {
    this.clientCollateralForm = this.formBuilder.group({
      'collateralId': [ '', Validators.required ],
      'quantity': [ '', Validators.required ],
      'name': [{ value: '', disabled: true }],
      'quality': [{value: '', disabled: true}],
      'unitType': [{value: '', disabled: true}],
      'basePrice': [{value: '', disabled: true}],
      'pctToBase': [{value: '', disabled: true}],
      'totalValue': [{value: '', disabled: true}],
      'totalCollateralValue': [{value: '', disabled: true}],
    });
  }

  /**
   * Submits Client Collateral
   */
  submit() {
    const collateralId = this.clientCollateralForm.value.collateralId;
    const quantity = this.clientCollateralForm.value.quantity;
    const locale = this.settingsService.language.code;
    const clientCollateral = {
      collateralId,
      quantity,
      locale
    };
    this.clientsService.createClientCollateral(this.clientId, clientCollateral).subscribe(() => {
      this.router.navigate(['../../'], {relativeTo: this.route});
    });
  }

}

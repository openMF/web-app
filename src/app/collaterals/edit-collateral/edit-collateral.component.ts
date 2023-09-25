/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { CollateralsService } from '../collaterals.service';

@Component({
  selector: 'mifosx-edit-collateral',
  templateUrl: './edit-collateral.component.html',
  styleUrls: ['./edit-collateral.component.scss']
})
export class EditCollateralComponent implements OnInit {


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
   * @param {SettingsService} settingsService Settings Service
   * @param {CollateralsService} collateralService Collateral Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private collateralService: CollateralsService
    ) {
      this.route.data.subscribe((data: { clientCollateralData: any }) => {
        this.collateralDetails = data.clientCollateralData;
      });
      this.clientId = this.route.parent.snapshot.params['clientId'];
    }

  ngOnInit(): void {
    this.createClientCollateralForm();
  }

  /**
   * Creates the Edit Clients Collaterals Form
   */
  createClientCollateralForm() {
    this.clientCollateralForm = this.formBuilder.group({
      'quantity': [ '', Validators.required ],
      'name': [{ value: '', disabled: true }],
      'total': [{value: '', disabled: true}],
      'totalCollateral': [{value: '', disabled: true}],
    });
    this.clientCollateralForm.patchValue({
      'name': this.collateralDetails.name,
      'quantity': this.collateralDetails.quantity,
      'total': this.collateralDetails.total,
      'totalCollateral': this.collateralDetails.totalCollateral,
    });
  }

  /**
   * Submits Updated Client Collateral
   */
  submit() {
    const collateralId = this.collateralDetails.id;
    const quantity = this.clientCollateralForm.value.quantity;
    const locale = this.settingsService.language.code;
    const clientCollateralData = {
      quantity,
      locale
    };
    this.collateralService.updateClientCollateral(this.clientId, collateralId, clientCollateralData).subscribe(() => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}

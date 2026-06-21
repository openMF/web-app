/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/**
 * Custom Services
 */
import { ClientsService } from 'app/clients/clients.service';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { ClientActionNotifierService } from '../client-action-notifier.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-add-client-collateral',
  templateUrl: './add-client-collateral.component.html',
  styleUrls: ['./add-client-collateral.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddClientCollateralComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly clientsService = inject(ClientsService);
  private readonly settingsService = inject(SettingsService);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

  /** Client Collateral Form */
  clientCollateralForm: FormGroup;
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
   * @param {ProductsService} productsService Products Service
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.clientCollateralOptions = data.clientActionData;
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
    this.clientCollateralForm.controls.collateralId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((collateralId) => {
        this.productsService.getCollateral(collateralId).subscribe((data: any) => {
          this.collateralDetails = data;
          this.clientCollateralForm.patchValue({
            name: data.name,
            quality: data.quality,
            unitType: data.unitType,
            basePrice: this.collateralDetails.basePrice,
            pctToBase: this.collateralDetails.pctToBase
          });
        });
      });
    this.clientCollateralForm.controls.quantity.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((quantity: any) => {
        this.clientCollateralForm.patchValue({
          totalValue: this.collateralDetails.basePrice * quantity,
          totalCollateralValue: (this.collateralDetails.basePrice * this.collateralDetails.pctToBase * quantity) / 100
        });
      });
  }

  /**
   * Creates the Clients Collaterals Form
   */
  createClientCollateralForm() {
    this.clientCollateralForm = this.formBuilder.group({
      collateralId: [
        '',
        Validators.required
      ],
      quantity: [
        '',
        Validators.required
      ],
      name: [{ value: '', disabled: true }],
      quality: [{ value: '', disabled: true }],
      unitType: [{ value: '', disabled: true }],
      basePrice: [{ value: '', disabled: true }],
      pctToBase: [{ value: '', disabled: true }],
      totalValue: [{ value: '', disabled: true }],
      totalCollateralValue: [{ value: '', disabled: true }]
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
    this.clientsService.createClientCollateral(this.clientId, clientCollateral).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.addCollateral.success', this.route),
      error: () => this.notifier.notify('clients.actions.addCollateral.failure')
    });
  }
}

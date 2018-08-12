/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** rxjs Imports */
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';

/**
 * Two factor authentication component.
 */
@Component({
  selector: 'mifosx-two-factor-authentication',
  templateUrl: './two-factor-authentication.component.html',
  styleUrls: ['./two-factor-authentication.component.scss']
})
export class TwoFactorAuthenticationComponent implements OnInit {

  /** Available delivery methods to receive OTP. */
  twoFactorAuthenticationDeliveryMethods: any;
  /** Delivery method selected to receive OTP. */
  selectedTwoFactorAuthenticationDeliveryMethod: any;
  /** True if OTP is requested. */
  otpRequested = false;
  /** Time for which OTP is valid. */
  tokenValidityTime: number;
  /** Two factor authentication delivery method form group. */
  twoFactorAuthenticationDeliveryMethodForm: FormGroup;
  /** Two factor authentication form group. */
  twoFactorAuthenticationForm: FormGroup;
  /** True if loading. */
  loading = false;
  /** True if loading. */
  resendOTPLoading = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService) {  }

  /**
   * Creates two factor authentication delivery method form.
   *
   * Gets the delivery methods available to receive OTP.
   */
  ngOnInit() {
    this.createTwoFactorAuthenticationDeliveryMethodForm();
    this.authenticationService.getDeliveryMethods()
      .subscribe((deliveryMethods: any) => {
        this.twoFactorAuthenticationDeliveryMethods = deliveryMethods;
      });
  }

  /**
   * Requests OTP via the selected delivery method.
   */
  requestOTP() {
    this.loading = true;
    this.twoFactorAuthenticationDeliveryMethodForm.disable();
    this.selectedTwoFactorAuthenticationDeliveryMethod =
      this.twoFactorAuthenticationDeliveryMethodForm.value.twoFactorAuthenticationDeliveryMethod;

    this.authenticationService.requestOTP(this.selectedTwoFactorAuthenticationDeliveryMethod)
      .pipe(finalize(() => {
        this.twoFactorAuthenticationDeliveryMethodForm.reset();
        this.twoFactorAuthenticationDeliveryMethodForm.markAsPristine();
        // Angular Material Bug: Validation errors won't get removed on reset.
        this.twoFactorAuthenticationDeliveryMethodForm.enable();
        this.loading = false;
      }))
      .subscribe((response: any) => {
        this.createTwoFactorAuthenticationForm();
        this.otpRequested = true;
        this.tokenValidityTime = response.tokenLiveTimeInSec;
      });
  }

  /**
   * Validates the OTP and authenticates the user.
   */
  validateOTP() {
    this.loading = true;
    this.twoFactorAuthenticationForm.disable();
    this.authenticationService.validateOTP(this.twoFactorAuthenticationForm.value.otp)
      .pipe(finalize(() => {
        this.twoFactorAuthenticationForm.reset();
        this.twoFactorAuthenticationForm.markAsPristine();
        // Angular Material Bug: Validation errors won't get removed on reset.
        this.twoFactorAuthenticationForm.enable();
        this.loading = false;
      })).subscribe();
  }

  /**
   * Resends OTP via the selected delivery method.
   */
  resendOTP() {
    this.resendOTPLoading = true;
    this.twoFactorAuthenticationForm.disable();
    this.authenticationService.requestOTP(this.selectedTwoFactorAuthenticationDeliveryMethod)
      .pipe(finalize(() => {
        this.twoFactorAuthenticationForm.reset();
        this.twoFactorAuthenticationForm.markAsPristine();
        // Angular Material Bug: Validation errors won't get removed on reset.
        this.twoFactorAuthenticationForm.enable();
        this.resendOTPLoading = false;
      })).subscribe();
  }

  /**
   * Creates two factor authentication delivery method form.
   */
  private createTwoFactorAuthenticationDeliveryMethodForm() {
    this.twoFactorAuthenticationDeliveryMethodForm = this.formBuilder.group({
      'twoFactorAuthenticationDeliveryMethod': ['', Validators.required]
    });
  }

  /**
   * Creates two factor authentication form.
   */
  private createTwoFactorAuthenticationForm() {
    this.twoFactorAuthenticationForm = this.formBuilder.group({
      'otp': ['', Validators.required]
    });
  }

}

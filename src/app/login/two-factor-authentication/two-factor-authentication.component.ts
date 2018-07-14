import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mifosx-two-factor-authentication',
  templateUrl: './two-factor-authentication.component.html',
  styleUrls: ['./two-factor-authentication.component.scss']
})
export class TwoFactorAuthenticationComponent implements OnInit {

  twoFactorAuthenticationDeliveryMethods: any;
  selectedTwoFactorAuthenticationDeliveryMethod: any;
  loading = false;
  resendOTPLoading = false;
  otpRequested = false;
  tokenValidityTime: number;
  twoFactorAuthenticationDeliveryMethodForm: FormGroup;
  twoFactorAuthenticationForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService) {  }

  ngOnInit() {
    this.createTwoFactorAuthenticationDeliveryMethodForm();
    this.authenticationService.getDeliveryMethods()
      .subscribe(deliveryMethods => {
        this.twoFactorAuthenticationDeliveryMethods = deliveryMethods;
      });
  }

  private createTwoFactorAuthenticationDeliveryMethodForm() {
    this.twoFactorAuthenticationDeliveryMethodForm = this.formBuilder.group({
      'twoFactorAuthenticationDeliveryMethod': ['', Validators.required]
    });
  }

  requestOTP() {
    this.loading = true;
    this.twoFactorAuthenticationDeliveryMethodForm.disable();
    this.selectedTwoFactorAuthenticationDeliveryMethod =
      this.twoFactorAuthenticationDeliveryMethodForm.value.twoFactorAuthenticationDeliveryMethod;

    this.authenticationService.requestOTP(this.selectedTwoFactorAuthenticationDeliveryMethod)
      .pipe(finalize(() => {
        this.twoFactorAuthenticationDeliveryMethodForm.reset();
        this.twoFactorAuthenticationDeliveryMethodForm.markAsPristine();
        // Bug: Validation errors won't get removed on reset
        this.twoFactorAuthenticationDeliveryMethodForm.enable();
        this.loading = false;
      }))
      .subscribe((response: any) => {
        this.createTwoFactorAuthenticationForm();
        this.otpRequested = true;
        this.tokenValidityTime = response.tokenLiveTimeInSec;
      });
  }

  private createTwoFactorAuthenticationForm() {
    this.twoFactorAuthenticationForm = this.formBuilder.group({
      'otp': ['', Validators.required]
    });
  }

  validateOTP() {
    this.loading = true;
    this.twoFactorAuthenticationForm.disable();
    this.authenticationService.validateOTP(this.twoFactorAuthenticationForm.value.otp)
      .pipe(finalize(() => {
        this.twoFactorAuthenticationForm.reset();
        this.twoFactorAuthenticationForm.markAsPristine();
        // Bug: Validation errors won't get removed on reset
        this.twoFactorAuthenticationForm.enable();
        this.loading = false;
      })).subscribe();
  }

  resendOTP() {
    this.resendOTPLoading = true;
    this.twoFactorAuthenticationForm.disable();
    this.authenticationService.requestOTP(this.selectedTwoFactorAuthenticationDeliveryMethod)
      .pipe(finalize(() => {
        this.twoFactorAuthenticationForm.reset();
        this.twoFactorAuthenticationForm.markAsPristine();
        // Bug: Validation errors won't get removed on reset
        this.twoFactorAuthenticationForm.enable();
        this.resendOTPLoading = false;
      })).subscribe();
  }
}

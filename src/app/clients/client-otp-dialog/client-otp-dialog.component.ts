import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientsService } from '../clients.service';
import { NgOtpInputComponent } from 'ng-otp-input';

@Component({
  selector: 'mifosx-client-otp-dialog',
  templateUrl: './client-otp-dialog.component.html',
  styleUrls: ['./client-otp-dialog.component.scss']
})
export class ClientOtpDialogComponent implements OnInit {
  private otp: string;
  private interval: any;
  countdown: number = 60;
  resendDisabled: boolean = true;
  ngOtpConfig: any;
  @ViewChild(NgOtpInputComponent, { static: false}) ngOtpInputRef: NgOtpInputComponent;

  constructor(private dialogRef: MatDialogRef<ClientOtpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private clientsService: ClientsService) {
      this.ngOtpConfig = {
        length: data.otpLength,
        letterCase: 'Upper',
        inputStyles: {
          'width': '40px',
          'height': '40px'
        }
      };
     }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  /**
   * Starts the countdown timer for OTP resend.
   */
  startCountdown() {
    this.interval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.resendDisabled = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  /**
   * Event handler for OTP change
   * @param otp OTP value entered by user
   */
  onOtpChange(otp) {
    this.otp = otp;
    if (otp.length === this.ngOtpConfig.length) {
      this.submit();
    }
  }

  /**
   * Submits the OTP to validate
   */
  private submit() {
    const otpData = {
      otpCode: this.otp,
      mobilePhoneNumber: this.data.mobileNo
    };
    this.clientsService.validateClientOTP(this.data.countryId, otpData).subscribe(() => {
      this.dialogRef.close(true);
    }, () => {
      this.resetOtpInput();
    });
  }

  /**
   * Resends the OTP to the client
   */
  resendOtp() {
    if (!this.resendDisabled) {
      const data = {mobilePhoneNumber: this.data.mobileNo};
      this.clientsService.generateClientOTP(this.data.countryId, data).subscribe(() => {
        this.resetOtpInput();
      });
      this.resendDisabled = true;
      this.countdown = 60; // Reset countdown
      this.startCountdown();
    }
  }

  /**
   * Resets the OTP input field
   */
  private resetOtpInput(): void {
    this.ngOtpInputRef.setValue('');
    this.ngOtpInputRef.focusTo(this.ngOtpInputRef.getBoxId(0));
  }
}

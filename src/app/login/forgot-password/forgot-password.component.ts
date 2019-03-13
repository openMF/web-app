import {Component,OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'mifosx-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  submitted = false;
  constructor() { }

  ngOnInit() {
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }
  resetField() {
    this.email = new FormControl('', [Validators.required, Validators.email]);
  }
  submit() {

    console.log("Entered Email :  " + this.email.value);
    // send this email to server , generate otp and send to mail.
  }


}




import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { finalize } from 'rxjs/operators';

import { Logger, AuthenticationService } from '../../core';

const log = new Logger('Login');

@Component({
  selector: 'mifosx-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;
  passwordInputType: string;
  error: string;
  loading = false;
  authenticationEvent: any;

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService) {  }

  ngOnInit() {
    this.createLoginForm();
    this.passwordInputType = 'password';
  }

  public login() {
    this.loading = true;
    this.loginForm.disable();
    this.authenticationService.login(this.loginForm.value)
      .pipe(finalize(() => {
        this.loginForm.reset();
        this.loginForm.markAsPristine();
        // Bug: Validation errors won't get removed on reset
        this.loginForm.enable();
        this.loading = false;
      })).subscribe();
  }

  public forgotPassword() {
    console.log('TODO: Forgot Password');
  }

  private createLoginForm() {
    this.loginForm = this.formBuilder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'remember': false
    });
  }

}

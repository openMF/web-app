import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from '../core/i18n.service';
import { AlertService } from '../core/alert.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'mifosx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  version: string = environment.version;
  languages = ['en-US', 'fr-FR'];
  language = this.languages[0];
  resetPassword = false;
  twoFactorAuthenticationRequired = false;
  alert$: any;

  constructor(private i18nService: I18nService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit() {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: any) => {
      const alertType = alertEvent.type;
      if (alertType === 'Password Expired') {
        this.twoFactorAuthenticationRequired = false;
        this.resetPassword = true;
      } else if (alertType === 'Two Factor Authentication Required') {
        this.resetPassword = false;
        this.twoFactorAuthenticationRequired = true;
      } else if (alertType === 'Authentication Success') {
        this.resetPassword = false;
        this.twoFactorAuthenticationRequired = false;
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  // get languages(): string[] {
  //   return this.i18nService.supportedLanguages;
  // }

  ngOnDestroy() {
    this.alert$.unsubscribe();
  }

}

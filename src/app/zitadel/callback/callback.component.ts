import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { AlertService } from '../../core/alert/alert.service';

@Component({
  selector: 'mifosx-callback',
  templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);
  private alertService = inject(AlertService);
  private authenticationService = inject(AuthenticationService);

  async ngOnInit(): Promise<void> {
    try {
      const success = await this.authenticationService.handleOAuthCallback();

      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.alertService.alert({
          type: 'Authentication Failed',
          message: 'Unable to complete authentication. Please try again.'
        });
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Authentication callback failed:', error);
      this.alertService.alert({
        type: 'Authentication Error',
        message: 'An error occurred during authentication. Please try again.'
      });
      this.router.navigate(['/login']);
    }
  }
}

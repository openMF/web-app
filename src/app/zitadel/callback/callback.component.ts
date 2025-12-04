import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'mifosx-callback',
  templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  async ngOnInit(): Promise<void> {
    try {
      const code = sessionStorage.getItem('auth_code');
      if (code) {
        const codeVerifier = sessionStorage.getItem('code_verifier');
        try {
          await this.authService.exchangeCodeForTokens(code, codeVerifier);
        } finally {
          // Clean up sensitive data immediately after use
          sessionStorage.removeItem('auth_code');
          sessionStorage.removeItem('code_verifier');
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      // Navigate to login page
      this.router.navigate(['/login']);
    }
  }
}

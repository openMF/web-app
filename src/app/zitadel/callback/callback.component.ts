import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'mifosx-callback',
  template: `<p>Processing callback...</p>`
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        const codeVerifier = localStorage.getItem('code_verifier');
        this.authService.exchangeCodeForTokens(code, codeVerifier);
      } else {
        console.warn('No code was received in the URL');
      }
    });
  }
}

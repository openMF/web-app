import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'mifosx-callback',
  templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    let code = localStorage.getItem('auth_code');

    if (code) {
      const codeVerifier = localStorage.getItem('code_verifier');
      this.authService.exchangeCodeForTokens(code, codeVerifier);
    }
  }
}

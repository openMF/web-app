/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';

/**
 * Home component.
 */
@Component({
  selector: 'mifosx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  /** Username of authenticated user. */
  username: string;

  /**
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(private authenticationService: AuthenticationService) { }

  /**
   * Sets the username of the authenticated user.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
  }

}

/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';

/**
 * Sidenav component.
 */
@Component({
  selector: 'mifosx-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  /** True if sidenav is in collapsed state. */
  @Input() sidenavCollapsed: boolean;
  /** Username of authenticated user. */
  username: string;

  /**
   * @param {Router} router Router for navigation.
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(private router: Router,
              private authenticationService: AuthenticationService) { }

  /**
   * Sets the username of the authenticated user.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
  }

  /**
   * Logs out the authenticated user and redirects to login page.
   */
  logout() {
    this.authenticationService.logout()
      .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

}

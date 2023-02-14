/** Angular Imports */
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Toolbar component.
 */
@Component({
  selector: 'mifosx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  /** Eligible permissions to view the country dropdown and an admin menu. */
  allowedPermissions: any = ["ALL_FUNCTIONS"];

  /** Save the user data from the session storage. */
  userData: any;

  /** Allow an authorised user to select a country and view an Admin menu. */
  displayAdminOptions: boolean = false;
  
  /** Only active countries. */
  activeCountries: any = [];

  /** Limit the checks when it has already did. */
  hasChecked: boolean = false;

  /** Get the selected country name if it is set */
  selectedCountryName: any;

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = true;

  /** Instance of sidenav. */
  @Input() sidenav: MatSidenav;
  /** Sidenav collapse event. */
  @Output() collapse = new EventEmitter<boolean>();

  /**
   * @param {BreakpointObserver} breakpointObserver Breakpoint observer to detect screen size.
   * @param {Router} router Router for navigation.
   * @param {AuthenticationService} authenticationService Authentication service.
   */
  constructor(private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationService,
    private dialog: MatDialog) {}

  /**
   * Subscribes to breakpoint for handset.
   */
  ngOnInit() {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset && this.sidenavCollapsed) {
        this.toggleSidenavCollapse(false);
      }
    });
  }

  ngDoCheck() {
    this.userData = this.authenticationService.getCredentials();
    
    if(!this.hasChecked && this.userData?.permissions.length > 0) {
      let hasAnyPermission = this.allowedPermissions.filter(item => this.userData.permissions.includes(item)).length > 0;
      if(hasAnyPermission) {
        this.getActiveCountries();
        this.displayAdminOptions = true;
      }
      this.hasChecked = true;
    }

    if(this.displayAdminOptions) {
      this.selectedCountryName = JSON.parse(sessionStorage.getItem("selectedCountry"))?.name;
    }
  }
  
  /**
  * List active countries.
  */
  getActiveCountries() {
    this.organizationService.getCountries().subscribe((response: any) => {
      this.activeCountries = response?.filter(item => item.status);
    });
  }

  /**
   * Saves the selected country id in the session storage.
   */
  saveTheSelectedCountry(country: any) {
    sessionStorage.setItem('selectedCountry', JSON.stringify({countryId: country.id, name: country.name}));
  }
      
  /**
   * Toggles the current state of sidenav.
   */
  toggleSidenav() {
    this.sidenav.toggle();
  }

  /**
   * Toggles the current collapsed state of sidenav.
   */
  toggleSidenavCollapse(sidenavCollapsed?: boolean) {
    this.sidenavCollapsed = sidenavCollapsed || !this.sidenavCollapsed;
    this.collapse.emit(this.sidenavCollapsed);
  }

  /**
   * Logs out the authenticated user and redirects to login page.
   */
  logout() {
    this.authenticationService.logout();
    // .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  /**
   * Opens Mifos JIRA Wiki page.
   */
  help() {
    window.open('https://mifosforge.jira.com/wiki/spaces/docs/pages/52035622/User+Manual', '_blank');
  }

}

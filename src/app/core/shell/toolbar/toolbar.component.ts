/** Angular Imports */
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, AfterViewInit, ElementRef, TemplateRef, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Components */
import { ConfigurationWizardComponent } from '../../../configuration-wizard/configuration-wizard.component';

/**
 * Toolbar component.
 */
@Component({
  selector: 'mifosx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, AfterViewInit, AfterContentChecked {

  /* Reference of institution */
  @ViewChild('institution') institution: ElementRef<any>;
  /* Template for popover on institution */
  @ViewChild('templateInstitution') templateInstitution: TemplateRef<any>;
  /* Reference of appMenu */
  @ViewChild('appMenu') appMenu: ElementRef<any>;
  /* Template for popover on appMenu */
  @ViewChild('templateAppMenu') templateAppMenu: TemplateRef<any>;


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
   * @param {MatDialog} dialog MatDialog.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private authenticationService: AuthenticationService,
              private popoverService: PopoverService,
              private configurationWizardService: ConfigurationWizardService,
              private dialog: MatDialog,
              private changeDetector: ChangeDetectorRef) { }

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

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
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
    this.authenticationService.logout()
      .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  /**
   * Opens Mifos JIRA Wiki page.
   */
  help() {
    window.open('https://mifosforge.jira.com/wiki/spaces/docs/pages/52035622/User+Manual', '_blank');
  }
  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: ElementRef<any> | HTMLElement): void {
    setTimeout(() => this.popoverService.open(template, target, 'bottom', true, {}), 200);
  }

  /**
   * Next Step (SideNavbar) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showToolbar = false;
    this.configurationWizardService.showToolbarAdmin = false;
    this.configurationWizardService.showSideNav = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  /**
   * Open Configuration Wizard Dialog
   */
  openDialog() {
    const configWizardRef = this.dialog.open(ConfigurationWizardComponent, {});
    configWizardRef.afterClosed().subscribe((response: { show: number }) => {
      if (response.show === 1) {
        this.configurationWizardService.showToolbar = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/home']);
      }
      if (response.show === 2) {
        this.configurationWizardService.showCreateOffice = true;
        this.router.navigate(['/organization']);
      }
      if (response.show === 3) {
        this.configurationWizardService.showDatatables = true;
        this.router.navigate(['/system']);
      }
      if (response.show === 4) {
        this.configurationWizardService.showChartofAccounts = true;
        this.router.navigate(['/accounting']);
      }
      if (response.show === 5) {
        this.configurationWizardService.showCharges = true;
        this.router.navigate(['/products']);
      }
      if (response.show === 6) {
        this.configurationWizardService.showManageFunds = true;
        this.router.navigate(['/organization']);
      }
      if (response.show === 0) {

      }
    });
  }

  /**
   * To show popovers
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showToolbar === true) {
      setTimeout(() => {
        this.showPopover(this.templateInstitution, this.institution.nativeElement);
      });
    }

    if (this.configurationWizardService.showSideNav === true || this.configurationWizardService.showSideNavChartofAccounts === true) {
        this.toggleSidenavCollapse();
    }

    if (this.configurationWizardService.showToolbarAdmin === true) {
      setTimeout(() => {
        this.showPopover(this.templateAppMenu, this.appMenu.nativeElement);
      });
    }
  }

  navigateMenu(routePath: string): void {
    console.log(routePath);
    this.router.navigate([routePath]);
  }

}

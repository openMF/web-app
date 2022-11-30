/** Angular Imports */
import { Component, OnInit, Input, TemplateRef, ElementRef , ViewChild,
         AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

/** Custom Components */
import { KeyboardShortcutsDialogComponent } from 'app/shared/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Imports */
import { frequentActivities } from './frequent-activities';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Sidenav component.
 */
@Component({
  selector: 'mifosx-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, AfterViewInit {

  /** True if sidenav is in collapsed state. */
  @Input() sidenavCollapsed: boolean;

  /** Username of authenticated user. */
  username: string;
  /** Array of all user activities */
  userActivity: string[];
  /** Mapped Activites */
  mappedActivities: any[] = [];
  /** Collection of possible frequent activities */
  frequentActivities: any[] = frequentActivities;

  /* Refernce of logo */
  @ViewChild('logo') logo: ElementRef<any>;
  /* Template for popover on logo */
  @ViewChild('templateLogo') templateLogo: TemplateRef<any>;
  /* Refernce of chart of accounts */
  @ViewChild('chartOfAccounts') chartOfAccounts: ElementRef<any>;
  /* Template for popover on chart of accounts */
  @ViewChild('templateChartOfAccounts') templateChartOfAccounts: TemplateRef<any>;


  /**
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Mat Dialog
   * @param {AuthenticationService} authenticationService Authentication Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private router: Router,
              public dialog: MatDialog,
              private authenticationService: AuthenticationService,
              private settingsService: SettingsService,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.userActivity = JSON.parse(localStorage.getItem('mifosXLocation'));
  }

  /**
   * Sets the username of the authenticated user.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.setMappedAcitivites();
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
   * Opens Keyboard shortcuts dialog.
   */
  showKeyboardShortcuts() {
    const dialogRef = this.dialog.open(KeyboardShortcutsDialogComponent);
    dialogRef.afterClosed().subscribe((response: any) => {});
  }

  /**
   * Returns top three frequent activities.
   */
  getFrequentActivities() {
    const frequencyCounts: any  = {};
    let index  = this.userActivity.length;
    while (index) {
      frequencyCounts[this.userActivity[--index]] = (frequencyCounts[this.userActivity[index]] || 0) + 1;
    }
    const frequencyCountsArray = Object.entries(frequencyCounts);
    const topThreeFrequentActivities =
      frequencyCountsArray
        .sort((a: any, b: any) => b[1] - a[1])
        .map((entry: any[]) => entry[0])
        .filter((activity: string) => !['/', '/login', '/home', '/dashboard'].includes(activity))
        .slice(0, 3);
    return topThreeFrequentActivities;
  }

  /**
   * Maps frequently accessed urls to button objects.
   */
  setMappedAcitivites() {
    const activities: string[] = this.getFrequentActivities();
    activities.forEach((activity: string) => {
      if (activity.includes('/clients')) {
        this.pushActivity('/clients');
      } else if (activity.includes('/groups')) {
        this.pushActivity('/groups');
      } else if (activity.includes('/centers')) {
        this.pushActivity('/centers');
      } else if (activity.includes('/accounting')) {
        this.pushActivity('/accounting');
      } else if (activity.includes('/reports')) {
        this.pushActivity('/reports');
      } else if (activity.includes('/users')) {
        this.pushActivity('/users');
      } else if (activity.includes('/organization')) {
        this.pushActivity('/organization');
      } else if (activity.includes('/system')) {
        this.pushActivity('/system');
      } else if (activity.includes('/products')) {
        this.pushActivity('/products');
      } else if (activity.includes('/templates')) {
        this.pushActivity('/templates');
      } else if (activity.includes('/self-service')) {
        this.pushActivity('/self-service');
      }
    });
    this.mappedActivities.reverse();
  }

  /**
   * Pushes activity to mapped activities
   * @param {string} path Activity Path
   */
  pushActivity(path: string) {
    const activity = this.frequentActivities.find((entry: any) => entry.path === path);
    if (!this.mappedActivities.includes(activity)) {
      this.mappedActivities.push(activity);
    }
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popovers
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showSideNav === true) {
      setTimeout(() => {
          this.showPopover(this.templateLogo, this.logo.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSideNavChartofAccounts === true) {
      setTimeout(() => {
          this.showPopover(this.templateChartOfAccounts, this.chartOfAccounts.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Breadcrumbs) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showSideNav = false;
    this.configurationWizardService.showSideNavChartofAccounts = false;
    this.configurationWizardService.showBreadcrumbs = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  /**
   * Previous Step (Toolbar) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showSideNav = false;
    this.configurationWizardService.showSideNavChartofAccounts = false;
    this.configurationWizardService.showToolbarAdmin = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  get tenantIdentifier(): string {
    if (!this.settingsService.tenantIdentifier || this.settingsService.tenantIdentifier === '') {
      return 'default';
    }
    return this.settingsService.tenantIdentifier;
  }

}

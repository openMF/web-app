/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { environment } from 'environments/environment';
/** Angular Imports */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

/** Custom Components */
import { KeyboardShortcutsDialogComponent } from 'app/shared/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';
import { DocumentationLinksService } from 'app/shared/services/documentation-links.service';

/** Custom Imports */
import { frequentActivities } from './frequent-activities';
import { SettingsService } from 'app/settings/settings.service';
import { NgClass } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatLine } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ThrIconComponent } from 'app/shared/thr-icon/thr-icon.component';
import { remittanceConfig } from '../../../remittances/remittance.config';

import { catchError, finalize, of, take } from 'rxjs';

/**
 * Sidenav component.
 */
@Component({
  selector: 'mifosx-sidenav',
  standalone: true,
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    MatIconButton,
    MatTooltip,
    MatDivider,
    MatNavList,
    MatListItem,
    RouterLinkActive,
    MatIcon,
    MatLine,
    ThrIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent implements OnInit, AfterViewInit {
  readonly cbIldEnabled = environment.cbIldEnabled;
  private router = inject(Router);
  dialog = inject(MatDialog);
  private authenticationService = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);
  private documentationLinks = inject(DocumentationLinksService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private host = inject(ElementRef<HTMLElement>);

  /** Accordion group currently expanded. Null when the dashboard landing is active. */
  openGroup: 'institution' | 'operations' | 'admin' | null = null;
  readonly nestedLink: { exact: boolean } = { exact: false };

  /** True if sidenav is in collapsed state. */
  @Input() sidenavCollapsed: boolean;
  /** Tooltip position */
  tooltipPosition = 'after';
  /** Username of authenticated user. */
  username: string;
  /** Display name shown in the sidebar profile chip. */
  displayName = '';
  /** Initials used in the sidebar avatar. */
  userInitials = '';
  /** Secondary line under the display name (office or tenant). */
  userSubtitle = '';
  /** Array of all user activities */
  userActivity: string[];
  /** Mapped Activites */
  mappedActivities: any[] = [];
  /** Collection of possible frequent activities */
  frequentActivities: any[] = frequentActivities;
  /** Whether remittance feature is enabled */
  mifosRemittanceEnabled = remittanceConfig.isRemittanceEnabled;

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
  constructor() {
    this.userActivity = JSON.parse(localStorage.getItem('mifosXLocation'));
  }

  /**
   * Sets the username of the authenticated user.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials?.username ?? '';
    this.displayName = credentials?.staffDisplayName || this.username;
    this.userInitials = this.initialsFrom(this.displayName);
    this.userSubtitle = credentials?.officeName || this.tenantIdentifier;
    this.setMappedAcitivites();
    this.syncGroupFromUrl(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.syncGroupFromUrl(event.urlAfterRedirects);
        this.cdr.markForCheck();
      });
  }

  isDashboardLinkActive(): boolean {
    return this.isAppHomePath() && !this.isOnboardingLinkActive();
  }

  isOnboardingLinkActive(): boolean {
    const [
      path,
      query = ''
    ] = this.router.url.split('?');
    return this.isAppHomePath(path) && query.includes('view=onboarding');
  }

  isProfileLinkActive(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/settings' || path.startsWith('/settings/') || path === '/profile' || path.startsWith('/profile/');
  }

  private initialsFrom(name: string): string {
    const parts = name
      .trim()
      .split(/[\s._-]+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.trim().slice(0, 2) || 'U').toUpperCase();
  }

  private isAppHomePath(path = this.router.url.split('?')[0]): boolean {
    return path === '/home' || path === '/dashboard' || path.startsWith('/dashboard/');
  }

  isGroupOpen(group: 'institution' | 'operations' | 'admin'): boolean {
    return this.openGroup === group;
  }

  toggleGroup(group: 'institution' | 'operations' | 'admin'): void {
    this.openGroup = this.openGroup === group ? null : group;
    if (!this.openGroup) {
      return;
    }
    setTimeout(() => this.revealOpenGroup());
  }

  /** On a phone, bring the opened submenu into the sheet so its items are not left below the fold. */
  private revealOpenGroup(): void {
    const scroller = this.host.nativeElement.closest('.sidebar-sheet')?.querySelector('.app-sidenav');
    const open = this.host.nativeElement.querySelector('.nav-group.open');
    if (!(scroller instanceof HTMLElement) || !(open instanceof HTMLElement)) {
      return;
    }
    const top = open.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 8;
    scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  private syncGroupFromUrl(url: string): void {
    const path = url.split('?')[0];
    if (
      this.matchesAny(path, [
        '/clients',
        '/loans',
        '/groups',
        '/centers'
      ])
    ) {
      this.openGroup = 'institution';
      return;
    }
    if (
      this.matchesAny(path, [
        '/products',
        '/accounting',
        '/reports',
        '/notifications',
        '/navigation',
        '/checker-inbox-and-tasks',
        '/collections',
        '/remittances',
        '/reporting-dashboard'
      ])
    ) {
      this.openGroup = 'operations';
      return;
    }
    if (
      this.matchesAny(path, [
        '/appusers',
        '/organization',
        '/system',
        '/templates'
      ])
    ) {
      this.openGroup = 'admin';
    }
  }

  private matchesAny(path: string, prefixes: string[]): boolean {
    return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }

  /**
   * Logs out the authenticated user and redirects to login page.
   * Uses unified AuthenticationService which handles both OAuth2 and OIDC logout.
   */
  logout() {
    this.authenticationService
      .logout()
      .pipe(
        take(1),
        catchError(() => of(void 0)),
        finalize(() => this.router.navigate(['/login'], { replaceUrl: true }))
      )
      .subscribe();
  }

  /**
   * Opens Mifos JIRA Wiki page.
   */
  help() {
    this.documentationLinks.open('userManual');
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
    const frequencyCounts: any = {};
    let index = this.userActivity?.length;
    while (index) {
      const activity = this.userActivity[--index];
      frequencyCounts[activity] = (frequencyCounts[activity] || 0) + 1;
    }
    const frequencyCountsArray = Object.entries(frequencyCounts);
    const topThreeFrequentActivities = frequencyCountsArray
      .sort((a: any, b: any) => b[1] - a[1])
      .map((entry: any[]) => entry[0])
      .filter(
        (activity: string) => ![
            '/',
            '/login',
            '/home',
            '/dashboard'
          ].includes(activity)
      )
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
      } else if (activity.includes('/appusers')) {
        this.pushActivity('/appusers');
      } else if (activity.includes('/organization')) {
        this.pushActivity('/organization');
      } else if (activity.includes('/system')) {
        this.pushActivity('/system');
      } else if (activity.includes('/products')) {
        this.pushActivity('/products');
      } else if (activity.includes('/templates')) {
        this.pushActivity('/templates');
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
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    if (!target) {
      return;
    }
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popovers
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showSideNav && this.logo) {
      setTimeout(() => {
        this.showPopover(this.templateLogo, this.logo.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSideNavChartofAccounts && this.chartOfAccounts) {
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

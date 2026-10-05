/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit,
  ElementRef,
  TemplateRef,
  AfterContentChecked,
  ChangeDetectorRef,
  DestroyRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Components */
import { ConfigurationWizardComponent } from '../../../configuration-wizard/configuration-wizard.component';
import { NotificationsTrayComponent } from 'app/shared/notifications-tray/notifications-tray.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SearchToolComponent } from '../../../shared/search-tool/search-tool.component';
import { LanguageSelectorComponent } from '../../../shared/language-selector/language-selector.component';
import { MatIcon } from '@angular/material/icon';
import { NotificationsTrayComponent as NotificationsTrayComponent_1 } from '../../../shared/notifications-tray/notifications-tray.component';
import { ThemeToggleComponent } from '../../../shared/theme-toggle/theme-toggle.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DocumentationLinksService } from 'app/shared/services/documentation-links.service';

/**
 * Toolbar component.
 */
@Component({
  selector: 'mifosx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatToolbar,
    MatIconButton,
    MatTooltip,
    FaIconComponent,
    MatMenuTrigger,
    SearchToolComponent,
    LanguageSelectorComponent,
    MatIcon,
    NotificationsTrayComponent_1,
    ThemeToggleComponent,
    MatMenu,
    MatMenuItem
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, AfterViewInit, AfterContentChecked {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);
  private popoverService = inject(PopoverService);
  private configurationWizardService = inject(ConfigurationWizardService);
  private dialog = inject(MatDialog);
  private changeDetector = inject(ChangeDetectorRef);
  private documentationLinks = inject(DocumentationLinksService);
  private destroyRef = inject(DestroyRef);

  /* Reference of institution */
  @ViewChild('institution') institution: ElementRef<any>;
  /* Template for popover on institution */
  @ViewChild('templateInstitution') templateInstitution: TemplateRef<any>;
  /* Reference of accounting */
  @ViewChild('accounting', { read: ElementRef }) accounting: ElementRef<any>;
  /* Template for popover on accounting */
  @ViewChild('templateAccounting') templateAccounting: TemplateRef<any>;
  /* Reference of reports */
  @ViewChild('reports', { read: ElementRef }) reports: ElementRef<any>;
  /* Template for popover on reports */
  @ViewChild('templateReports') templateReports: TemplateRef<any>;
  /* Reference of admin */
  @ViewChild('admin', { read: ElementRef }) admin: ElementRef<any>;
  /* Template for popover on admin */
  @ViewChild('templateAdmin') templateAdmin: TemplateRef<any>;
  /* Reference of configWizard */
  @ViewChild('configWizard', { read: ElementRef }) configWizard: ElementRef<any>;
  /* Template for popover on configWizard */
  @ViewChild('templateConfigWizard') templateConfigWizard: TemplateRef<any>;
  /* Reference of globalSearch */
  @ViewChild('globalSearch') globalSearch: ElementRef<any>;
  /* Template for popover on globalSearch */
  @ViewChild('templateGlobalSearch') templateGlobalSearch: TemplateRef<any>;
  /* Reference of languageSelector */
  @ViewChild('languageSelector') languageSelector: ElementRef<any>;
  /* Template for popover on languageSelector */
  @ViewChild('templateLanguageSelector') templateLanguageSelector: TemplateRef<any>;
  /* Reference of notifications */
  @ViewChild('notifications') notifications: ElementRef<any>;
  /* Template for popover on notifications */
  @ViewChild('templateNotifications') templateNotifications: TemplateRef<any>;
  /* Reference of themeToggle */
  @ViewChild('themeToggle') themeToggle: ElementRef<any>;
  /* Template for popover on themeToggle */
  @ViewChild('templateThemePicker') templateThemePicker: TemplateRef<any>;
  /* Reference of appMenu */
  @ViewChild('appMenu') appMenu: ElementRef<any>;
  /* Template for popover on appMenu */
  @ViewChild('templateAppMenu') templateAppMenu: TemplateRef<any>;
  @ViewChild('notificationsTray') notificationsTray: NotificationsTrayComponent;

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = true;

  /** Instance of sidenav. */
  @Input() sidenav: MatSidenav;
  /** Sidenav collapse event. */
  @Output() collapse = new EventEmitter<boolean>();

  /**
   * Subscribes to breakpoint for handset.
   */
  ngOnInit() {
    this.isHandset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isHandset) => {
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
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: ElementRef<any> | HTMLElement): void {
    if (!target) {
      return;
    }
    setTimeout(() => this.popoverService.open(template, target, 'bottom', true, {}), 200);
  }

  /**
   * Steps of the toolbar tour, in order. A step's target is undefined when
   * its element isn't rendered, e.g. a menu hidden by mifosxHasPermission.
   */
  private get toolbarTourSteps(): { name: string; template: TemplateRef<any>; target: ElementRef<any> | undefined }[] {
    return [
      { name: 'institution', template: this.templateInstitution, target: this.institution },
      { name: 'accounting', template: this.templateAccounting, target: this.accounting },
      { name: 'reports', template: this.templateReports, target: this.reports },
      { name: 'admin', template: this.templateAdmin, target: this.admin },
      { name: 'configWizard', template: this.templateConfigWizard, target: this.configWizard },
      { name: 'globalSearch', template: this.templateGlobalSearch, target: this.globalSearch },
      { name: 'languageSelector', template: this.templateLanguageSelector, target: this.languageSelector },
      { name: 'notifications', template: this.templateNotifications, target: this.notifications },
      { name: 'themePicker', template: this.templateThemePicker, target: this.themeToggle },
      { name: 'appMenu', template: this.templateAppMenu, target: this.appMenu }
    ];
  }

  /**
   * Shows the first toolbar tour step that is rendered for the current user.
   */
  showFirstTourStep(): void {
    const first = this.toolbarTourSteps.find((step) => step.target);
    if (first) {
      this.showPopover(first.template, first.target);
    } else {
      this.nextStep();
    }
  }

  /**
   * Shows the next rendered toolbar tour step after the current one,
   * or moves on to the sidenav tour if there is none.
   * @param current Name of the current step.
   */
  showNextTourStep(current: string): void {
    const steps = this.toolbarTourSteps;
    const currentIndex = steps.findIndex((step) => step.name === current);
    const next = steps.slice(currentIndex + 1).find((step) => step.target);
    if (next) {
      this.showPopover(next.template, next.target);
    } else {
      this.nextStep();
    }
  }

  /**
   * Shows the previous rendered toolbar tour step before the current one,
   * or the current step again if there is none.
   * @param current Name of the current step.
   */
  showPreviousTourStep(current: string): void {
    const steps = this.toolbarTourSteps;
    const currentIndex = steps.findIndex((step) => step.name === current);
    const previous = steps
      .slice(0, currentIndex)
      .reverse()
      .find((step) => step.target);
    const step = previous ?? steps[currentIndex];
    this.showPopover(step.template, step.target);
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

    configWizardRef.afterClosed().subscribe((response: { show: number } | undefined) => {
      if (!response) {
        return;
      }

      switch (response.show) {
        case 1:
          this.configurationWizardService.showToolbar = true;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate(['/home']);
          break;
        case 2:
          this.configurationWizardService.showCreateOffice = true;
          this.router.navigate(['/organization']);
          break;
        case 3:
          this.configurationWizardService.showDatatables = true;
          this.router.navigate(['/system']);
          break;
        case 4:
          this.configurationWizardService.showChartofAccounts = true;
          this.router.navigate(['/accounting']);
          break;
        case 5:
          this.configurationWizardService.showCharges = true;
          this.router.navigate(['/products']);
          break;
        case 6:
          this.configurationWizardService.showManageFunds = true;
          this.router.navigate(['/organization']);
          break;
        case 0:
          break;
        default:
          break;
      }
    });
  }

  /**
   * To show popovers
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showToolbar) {
      setTimeout(() => {
        this.showFirstTourStep();
      });
    }

    if (this.configurationWizardService.showSideNav || this.configurationWizardService.showSideNavChartofAccounts) {
      this.toggleSidenavCollapse();
    }

    if (this.configurationWizardService.showToolbarAdmin) {
      setTimeout(() => {
        this.showPopover(this.templateAppMenu, this.appMenu.nativeElement);
      });
    }
  }

  navigateMenu(routePath: string): void {
    this.router.navigate([routePath]);
  }
}

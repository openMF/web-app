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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Components */
import { ConfigurationWizardComponent } from '../../../configuration-wizard/configuration-wizard.component';
import { NotificationsTrayComponent } from 'app/shared/notifications-tray/notifications-tray.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SearchToolComponent } from '../../../shared/search-tool/search-tool.component';
import { NotificationsTrayComponent as NotificationsTrayComponent_1 } from '../../../shared/notifications-tray/notifications-tray.component';
import { ThemeToggleComponent } from '../../../shared/theme-toggle/theme-toggle.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ThrIconComponent } from 'app/shared/thr-icon/thr-icon.component';

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
    MatMenuTrigger,
    SearchToolComponent,
    NotificationsTrayComponent_1,
    ThemeToggleComponent,
    BreadcrumbComponent,
    MatMenu,
    MatMenuItem,
    ThrIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, AfterViewInit, AfterContentChecked {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private popoverService = inject(PopoverService);
  private configurationWizardService = inject(ConfigurationWizardService);
  private dialog = inject(MatDialog);
  private changeDetector = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /* Reference of institution */
  @ViewChild('institution') institution: ElementRef<any>;
  /* Template for popover on institution */
  @ViewChild('templateInstitution') templateInstitution: TemplateRef<any>;
  @ViewChild('themeToggle') themeToggle: ElementRef<any>;
  @ViewChild('templateThemePicker') templateThemePicker: TemplateRef<any>;
  @ViewChild('notificationsTray') notificationsTray: NotificationsTrayComponent;

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = false;

  /** Instance of sidenav. */
  @Input() sidenav: MatSidenav;
  /** Sidenav collapse event. */
  @Output() collapse = new EventEmitter<boolean>();

  /**
   * Subscribes to breakpoint for handset.
   */
  ngOnInit() {
    this.isHandset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isHandset) => {
      if (!isHandset) {
        if (this.sidenavCollapsed) {
          this.toggleSidenavCollapse(false);
        }
        if (this.sidenav && !this.sidenav.opened) {
          this.sidenav.open();
        }
      } else if (this.sidenavCollapsed) {
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
    this.sidenavCollapsed = sidenavCollapsed !== undefined ? sidenavCollapsed : !this.sidenavCollapsed;
    this.collapse.emit(this.sidenavCollapsed);
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
        this.showPopover(this.templateInstitution, this.institution.nativeElement);
      });
    }

    if (this.configurationWizardService.showSideNav || this.configurationWizardService.showSideNavChartofAccounts) {
      this.toggleSidenavCollapse();
    }

    if (this.configurationWizardService.showToolbarAdmin && this.themeToggle) {
      setTimeout(() => {
        this.showPopover(this.templateThemePicker, this.themeToggle.nativeElement);
      });
    }
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/** Custom Services */
import { ProgressBarService } from '../progress-bar/progress-bar.service';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NgClass, AsyncPipe } from '@angular/common';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ThrIconComponent } from 'app/shared/thr-icon/thr-icon.component';
import { environment } from '../../../environments/environment';

/**
 * Shell component.
 */
@Component({
  selector: 'mifosx-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSidenavContainer,
    MatSidenav,
    NgClass,
    SidenavComponent,
    MatSidenavContent,
    ToolbarComponent,
    ContentComponent,
    FooterComponent,
    AsyncPipe,
    RouterLink,
    ThrIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit, AfterViewInit {
  private breakpointObserver = inject(BreakpointObserver);
  private progressBarService = inject(ProgressBarService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Host for the lazily-loaded Copilot panel. */
  @ViewChild('copilotHost', { read: ViewContainerRef }) copilotHost?: ViewContainerRef;
  @ViewChild('sidenav') sidenav?: MatSidenav;
  private copilotRef?: ComponentRef<unknown>;

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  isHandset = false;
  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = false;
  /**
   * Progress bar mode. Starts as 'none' so the bar stays hidden until a request
   * actually begins. The service emits through a plain EventEmitter, so
   * subscribing here yields nothing until the next emission, and a route that
   * issues no requests of its own (Home) would otherwise leave this undefined
   * and render the bar indefinitely.
   */
  progressBarMode = 'none';
  /** Hides the page footer on the dashboard so the three-band layout can fill the frame. */
  isDashboardRoute = false;

  /**
   * Subscribes to progress bar to update its mode.
   */
  ngOnInit() {
    this.isHandset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isHandset) => {
      this.isHandset = isHandset;
      this.cdr.markForCheck();
    });
    this.updateDashboardRoute(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.updateDashboardRoute(event.urlAfterRedirects);
        if (this.isHandset && this.sidenav?.opened) {
          this.sidenav.close();
        }
      });
    this.progressBarService.updateProgressBar.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((mode: string) => {
      this.progressBarMode = mode;
      this.cdr.detectChanges();
    });
  }

  private updateDashboardRoute(url: string): void {
    const path = url.split('?')[0];
    this.isDashboardRoute = path === '/home' || path === '/dashboard' || path.startsWith('/dashboard/');
    this.cdr.markForCheck();
  }

  /**
   * Lazily load the Mifos Copilot panel ONLY when enabled for this deployment.
   * When `environment.enableCopilot` is false the dynamic import never runs, so
   * the Copilot chunk is never downloaded - zero bytes added to the loaded app.
   */
  ngAfterViewInit() {
    this.sidenav?.openedChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    if (environment.enableCopilot && this.copilotHost) {
      this.loadCopilot().catch((error) => console.error('Failed to load Mifos Copilot panel', error));
    }
  }

  private async loadCopilot(): Promise<void> {
    const { CopilotPanelComponent } = await import('../../copilot/components/copilot-panel/copilot-panel.component');
    this.copilotRef = this.copilotHost!.createComponent(CopilotPanelComponent);
    this.copilotRef.setInput('sidenavCollapsed', this.sidenavCollapsed);
    this.isHandset$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((handset) => this.copilotRef?.setInput('isHandset', handset));
    this.cdr.detectChanges();
  }

  /**
   * Toggles the current collapsed state of sidenav according to the emitted event.
   * @param {boolean} event denotes state of sidenav
   */
  toggleCollapse($event: boolean) {
    this.sidenavCollapsed = $event;
    this.copilotRef?.setInput('sidenavCollapsed', $event);
    this.cdr.detectChanges();
  }

  toggleMobileMenu(): void {
    this.sidenav?.toggle();
  }

  closeMobileMenu(): void {
    if (this.isHandset && this.sidenav?.opened) {
      this.sidenav.close();
    }
  }

  isDashboardTabActive(): boolean {
    const [
      path,
      query = ''
    ] = this.router.url.split('?');
    const home = path === '/home' || path === '/dashboard' || path.startsWith('/dashboard/');
    return home && !query.includes('view=onboarding');
  }

  isClientsTabActive(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/clients' || path.startsWith('/clients/');
  }

  isLoansTabActive(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/loans' || path.startsWith('/loans/');
  }
}

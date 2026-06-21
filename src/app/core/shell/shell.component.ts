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

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { ProgressBarService } from '../progress-bar/progress-bar.service';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NgClass, AsyncPipe } from '@angular/common';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
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
    BreadcrumbComponent,
    ContentComponent,
    FooterComponent,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit, AfterViewInit {
  private breakpointObserver = inject(BreakpointObserver);
  private progressBarService = inject(ProgressBarService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Host for the lazily-loaded Copilot panel. */
  @ViewChild('copilotHost', { read: ViewContainerRef }) copilotHost?: ViewContainerRef;
  private copilotRef?: ComponentRef<unknown>;

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = true;
  /** Progress bar mode. */
  progressBarMode: string;

  /**
   * Subscribes to progress bar to update its mode.
   */
  ngOnInit() {
    this.progressBarService.updateProgressBar.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((mode: string) => {
      this.progressBarMode = mode;
      this.cdr.detectChanges();
    });
  }

  /**
   * Lazily load the Mifos Copilot panel ONLY when enabled for this deployment.
   * When `environment.enableCopilot` is false the dynamic import never runs, so
   * the Copilot chunk is never downloaded - zero bytes added to the loaded app.
   */
  ngAfterViewInit() {
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
}

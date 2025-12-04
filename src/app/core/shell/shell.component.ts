/** Angular Imports */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, Subscription } from 'rxjs';
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
  ]
})
export class ShellComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private progressBarService = inject(ProgressBarService);
  private cdr = inject(ChangeDetectorRef);

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = true;
  /** Progress bar mode. */
  progressBarMode: string;
  /** Subscription to progress bar. */
  progressBar$: Subscription;

  /**
   * Subscribes to progress bar to update its mode.
   */
  ngOnInit() {
    this.progressBar$ = this.progressBarService.updateProgressBar.subscribe((mode: string) => {
      this.progressBarMode = mode;
      this.cdr.detectChanges();
    });
  }

  /**
   * Toggles the current collapsed state of sidenav according to the emitted event.
   * @param {boolean} event denotes state of sidenav
   */
  toggleCollapse($event: boolean) {
    this.sidenavCollapsed = $event;
    this.cdr.detectChanges();
  }

  /**
   * Unsubscribes from progress bar.
   */
  ngOnDestroy() {
    if (this.progressBar$) {
      this.progressBar$.unsubscribe();
    }
  }
}

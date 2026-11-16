/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

/** rxjs Imports */
import { Observable, combineLatest, of, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

/** Custom Components, Services and Models */
import { ConnectionStatus } from 'app/core/connection/connection-status.model';
import { ConnectionStatusService } from 'app/core/connection/connection-status.service';
import { M3IconComponent } from 'app/shared/m3-ui';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SystemInfoService, SystemInformation } from 'app/system/system-info.service';
import { orDash } from 'app/system/system-info.utils';
import { CommitHashChipComponent } from '../commit-hash-chip/commit-hash-chip.component';
import { SystemInfoPanelComponent } from '../system-info-panel/system-info-panel.component';
import { STATUS_TEXT_KEYS, StatusBarView } from './status-bar.model';

/**
 * Slim footer bar with the connection status and the versions in use. Details opens the System
 * information panel above the bar; on small screens the whole bar opens it as a bottom sheet.
 */
@Component({
  selector: 'mifosx-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    DatePipe,
    M3IconComponent,
    CommitHashChipComponent,
    SystemInfoPanelComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarComponent implements OnDestroy {
  /** Viewport query below which the compact bar is shown. */
  static readonly compactQuery = '(max-width: 600px)';

  private connectionStatusService = inject(ConnectionStatusService);
  private systemInfoService = inject(SystemInfoService);
  private breakpointObserver = inject(BreakpointObserver);
  private bottomSheet = inject(MatBottomSheet);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  readonly orDash = orDash;
  readonly statusTextKeys = STATUS_TEXT_KEYS;
  /** Id of the System information panel the Details button controls. */
  readonly panelId = SystemInfoPanelComponent.panelId;
  /** The panel opens above the Details button, aligned with its right edge and clear of the bar. */
  readonly panelPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -16 }
  ];

  /** Whether the System information panel is open, as a popover or as a bottom sheet. */
  detailsOpen = false;

  @ViewChild('detailsButton') private detailsButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('panelSheet') private panelSheet: TemplateRef<unknown>;
  private sheetRef: MatBottomSheetRef | null = null;

  /** The bar is rendered once with the shell, so this is when the session's pages started rendering. */
  private readonly renderTime = new Date();

  readonly view$: Observable<StatusBarView> = this.createView();

  /**
   * The bottom sheet lives in the app-wide overlay, so it would stay open after the bar is gone,
   * for example when a logout sends the user to the login page.
   */
  ngOnDestroy(): void {
    this.sheetRef?.dismiss();
  }

  retryNow(): void {
    this.connectionStatusService.checkNow();
  }

  /** Opens or closes the panel above the bar. */
  toggleDetails(): void {
    if (this.detailsOpen) {
      this.closeDetails();
    } else {
      this.detailsOpen = true;
    }
  }

  /** Opens the panel as a bottom sheet, from the compact bar. */
  openDetailsSheet(): void {
    if (this.sheetRef) {
      return;
    }
    this.detailsOpen = true;
    this.sheetRef = this.bottomSheet.open(this.panelSheet, {
      ariaLabel: this.translateService.instant('labels.heading.System Information')
    });
    this.sheetRef.afterDismissed().subscribe(() => {
      this.sheetRef = null;
      this.detailsOpen = false;
      this.cdr.markForCheck();
    });
  }

  /**
   * Closes the panel. Focus goes back to the Details button when the panel itself was closed,
   * but not after a click elsewhere on the page, which has already moved it there.
   */
  closeDetails(restoreFocus = false): void {
    if (this.sheetRef) {
      // The bottom sheet gives focus back to the bar itself.
      this.sheetRef.dismiss();
      return;
    }
    if (!this.detailsOpen) {
      return;
    }
    this.detailsOpen = false;
    this.cdr.markForCheck();
    if (restoreFocus) {
      this.detailsButton?.nativeElement.focus();
    }
  }

  /** The popover also closes on its own when Escape is pressed. */
  onPanelDetached(): void {
    if (this.detailsOpen && !this.sheetRef) {
      this.closeDetails(true);
    }
  }

  private createView(): Observable<StatusBarView> {
    const status$ = this.connectionStatusService.status$;
    // Read again on every return online. The Fineract version is cached once it has been read,
    // so this only sends a request when the earlier attempt failed, e.g. the page loaded offline.
    const info$ = status$.pipe(
      map((status: ConnectionStatus) => status.state === 'online'),
      distinctUntilChanged(),
      filter((online: boolean) => online),
      startWith(true),
      switchMap(() => this.systemInfoService.getSystemInformation()),
      map((info: SystemInformation) => ({ ...info, renderTime: this.renderTime }))
    );
    // Ticks every second only while the "Retrying in N s" countdown is on screen.
    const now$ = status$.pipe(
      switchMap((status: ConnectionStatus) =>
        status.state === 'offline' && status.nextCheckAt ? timer(0, 1000) : of(0)
      ),
      map(() => Date.now())
    );
    // Switching between the full and the compact bar closes the panel, since each opens it differently.
    const compact$ = this.breakpointObserver.observe(StatusBarComponent.compactQuery).pipe(
      map((state) => state.matches),
      distinctUntilChanged(),
      tap(() => this.closeDetails())
    );

    return combineLatest([
      status$,
      info$,
      compact$,
      now$
    ]).pipe(
      map(
        ([
          status,
          info,
          compact,
          now
        ]) => ({
          status,
          info,
          host: serverHost(info.server),
          fineract: status.state === 'offline' ? null : info.fineract,
          retryIn: retrySeconds(status, now),
          compact
        })
      )
    );
  }
}

/** Removes the protocol and any trailing slash, e.g. `https://apis.mifos.community/` becomes `apis.mifos.community`. */
export function serverHost(server: string | null | undefined): string {
  return (server || '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/+$/, '');
}

/** Whole seconds until the next check while the server is unreachable, otherwise null. */
export function retrySeconds(status: ConnectionStatus, now: number): number | null {
  if (status.state !== 'offline' || !status.nextCheckAt) {
    return null;
  }
  return Math.max(0, Math.ceil((status.nextCheckAt.getTime() - now) / 1000));
}

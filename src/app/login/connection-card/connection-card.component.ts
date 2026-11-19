/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

/** rxjs Imports */
import { Observable, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';

/** Custom Components, Services and Models */
import { ConnectionState, ConnectionStatus } from 'app/core/connection/connection-status.model';
import { ConnectionStatusService } from 'app/core/connection/connection-status.service';
import { serverHost } from 'app/shared/footer/status-bar/status-bar.component';
import { STATUS_TEXT_KEYS } from 'app/shared/footer/status-bar/status-bar.model';
import { M3IconComponent } from 'app/shared/m3-ui/m3-icon/m3-icon.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ComponentVersion, SystemInfoService } from 'app/system/system-info.service';
import { orDash } from 'app/system/system-info.utils';

/** Environment Configuration */
import { environment } from '../../../environments/environment';

/** Everything the card renders that changes while the login page is open. */
export interface ConnectionCardView {
  state: ConnectionState;
  /** Fineract version, or `—` until the server is known to be reachable. */
  fineractVersion: string;
}

/**
 * Collapsible "Connection" card on the login page: the live server status from the shared
 * connection check, and the server, tenant and versions in a 2×2 grid.
 */
@Component({
  selector: 'mifosx-connection-card',
  templateUrl: './connection-card.component.html',
  styleUrls: ['./connection-card.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatTooltip,
    M3IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionCardComponent implements OnChanges {
  /** Local storage key of the expanded/collapsed choice. */
  static readonly expandedStorageKey = 'mifosXConnectionCardExpanded';
  /** Id of the details grid the chevron button controls. */
  readonly detailsId = 'connection-card-details';

  /** Full URL of the selected server. */
  @Input() server: string | null = null;
  /** Identifier of the selected tenant. */
  @Input() tenant: string | null = null;

  private connectionStatusService = inject(ConnectionStatusService);
  private systemInfoService = inject(SystemInfoService);

  readonly orDash = orDash;
  readonly serverHost = serverHost;
  /** The footer says "Connected"; the card's design says "Server reachable". */
  readonly statusTextKeys: Record<ConnectionState, string> = {
    ...STATUS_TEXT_KEYS,
    online: 'labels.text.Server reachable'
  };
  readonly webAppVersion = orDash(environment.version);

  expanded = readExpanded();

  readonly view$: Observable<ConnectionCardView> = this.createView();

  /** A newly selected server is checked straight away, so the status never describes the previous one. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['server'] && !changes['server'].firstChange) {
      this.connectionStatusService.checkNow();
    }
  }

  toggleDetails(): void {
    this.expanded = !this.expanded;
    try {
      localStorage.setItem(ConnectionCardComponent.expandedStorageKey, String(this.expanded));
    } catch {
      // Storage can be blocked (private mode, site settings); the toggle still works for this visit.
    }
  }

  private createView(): Observable<ConnectionCardView> {
    const status$ = this.connectionStatusService.status$;
    // Asked for only once the server answers, so a server that is down raises no error alert. It is
    // asked again after every completed check while online: the service replays a cached version,
    // so this sends a request only after a failed read or a server change.
    const fineract$ = status$.pipe(
      distinctUntilChanged(
        (a: ConnectionStatus, b: ConnectionStatus) => a.state === b.state && a.checkedAt === b.checkedAt
      ),
      switchMap((status: ConnectionStatus) =>
        status.state === 'online' ? this.systemInfoService.getFineractVersion() : of(null as ComponentVersion | null)
      ),
      startWith(null as ComponentVersion | null)
    );
    return combineLatest([
      status$,
      fineract$
    ]).pipe(
      map(
        ([
          status,
          fineract
        ]) => ({
          state: status.state,
          fineractVersion: orDash(fineract?.raw)
        })
      ),
      distinctUntilChanged((a, b) => a.state === b.state && a.fineractVersion === b.fineractVersion)
    );
  }
}

/** Expanded unless the user collapsed the card on an earlier visit. */
function readExpanded(): boolean {
  try {
    return localStorage.getItem(ConnectionCardComponent.expandedStorageKey) !== 'false';
  } catch {
    return true;
  }
}

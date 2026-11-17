/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

/** rxjs Imports */
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Components, Services and Models */
import { AlertService } from 'app/core/alert/alert.service';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { M3IconComponent } from 'app/shared/m3-ui';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { formatDiagnostics, orDash, parseFineractVersion } from 'app/system/system-info.utils';
import { environment } from 'environments/environment';
import { CommitHashChipComponent } from '../commit-hash-chip/commit-hash-chip.component';
import { DIAGNOSTICS_STATUS_TEXT, STATUS_TEXT_KEYS, StatusBarView } from '../status-bar/status-bar.model';

/** Where the panel is shown: above the status bar, or inside a bottom sheet on small screens. */
export type SystemInfoPanelMode = 'popover' | 'sheet';

/**
 * System information panel opened from the footer status bar: the connection, the versions in
 * use and the session, with a button that copies them all for a support ticket.
 */
@Component({
  selector: 'mifosx-system-info-panel',
  templateUrl: './system-info-panel.component.html',
  styleUrls: ['./system-info-panel.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTrapFocus,
    DatetimeFormatPipe,
    M3IconComponent,
    CommitHashChipComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.sheet]': "mode === 'sheet'" }
})
export class SystemInfoPanelComponent implements AfterViewInit {
  /** Id of the panel, referenced by the `aria-controls` of the buttons that open it. */
  static readonly panelId = 'system-information-panel';

  private clipboard = inject(Clipboard);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private document = inject(DOCUMENT);

  /** What the status bar shows, given in full here. */
  @Input({ required: true }) view: StatusBarView;
  /** `popover` above the status bar, or `sheet` inside a bottom sheet. */
  @Input() mode: SystemInfoPanelMode = 'popover';

  /** Emits when the close button is clicked. */
  @Output() readonly closed = new EventEmitter<void>();
  /** Emits when "Retry now" is clicked while the server is unreachable. */
  @Output() readonly retry = new EventEmitter<void>();

  @ViewChild(CdkTrapFocus) private trapFocus: CdkTrapFocus;

  readonly orDash = orDash;
  readonly secondsSince = secondsSince;
  readonly statusTextKeys = STATUS_TEXT_KEYS;
  readonly panelId = SystemInfoPanelComponent.panelId;
  readonly titleId = `${SystemInfoPanelComponent.panelId}-title`;
  /** Link behind "Report issue", which is hidden when none is configured. */
  readonly reportIssueUrl: string = environment.reportIssueUrl;

  /** Current time, updated every second for "Checked N s ago". */
  readonly now = toSignal(interval(1000).pipe(map(() => Date.now())), { initialValue: Date.now() });

  ngAfterViewInit(): void {
    // The bottom sheet moves focus into itself, while the popover is a plain overlay that has to.
    if (this.mode === 'popover') {
      this.trapFocus.focusTrap.focusFirstTabbableElementWhenReady();
    }
  }

  /** Copies every value as plain text for a support ticket, exactly as the panel shows it. */
  copyDiagnostics(): void {
    const { info, fineract, status } = this.view;
    const text = formatDiagnostics(
      { ...info, fineract: fineract ?? parseFineractVersion(null) },
      { text: DIAGNOSTICS_STATUS_TEXT[status.state], checkedAt: status.checkedAt },
      this.document.defaultView?.navigator.userAgent ?? ''
    );
    if (this.clipboard.copy(text)) {
      this.alertService.alert({
        type: 'success',
        message: this.translateService.instant('labels.text.Diagnostics copied')
      });
    }
  }
}

/** Whole seconds elapsed since a date, or null when there is no date. */
export function secondsSince(date: Date | null, now: number): number | null {
  return date ? Math.max(0, Math.floor((now - date.getTime()) / 1000)) : null;
}

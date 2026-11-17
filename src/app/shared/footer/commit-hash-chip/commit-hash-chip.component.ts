/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Abbreviated commit hash in a monospace chip. Clicking it copies the full hash and confirms
 * with a "Copied" tooltip.
 */
@Component({
  selector: 'mifosx-commit-hash-chip',
  templateUrl: './commit-hash-chip.component.html',
  styleUrls: ['./commit-hash-chip.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitHashChipComponent implements OnDestroy {
  /** How long the "Copied" confirmation stays visible, in milliseconds. */
  private static readonly copiedDuration = 1500;

  private clipboard = inject(Clipboard);
  private cdr = inject(ChangeDetectorRef);

  /** Abbreviated hash shown in the chip. */
  @Input() hash = '';
  /** Full hash copied on click; the abbreviated one is copied when it is not known. */
  @Input() fullHash = '';

  @ViewChild(MatTooltip) private tooltip: MatTooltip;

  copied = false;
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  copy(): void {
    if (!this.clipboard.copy(this.fullHash || this.hash)) {
      return;
    }
    this.copied = true;
    this.tooltip.show();
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied = false;
      this.tooltip.hide();
      this.cdr.markForCheck();
    }, CommitHashChipComponent.copiedDuration);
  }

  ngOnDestroy(): void {
    clearTimeout(this.copiedTimer);
  }
}

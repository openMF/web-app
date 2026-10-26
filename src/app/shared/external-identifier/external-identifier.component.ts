/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ExternalIdentifierPipe } from '@pipes/external-identifier.pipe';

@Component({
  selector: 'mifosx-external-identifier',
  templateUrl: './external-identifier.component.html',
  styleUrls: ['./external-identifier.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ExternalIdentifierPipe,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalIdentifierComponent implements OnInit {
  private clipboard = inject(Clipboard);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  @Input() externalId: string;
  @Input() completed = false;
  @Input() display = 'right';
  @Input() hideCopy = false;

  iconVisible = false;
  displayL = false;
  displayR = true;
  emptyValue = false;

  ngOnInit(): void {
    this.emptyValue = !this.externalId || this.externalId === '';
    this.displayL = this.display === 'left';
    this.displayR = this.display === 'right';
  }

  isLongValue(): boolean {
    if (this.externalId == null) {
      return false;
    }
    return this.externalId.length > 15;
  }

  showValue() {
    this.completed = !this.completed;
  }

  copyValue(): void {
    if (!this.hideCopy) {
      this.clipboard.copy(this.externalId);
      this.alertService.alert({
        type: this.translateService.instant('errors.clipboard.type'),
        message: this.translateService.instant('errors.clipboard.copied', { value: this.externalId })
      });
    }
  }

  mouseEnter() {
    this.iconVisible = true;
  }

  mouseLeave() {
    this.iconVisible = false;
  }
}

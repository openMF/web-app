/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, inject } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatIcon
  ]
})
export class DropdownComponent {
  private translateService = inject(TranslateService);

  @Input() placeHolderText: string;
  @Input() labelText: string;
  @Input() selectOptions: any[] = [];
  @Input() controlSelect: UntypedFormControl;
  @Input() required: boolean;

  getPlaceHolderText(): string {
    return this.placeHolderText ? this.translateService.instant('labels.inputs.' + this.placeHolderText) : '';
  }

  getLabelText(): string {
    return this.labelText ? this.translateService.instant('labels.inputs.' + this.labelText) : '';
  }

  clearProperty() {
    this.controlSelect.patchValue('');
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PositiveIntegerDirective } from '../../directives/positive-integer.directive';
import { positiveIntegerValidator } from '../validators/positive-integer.validator';

@Component({
  selector: 'mifosx-input-positive-integer',
  templateUrl: './input-positive-integer.component.html',
  styleUrls: ['./input-positive-integer.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PositiveIntegerDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPositiveIntegerComponent implements OnInit {
  @Input() isRequired = false;
  @Input() inputLabel: string;
  @Input() inputFormControl: UntypedFormControl;
  @Input() minVal: number;
  @Input() maxVal: number;

  ngOnInit(): void {
    this.inputFormControl.addValidators(positiveIntegerValidator());
    this.inputFormControl.updateValueAndValidity({ emitEvent: false });
    if (this.maxVal == null) {
      this.maxVal = 2147483647;
    }
    this.inputFormControl.addValidators([
      positiveIntegerValidator(),
      ...(this.minVal != null ? [Validators.min(this.minVal)] : []),
      ...(this.maxVal != null ? [Validators.max(this.maxVal)] : [])
    ]);
    this.inputFormControl.updateValueAndValidity({ emitEvent: false });
  }
}

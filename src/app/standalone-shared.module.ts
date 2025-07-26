// src/app/shared/standalone-shared.module.ts

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { DateFormatPipe } from '@pipes/date-format.pipe';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { HasPermissionDirective } from './directives/has-permission/has-permission.directive';

export const STANDALONE_SHARED_IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  RouterLink,
  NgIf,
  NgFor,

  // Angular Material
  MatCard,
  MatCardContent,
  MatCardActions,
  MatFormField,
  MatLabel,
  MatError,
  MatSuffix,
  MatInput,
  MatSelect,
  MatOption,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepicker,
  MatButton,
  MatCheckbox,
  DateFormatPipe,
  HasPermissionDirective,

  // Pipes and Directives
  NgxTranslatePipe,
  TranslatePipe
];
export { HasPermissionDirective } from './directives/has-permission/has-permission.directive';

import { Component, Input } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormfieldBase } from './model/formfield-base';
import { NgIf, NgFor } from '@angular/common';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatCheckbox } from '@angular/material/checkbox';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    NgFor,
    MatOption,
    MatError,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCheckbox,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class FormfieldComponent {
  @Input() form: UntypedFormGroup;
  @Input() formfield: FormfieldBase;

  constructor() {}
}

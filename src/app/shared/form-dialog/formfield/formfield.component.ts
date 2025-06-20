import { Component, Input } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormfieldBase } from './model/formfield-base';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class FormfieldComponent {
  @Input() form: UntypedFormGroup;
  @Input() formfield: FormfieldBase;

  constructor() {}
}

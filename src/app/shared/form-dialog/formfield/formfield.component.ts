import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { FormfieldBase } from './model/formfield-base';

@Component({
  selector: 'mifosx-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss']
})
export class FormfieldComponent implements OnInit {

  @Input() form: UntypedFormGroup;
  @Input() formfield: FormfieldBase;

  constructor() { }

  ngOnInit() {
  }

}

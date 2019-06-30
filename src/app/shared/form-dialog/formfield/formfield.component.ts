import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FormfieldBase } from './model/formfield-base';

@Component({
  selector: 'mifosx-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss']
})
export class FormfieldComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() formfield: FormfieldBase;

  constructor() { }

  ngOnInit() {
  }

}

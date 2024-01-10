import { Component, Input, OnInit } from '@angular/core';
import { GLAccount } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-gl-account-display',
  templateUrl: './gl-account-display.component.html',
  styleUrls: ['./gl-account-display.component.scss']
})
export class GlAccountDisplayComponent implements OnInit {

  @Input() glAccount: GLAccount | null = null;
  @Input() accountTitle: string | null = null;
  @Input() withTitle = '50%';
  @Input() withAccount = '50%';

  constructor() { }

  ngOnInit(): void {
  }

  glAccountValue(): string {
    if (this.glAccount) {
      return '(' + this.glAccount.glCode + ') ' + (this.glAccount.nameDecorated ? this.glAccount.nameDecorated : this.glAccount.name);
    }
    return '';
  }

}

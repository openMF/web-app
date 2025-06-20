import { Component, Input } from '@angular/core';
import { GLAccount } from 'app/shared/models/general.model';
import { NgIf, NgClass } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-gl-account-display',
  templateUrl: './gl-account-display.component.html',
  styleUrls: ['./gl-account-display.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass
  ]
})
export class GlAccountDisplayComponent {
  @Input() glAccount: GLAccount | null = null;
  @Input() accountTitle: string | null = null;
  @Input() withTitle = '50%';
  @Input() withAccount = '50%';

  constructor() {}

  glAccountValue(): string {
    if (this.glAccount) {
      return (
        '(' +
        this.glAccount.glCode +
        ') ' +
        (this.glAccount.nameDecorated ? this.glAccount.nameDecorated : this.glAccount.name)
      );
    }
    return '';
  }

  getWithClass(value: string): string {
    return 'flex-' + value.replace('%', '');
  }
}

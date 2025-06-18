import { Component, Input } from '@angular/core';
import { GLAccount } from 'app/shared/models/general.model';
import { NgIf, NgClass } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-gl-account-display',
  templateUrl: './gl-account-display.component.html',
  styleUrls: ['./gl-account-display.component.scss'],
  imports: [
    NgIf,
    NgClass,
    TranslatePipe,
    NgxTranslatePipe
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

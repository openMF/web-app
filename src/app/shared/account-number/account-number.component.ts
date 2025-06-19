import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-account-number',
  templateUrl: './account-number.component.html',
  styleUrls: ['./account-number.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class AccountNumberComponent implements OnInit {
  @Input() accountNo: string;
  @Input() display = 'right';
  @Input() clientId: number | null = null;
  @Input() accountId: number | null = null;
  @Input() accountType: string | null = null;

  iconVisible = false;
  displayL = false;
  displayR = true;

  constructor(private clipboard: Clipboard) {}

  ngOnInit(): void {
    this.displayL = this.display === 'left';
    this.displayR = this.display === 'right';
  }

  copyValue(): void {
    this.clipboard.copy(this.accountNo);
  }

  mouseEnter() {
    this.iconVisible = true;
  }

  mouseLeave() {
    this.iconVisible = false;
  }

  getAccountLink(): string {
    if (this.accountType) {
      return `/#/clients/${this.clientId}/${this.getAccountType()}/${this.accountId}`;
    }
    return '';
  }

  private getAccountType(): string {
    if (this.accountType === '1') {
      return 'loan-accounts';
    } else if (this.accountType === '2') {
      return 'savings-accounts';
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'mifosx-account-number',
  templateUrl: './account-number.component.html',
  styleUrls: ['./account-number.component.scss']
})
export class AccountNumberComponent implements OnInit {
  @Input() accountNo: string;
  @Input() display = 'right';

  iconVisible = false;
  displayL = false;
  displayR = true;

  constructor(private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.displayL = (this.display === 'left');
    this.displayR = (this.display === 'right');
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
}

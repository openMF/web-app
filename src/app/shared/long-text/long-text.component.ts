import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-long-text',
  templateUrl: './long-text.component.html',
  styleUrls: ['./long-text.component.scss']
})
export class LongTextComponent implements OnInit {
  @Input() textValue: string;
  @Input() chars = 30;

  iconVisible = false;
  displayL = false;
  displayR = true;
  emptyValue = false;

  constructor() { }

  ngOnInit(): void {
    this.emptyValue = (!this.textValue || this.textValue === '');
  }

  isLongValue(): boolean {
    if (this.textValue == null) {
      return false;
    }
    return (this.textValue.length > 25);
  }

  mouseEnter() {
    this.iconVisible = true;
  }

  mouseLeave() {
    this.iconVisible = false;
  }
}

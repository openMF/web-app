import { Component, Input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-long-text',
  templateUrl: './long-text.component.html',
  styleUrls: ['./long-text.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    TruncateTextPipe
  ]
})
export class LongTextComponent implements OnInit {
  @Input() textValue: string;
  @Input() chars = 30;

  iconVisible = false;
  displayL = false;
  displayR = true;
  emptyValue = false;

  printChars = 30;

  constructor() {}

  ngOnInit(): void {
    this.emptyValue = !this.textValue || this.textValue === '';
    this.printChars = this.chars;
  }

  isLongValue(): boolean {
    if (this.textValue == null) {
      return false;
    }
    return this.textValue.length > 25;
  }

  showValue() {
    if (this.printChars == 30) {
      this.printChars = 1000;
    } else {
      this.printChars = 30;
    }
  }

  mouseEnter() {
    this.iconVisible = true;
  }

  mouseLeave() {
    this.iconVisible = false;
  }
}

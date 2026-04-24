import { Directive, HostListener, ElementRef, Input, OnInit, Inject } from '@angular/core';
import { formatCurrency } from '@angular/common';
import { NgControl } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';

@Directive({ selector: '[mifosxFormatAmount]' })
export class FormatAmountDirective implements OnInit {
  format = 'N0';
  digitsInfo = '1.0-0';
  currencyCode: string;
  displaySymbol: string;
  @Input() sufix = '';

  @Input('mifosxFormatAmount') set _(values: string) {
    const parts: string[] = values.split(':');
    this.currencyCode = parts[0];
    this.displaySymbol = parts.length > 1 ? parts[1] : '$';
    this.digitsInfo = parts.length > 2 ? parts[2] : '1.2-2';
  }

  @HostListener('blur', ['$event.target']) blur(target: any) {
    target.value = this.parse(target.value);
  }
  @HostListener('focus', ['$event.target']) focus(target: any) {
    if (typeof this.control.value === 'undefined') {
      target.value = '';
    } else {
      target.value = this.control.value;
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.el.nativeElement.value = this.parse(this.el.nativeElement.value);
    });
  }

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private el: ElementRef,
    private control: NgControl
  ) {}

  parse(value: any) {
    return formatCurrency(value, this.locale, this.displaySymbol, this.currencyCode, this.digitsInfo) + this.sufix;
  }
}

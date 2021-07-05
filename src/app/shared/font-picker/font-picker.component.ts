import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-font-picker',
  templateUrl: './font-picker.component.html',
  styleUrls: ['./font-picker.component.scss']
})
export class FontPickerComponent implements OnInit {

  currentFont = 'roboto';

  fonts = [
    'roboto',
    'monospace',
    'anton'
  ];

  constructor() { }
  ngOnInit() {
    this.currentFont = localStorage.getItem('mifosXfont');
    document.body.classList.add(this.currentFont);
  }


  /**
   * For changing the currentfont to the new font.
   */
  onFontChange(font: string) {
    document.body.classList.remove(this.currentFont);
    document.body.classList.add(font);
    localStorage.setItem('mifosXfont', font);
    this.currentFont = font;
  }
}

import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'mifosx-font-picker',
  templateUrl: './font-picker.component.html',
  styleUrls: ['./font-picker.component.scss']
})
export class FontPickerComponent implements OnInit {

  currentFont = localStorage.getItem('mifosXfont');
  constructor() {  }
    ngOnInit () {
    this.currentFont = localStorage.getItem('mifosXfont');
    if (this.currentFont == null) {
   /**
    * Setting the default font if currentFont is null.
    */
     this.currentFont = 'my-third-font';
   }
       document.body.classList.add(this.currentFont);
   }
   /**
    *     * Function for chaning the currentfont to the new font the user choose.
    */
  onFontChange(font: string) {
    document.body.classList.remove(this.currentFont);
    document.body.classList.add(font);
    localStorage.setItem('mifosXfont', font);
    this.currentFont = font;
  }


}



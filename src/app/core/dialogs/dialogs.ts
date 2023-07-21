import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Dialogs {
  constructor() { }

  public setColor(dataType: string): string {
    let color = 'primary';
    switch (dataType) {
      case 'Basic':
        color = 'primary';
        break;
      case 'Mild':
        color = 'primary';
        break;
      case 'Strong':
        color = 'warn';
        break;
      default:
        color = 'warn';
    }
    return color;
  }

}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Commons {
  constructor() {}

  public dynamicSort(property: string) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return (a: any, b: any) => {
      const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }
}

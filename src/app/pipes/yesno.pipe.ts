import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yesNo'
})
export class YesnoPipe implements PipeTransform {

  transform(value: boolean, ...args: unknown[]): string {
    if (value == null) {
      return null;
    }
    return value ? 'Yes' : 'No';
  }

}

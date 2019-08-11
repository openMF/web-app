import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'find'
})
export class FindPipe implements PipeTransform {

  transform(value: any, options: any, key: string, property: string): any {
    let optionFound;
    if (options) {
      optionFound = options.find((option: any) => option[key] === value);
    }
    return optionFound ? optionFound[property] : '';
  }

}

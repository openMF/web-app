import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'find' })
export class FindPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, options: any, key: string, property: string): SafeHtml | string {
    let optionFound;
    if (options && Array.isArray(options)) {
      optionFound = options.find((option: any) => option && option[key] === value);
    }

    const result = optionFound ? optionFound[property] : '';

    if (typeof result === 'string') {
      return this.sanitizer.sanitize(SecurityContext.HTML, result) || '';
    }

    return String(result || '');
  }
}

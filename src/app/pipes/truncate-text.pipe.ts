import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateText' })
export class TruncateTextPipe implements PipeTransform {
  transform(value: string, chars: number): string {
    if (value.length <= 40) {
      return value;
    }

    let truncatedText = value.substring(0, 30);
    if (chars) {
      truncatedText = value.substring(0, chars);
    }

    return truncatedText;
  }
}

/** Angular Imports */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * URL to String pipe.
 * Transform eg: `self-service/users` :: `Self Service | Users`
 */
@Pipe({
  name: 'urlToString'
})
export class UrlToStringPipe implements PipeTransform {

  transform(url: string): any {
    url = decodeURIComponent(url);
    const urlSubstrings: string[] = url.slice(1).split('/');
    if (url.includes('?')) { // Query params URL.
      const query = urlSubstrings.pop();
      const prefix = query.slice(0, query.indexOf('?'));
      urlSubstrings.push(prefix);
    }
    const stringRepresentation =
      urlSubstrings
        .map((path: string) => {
          return path.split('-')
            .map((str: string) => {
              return str.charAt(0).toUpperCase() + str.slice(1);
            })
            .join(' ');
        })
        .join(' | ');
    return stringRepresentation;
  }

}

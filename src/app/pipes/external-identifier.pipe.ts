import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'externalIdentifier'
})
export class ExternalIdentifierPipe implements PipeTransform {

  transform(externalId: string): string {
    const limit = 20;
    if (!externalId) {
      return '';
    } else {
      const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

      if (regexExp.test(externalId)) {
        const values = externalId.split('-');
        return values[4];
      } else {
        const inputLen = externalId.length;
        return inputLen > limit ? externalId.substring((inputLen - limit), inputLen) : externalId;
      }
    }
  }

}

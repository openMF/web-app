import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chargesFilter'
})
export class ChargesFilterPipe implements PipeTransform {

  transform(charges: any, chargesDataSource: any, currencyCode: string, multiDisburseLoan?: boolean): any {
    if (charges) {
      charges = charges.filter((charge: any) => {
        if ((charge.currency.code !== currencyCode) || (!!multiDisburseLoan && charge.chargeTimeType.id === 12) || chargesDataSource.filter((chargeData: any) => chargeData.id === charge.id).length) {
          return false;
        }
        return true;
      });
    }
    return charges;
  }

}

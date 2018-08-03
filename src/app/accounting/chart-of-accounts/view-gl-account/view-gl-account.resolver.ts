import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AccountingService } from '../../accounting.service';

@Injectable()
export class ViewGlAccountResolver implements Resolve<Object> {

  constructor(private accountingService: AccountingService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');

    return this.accountingService.getGlAccount(id, true).pipe(map((glAccountData: any) => {
      let accountOptions = [];
      switch (glAccountData.type.value) {
        case 'ASSET': accountOptions = glAccountData.assetHeaderAccountOptions;
        break;
        case 'EQUITY': accountOptions = glAccountData.equityHeaderAccountOptions;
        break;
        case 'EXPENSE': accountOptions = glAccountData.expenseHeaderAccountOptions;
        break;
        case 'INCOME': accountOptions = glAccountData.incomeHeaderAccountOptions;
        break;
        case 'LIABILITY': accountOptions = glAccountData.liabilityHeaderAccountOptions;
        break;
      }
      glAccountData.parent = accountOptions.find((accountOption: any) => {
        return accountOption.id === glAccountData.parentId;
      });
      return glAccountData;
    }));
  }

}

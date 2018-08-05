import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { AccountingService } from '../../accounting.service';

@Injectable()
export class ViewAccountingRuleResolver implements Resolve<Object> {

  constructor(private accountingService: AccountingService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');

    return this.accountingService.getAccountingRule(id);
  }

}

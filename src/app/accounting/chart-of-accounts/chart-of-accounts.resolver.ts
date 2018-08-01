import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Observable } from 'rxjs';
import { AccountingService } from '../accounting.service';

@Injectable()
export class ChartOfAccountsResolver implements Resolve<Object> {

  constructor(private accountingService: AccountingService) {}

  resolve(): Observable<any> {
    return this.accountingService.getChartOfAccounts();
  }

}

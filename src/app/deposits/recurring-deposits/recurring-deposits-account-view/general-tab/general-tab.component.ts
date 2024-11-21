import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent {

  recurringDepositsAccountData: any;
  isprematureAllowed = false;
  entityType: string;
  currency: Currency;

  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.route.parent.data.subscribe((data: { recurringDepositsAccountData: any }) => {
      this.recurringDepositsAccountData = data.recurringDepositsAccountData;
      this.currency = this.recurringDepositsAccountData.currency;
      this.isprematureAllowed = data.recurringDepositsAccountData.maturityDate != null;
      if (this.router.url.includes('clients')) {
        this.entityType = 'Client';
      } else if (this.router.url.includes('groups')) {
        this.entityType = 'Group';
      } else if (this.router.url.includes('centers')) {
        this.entityType = 'Center';
      }
    });
  }

}

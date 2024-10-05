import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent {

  fixedDepositsAccountData: any;
  entityType: string;
  currency: Currency;

  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.route.parent.data.subscribe((data: { fixedDepositsAccountData: any }) => {
      this.fixedDepositsAccountData = data.fixedDepositsAccountData;
      this.currency = this.fixedDepositsAccountData.currency;
    });
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
  }

}

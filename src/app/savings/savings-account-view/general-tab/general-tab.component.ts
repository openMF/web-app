import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent {
  isLoading = true;
  isActive = false;
  entityType: string;

  savingsAccountData: any;
  currency: Currency;

  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.route.parent.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsAccountData = data.savingsAccountData;
      this.currency = this.savingsAccountData.currency;
      this.isLoading = false;
      const status = this.savingsAccountData.status.value;
      this.isActive = (status === 'Active');
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

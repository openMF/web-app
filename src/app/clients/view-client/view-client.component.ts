import { ClientsService } from 'app/clients/clients.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mifosx-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss']
})
export class ViewClientComponent implements OnInit, OnDestroy {
  id: number = null;
  loan: any = null;
  savings: any = null;
  paramsSubscription: Subscription;

  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  ngOnInit() {
    this.paramsSubscription = this.route.params
    .subscribe(
      (params: Params) => {
        this.id = params['id'];
      }
    );
    this.clientService.getClientId(this.id)
      .subscribe(
        (res => {
       // console.log(res);
        })
      );
    this.clientService.getClientAccounts(this.id)
    .subscribe(
      (res => {
      this.loan = res['loanAccounts'];
      this.savings = res['savingsAccounts'];
      console.log(res);
      console.log(this.loan);
      console.log(this.savings);
      })
    );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}

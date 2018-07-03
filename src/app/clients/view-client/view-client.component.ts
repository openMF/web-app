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
  id: number = undefined;
  loanAccounts: any = undefined;
  savingsAccounts: any = undefined;
  shareAccounts: any = undefined;
  upcomingCharges: any = undefined;
  clientInfo: any = undefined;
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
          const groupArray = new Array;
          this.clientInfo = res;
          this.clientInfo.dateOfBirth = this.clientInfo.dateOfBirth.reverse().join('-');
          this.clientInfo.activationDate = this.clientInfo.activationDate.reverse().join('-');

          this.clientInfo.groups.forEach(function (item: any) {
            groupArray.push(item.name);
            console.log(item.name);
        });
          this.clientInfo.groupNames = groupArray.join('|');

       console.log( this.clientInfo.groupNames);
  //     console.log(res['dateOfBirth'][1]);
        })
      );
    this.clientService.getClientAccounts(this.id)
    .subscribe(
      (res => {
      this.loanAccounts = res['loanAccounts'];
      this.savingsAccounts = res['savingsAccounts'];
      this.shareAccounts = res['shareAccounts'];
    /*   console.log(res);
      console.log(this.loanAccounts);
      console.log(this.savingsAccounts);
      console.log(this.shareAccounts); */
      })
    );
    this.clientService.getClientCharges(this.id)
    .subscribe(
      (res => {
      this.upcomingCharges = res['pageItems'];
    //  console.log(this.upcomingCharges);
      })
    );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}

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
  paramsSubscription: Subscription;

  constructor(private route: ActivatedRoute, private clientService: ClientsService) {
    
  }

  ngOnInit() {
    this.paramsSubscription = this.route.params
    .subscribe(
      (params: Params) => {
        this.id = params['id'];
      }
    );
    this.clientService.getServerId(this.id)
      .subscribe(
        (res => {
        console.log(res);
        })
      );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}

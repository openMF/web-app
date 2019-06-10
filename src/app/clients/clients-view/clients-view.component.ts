/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ClientsService } from '../clients.service';
@Component({
  selector: 'mifosx-clients-view',
  templateUrl: './clients-view.component.html',
  styleUrls: ['./clients-view.component.scss']
})
export class ClientsViewComponent implements OnInit {
  clientViewData: any;
  clientImage: any;
  constructor(private route: ActivatedRoute,
    private clientsService: ClientsService,
    private _sanitizer: DomSanitizer) {
    this.route.data.subscribe((data: { clientViewData: any }) => {
      this.clientViewData = data.clientViewData;
    });

  }

  ngOnInit() {
    this.clientsService.getClientProfileImage(this.clientViewData.id).subscribe(base64Image => {
      this.clientImage = this._sanitizer.bypassSecurityTrustResourceUrl(base64Image);
    });
  }

}

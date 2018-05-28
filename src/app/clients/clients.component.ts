import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

import { HeaderComponent } from '../core/shell/header/header.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

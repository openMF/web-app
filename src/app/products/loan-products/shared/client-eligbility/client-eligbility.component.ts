import { Component, Input } from '@angular/core';

@Component({
  selector: 'mifosx-client-eligbility',
  templateUrl: './client-eligbility.component.html',
  styleUrls: ['./client-eligbility.component.scss']
})
export class ClientEligbilityComponent {
  @Input() loanProduct: any;

}

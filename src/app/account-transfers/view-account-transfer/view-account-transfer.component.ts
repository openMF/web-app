/** Angular Imports */
import { Location, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-account-transfer',
  templateUrl: './view-account-transfer.component.html',
  styleUrls: ['./view-account-transfer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    NgClass,
    MatDivider,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class ViewAccountTransferComponent {
  viewAccountTransferData: any;
  /**
   * Retrieves the view account transfer data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Location} location Location.
   */
  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.data.subscribe((data: { viewAccountTransferData: any }) => {
      this.viewAccountTransferData = data.viewAccountTransferData;
    });
  }

  transferToClient(toClient: any): string {
    return `/#/clients/${toClient.id}`;
  }

  transferToAccount(toClient: any, toAccount: any): string {
    return `/#/clients/${toClient.id}/savings-accounts/${toAccount.id}`;
  }

  goBack(): void {
    this.location.back();
  }

  transactionColor(): string {
    return this.viewAccountTransferData.reversed ? 'undo' : 'active';
  }
}

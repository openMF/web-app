/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

/**
 * View Transaction Reciept Component
 */
@Component({
  selector: 'mifosx-view-reciept',
  templateUrl: './view-reciept.component.html',
  styleUrls: ['./view-reciept.component.scss']
})
export class ViewRecieptComponent implements OnInit {

  /** trusted resource url for pentaho output */
  pentahoUrl: any;
  /** Transaction Reciept Data */
  transactionRecieptData: any;

  /**
   * Fetches transaction reciept `resolve`
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private sanitizer: DomSanitizer,
              private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loansTransactionReciept: any }) => {
      this.transactionRecieptData = data.loansTransactionReciept;
    });
  }

  ngOnInit() {
    const contentType = this.transactionRecieptData.headers.get('Content-Type');
    const file = new Blob([this.transactionRecieptData.body], {type: contentType});
    const filecontent = URL.createObjectURL(file);
    this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
  }

}

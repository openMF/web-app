/** Angular Imports */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { HttpResponse } from '@angular/common/http';

/**
 * View Transaction Reciept Component
 */
@Component({
  selector: 'mifosx-view-reciept',
  templateUrl: './view-reciept.component.html',
  styleUrls: ['./view-reciept.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class ViewRecieptComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);

  /** trusted resource url for pentaho output */
  pentahoUrl: SafeResourceUrl | null = null;
  /** Transaction Reciept Data */
  transactionRecieptData: HttpResponse<Blob>;
  /** Blob URL for cleanup */
  private blobUrl: string | null = null;

  /**
   * Fetches transaction reciept `resolve`
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {ActivatedRoute} route Activated Route
   */
  constructor() {
    this.route.data.subscribe((data: { savingsTransactionReciept: HttpResponse<Blob> }) => {
      this.transactionRecieptData = data.savingsTransactionReciept;
    });
  }

  ngOnInit() {
    if (!this.transactionRecieptData || !this.transactionRecieptData.body) {
      return;
    }

    const contentType = this.transactionRecieptData.headers.get('Content-Type');
    const file = new Blob([this.transactionRecieptData.body], { type: contentType });

    if (file.size === 0) {
      return;
    }

    this.blobUrl = URL.createObjectURL(file);
    this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
  }

  ngOnDestroy() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }
}

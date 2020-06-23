/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';

/**
 * App;y Shares Component
 */
@Component({
  selector: 'mifosx-apply-shares',
  templateUrl: './apply-shares.component.html',
  styleUrls: ['./apply-shares.component.scss']
})
export class ApplySharesComponent implements OnInit {


  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Apply Share Account form. */
  applySharesForm: FormGroup;
  /** Shares Account Id */
  accountId: any;
  /** Unit Price */
  unitPrice: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SharesService} sharesService Shares Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private sharesService: SharesService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
  }

  /**
   * Creates the apply shares form.
   * Fetching data from service as action buttons malfunction
   * in clients view upon using a common resolver.
   */
  ngOnInit() {
    this.createApplySharesAccountForm();
    this.sharesService.getSharesAccountData(this.accountId, false).subscribe((response: any) => {
      this.applySharesForm.get('unitPrice').patchValue(response.currentMarketPrice || '');
    });
  }

  /**
   * Creates the apply shares form.
   */
  createApplySharesAccountForm() {
    this.applySharesForm = this.formBuilder.group({
      'requestedDate': ['', Validators.required],
      'requestedShares': ['', Validators.required],
      'unitPrice': [{value: '', disabled: true}]
    });
  }

  /**
   * Submits the form and applies additional shares to the share account,
   * if successful redirects to the share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevRequestedDate: Date = this.applySharesForm.value.requestedDate;
    this.applySharesForm.patchValue({
      requestedDate: this.datePipe.transform(prevRequestedDate, dateFormat),
    });
    const data = {
      ...this.applySharesForm.value,
      unitPrice: this.unitPrice,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'applyadditionalshares', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Periodic accruals component.
 */
@Component({
  selector: 'mifosx-periodic-accruals',
  templateUrl: './periodic-accruals.component.html',
  styleUrls: ['./periodic-accruals.component.scss']
})
export class PeriodicAccrualsComponent implements OnInit {

  /** Minimum accrue date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum accrue date allowed. */
  maxDate = new Date();
  /** Periodic accruals form. */
  periodicAccrualsForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) { }

  /**
   * Creates periodic accruals form.
   */
  ngOnInit() {
    this.createPeriodicAccrualsForm();
  }

  /**
   * Creates periodic accruals form.
   */
  createPeriodicAccrualsForm() {
    this.periodicAccrualsForm = this.formBuilder.group({
      'tillDate': ['', Validators.required]
    });
  }

  /**
   * Submits the periodic accruals form and executes periodic accruals,
   * if successful redirects to accounting.
   */
  submit() {
    const periodicAccruals = this.periodicAccrualsForm.value;
    // TODO: Update once language and date settings are setup
    periodicAccruals.locale = 'en';
    periodicAccruals.dateFormat = 'yyyy-MM-dd';
    if (periodicAccruals.tillDate instanceof Date) {
      let day = periodicAccruals.tillDate.getDate();
      let month = periodicAccruals.tillDate.getMonth() + 1;
      const year = periodicAccruals.tillDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      periodicAccruals.tillDate = `${year}-${month}-${day}`;
    }
    this.accountingService.executePeriodicAccruals(periodicAccruals).subscribe(() => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

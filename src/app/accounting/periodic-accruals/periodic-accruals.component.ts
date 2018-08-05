import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-periodic-accruals',
  templateUrl: './periodic-accruals.component.html',
  styleUrls: ['./periodic-accruals.component.scss']
})
export class PeriodicAccrualsComponent implements OnInit {

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  periodicAccrualsForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.createPeriodicAccrualsForm();
  }

  createPeriodicAccrualsForm() {
    this.periodicAccrualsForm = this.formBuilder.group({
      'tillDate': ['', Validators.required]
    });
  }

  submit() {
    const periodicAccruals = this.periodicAccrualsForm.value;
    // TODO: Update once language and date settings are setup
    periodicAccruals.locale = 'en';
    periodicAccruals.dateFormat = 'dd MMMM yyyy';
    periodicAccruals.tillDate = '06 August 2018';
    this.accountingService.executePeriodicAccruals(periodicAccruals).subscribe(response => {
      this.router.navigate(['/accounting']);
    });
  }

}

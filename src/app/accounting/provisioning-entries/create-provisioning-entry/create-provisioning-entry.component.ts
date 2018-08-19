/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Create provisioning entry component.
 */
@Component({
  selector: 'mifosx-create-provisioning-entry',
  templateUrl: './create-provisioning-entry.component.html',
  styleUrls: ['./create-provisioning-entry.component.scss']
})
export class CreateProvisioningEntryComponent implements OnInit {

  /** Minimum provisioning date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum provisioning date allowed. */
  maxDate = new Date();
  /** Provisioning entry form. */
  provisioningEntryForm: FormGroup;

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
   * Creates the provisioning entry form.
   */
  ngOnInit() {
    this.createProvisioningEntryForm();
  }

  /**
   * Creates the provisioning entry form.
   */
  createProvisioningEntryForm() {
    this.provisioningEntryForm = this.formBuilder.group({
      'date': ['', Validators.required],
      'createjournalentries': [false]
    });
  }

  /**
   * Submits the provisioning entry form and creates provisioning entry,
   * if successful redirects to view created entry.
   */
  submit() {
    const provisioningEntry = this.provisioningEntryForm.value;
    // TODO: Update once language and date settings are setup
    provisioningEntry.locale = 'en';
    provisioningEntry.dateFormat = 'yyyy-MM-dd';
    if (provisioningEntry.date instanceof Date) {
      let day = provisioningEntry.date.getDate();
      let month = provisioningEntry.date.getMonth() + 1;
      const year = provisioningEntry.date.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      provisioningEntry.date = `${year}-${month}-${day}`;
    }
    this.accountingService.createProvisioningEntry(provisioningEntry)
      .subscribe((response: any) => {
        this.router.navigate(['../view', response.resourceId], { relativeTo: this.route });
      });
  }

}

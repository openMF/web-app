/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
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
  provisioningEntryForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router) { }

  /**
   * Creates the provisioning entry form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    provisioningEntry.locale = this.settingsService.language.code;
    provisioningEntry.dateFormat = this.settingsService.dateFormat;
    if (provisioningEntry.date instanceof Date) {
      provisioningEntry.date = this.dateUtils.formatDate(provisioningEntry.date, this.settingsService.dateFormat);
    }
    this.accountingService.createProvisioningEntry(provisioningEntry)
      .subscribe((response: any) => {
        this.router.navigate(['../view', response.resourceId], { relativeTo: this.route });
      });
  }

}

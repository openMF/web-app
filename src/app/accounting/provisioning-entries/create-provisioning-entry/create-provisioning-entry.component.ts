import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-create-provisioning-entry',
  templateUrl: './create-provisioning-entry.component.html',
  styleUrls: ['./create-provisioning-entry.component.scss']
})
export class CreateProvisioningEntryComponent implements OnInit {

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  provisioningEntriesForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService) { }

  ngOnInit() {
    this.createProvisioningEntriesForm();
  }

  createProvisioningEntriesForm() {
    this.provisioningEntriesForm = this.formBuilder.group({
      'date': ['', Validators.required],
      'createjournalentries': [false]
    });
  }

  submit() {
    const provisioningEntry = this.provisioningEntriesForm.value;
    // TODO: Update once language and date settings are setup
    provisioningEntry.locale = 'en';
    provisioningEntry.dateFormat = 'dd MMMM yyyy';
    provisioningEntry.date = '06 August 2018';
    this.accountingService.createProvisioningEntry(provisioningEntry)
      .subscribe((response: any) => {
        console.log(response);
      });
  }

}

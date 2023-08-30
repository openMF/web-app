/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create self service user component.
 *
 * TODO: Complete functionality once API is available.
 */
@Component({
  selector: 'mifosx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  /** Create Client Form */
  createUserForm: UntypedFormGroup;

  /** Denotes type of user. */
  userTypes = ['Existing User', 'New User'];
  /** Radio button group form control for type of user. */
  userType = new UntypedFormControl(this.userTypes[0]);
  /** Placeholder for office data. */
  offices: any[] = [];
  /** Placeholder for staff data. */
  staffOptions: any [] = [];
  /** Placeholder for staff data. */
  genderOptions: any [] = [];
  /** Placeholder for client data. */
  clientData: any [] = [];
  /** Placeholder for gender data. */
  genderData = ['Male', 'Female'];
  /** Minimum date of birth of user allowed. */
  minDate = new Date(1900, 0, 1);
  /** Maximum date of birth of user allowed. */
  maxDate = new Date();

  /**
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private clientService: ClientsService,
    private settingsService: SettingsService) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.offices = data.offices;
    });
  }

  ngOnInit() {
    this.minDate = this.settingsService.minAllowedDate;
    this.maxDate = this.settingsService.businessDate;
    this.setClientForm();
    this.buildDependencies();
  }

  /**
   * Creates the client form.
   */
  setClientForm() {
    this.createUserForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'staffId': ['', Validators.required]
    });
  }

  /**
   * Adds controls conditionally.
   */
  buildDependencies() {
    this.createUserForm.get('officeId').valueChanges.subscribe((officeId: number) => {
      this.clientService.getClientWithOfficeTemplate(officeId).subscribe((clientTemplate: any) => {
        this.staffOptions = clientTemplate.staffOptions;
        this.genderOptions = clientTemplate.genderOptions;
      });
    });
  }

}

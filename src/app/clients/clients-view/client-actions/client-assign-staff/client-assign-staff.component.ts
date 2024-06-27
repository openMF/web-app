/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Clients Assign Staff Component
 */
@Component({
  selector: 'mifosx-client-assign-staff',
  templateUrl: './client-assign-staff.component.html',
  styleUrls: ['./client-assign-staff.component.scss']
})
export class ClientAssignStaffComponent implements OnInit {

  /** Client Assign Staff form. */
  clientAssignStaffForm: UntypedFormGroup;
  /** Staff Data */
  staffData: any;
  /** Client Data */
  clientData: any;

  /**
   * Fetches Client Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   *
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private route: ActivatedRoute,
    private router: Router,
    private matomoTracker: MatomoTracker) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientData = data.clientActionData;
    });
  }

  /**
   * Creates the client assign staff form.
   */
  ngOnInit() {
    //set Matomo page info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);

    this.staffData = this.clientData.staffOptions;
    this.createClientAssignStaffForm();
  }

  /**
   * Creates the client assign staff form.
   */
  createClientAssignStaffForm() {
    this.clientAssignStaffForm = this.formBuilder.group({
      'staffId': ['']
    });
  }

  /**
   * Submits the form and assigns staff for the client.
   */
  submit() {
    //Track Matomo event for assigning client to staff member
    this.matomoTracker.trackEvent('clients', 'assignStaff', this.clientData.id);

    this.clientsService.executeClientCommand(this.clientData.id, 'assignStaff', this.clientAssignStaffForm.value)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Clients Assign Staff Component
 */
@Component({
  selector: 'mifosx-client-assign-staff',
  templateUrl: './client-assign-staff.component.html',
  styleUrls: ['./client-assign-staff.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
  ]
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
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientData = data.clientActionData;
    });
  }

  /**
   * Creates the client assign staff form.
   */
  ngOnInit() {
    this.staffData = this.clientData.staffOptions;
    this.createClientAssignStaffForm();
  }

  /**
   * Creates the client assign staff form.
   */
  createClientAssignStaffForm() {
    this.clientAssignStaffForm = this.formBuilder.group({
      staffId: ['']
    });
  }

  /**
   * Submits the form and assigns staff for the client.
   */
  submit() {
    this.clientsService
      .executeClientCommand(this.clientData.id, 'assignStaff', this.clientAssignStaffForm.value)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}

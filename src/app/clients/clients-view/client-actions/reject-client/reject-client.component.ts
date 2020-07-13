/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Reject Client Component
 */
@Component({
  selector: 'mifosx-reject-client',
  templateUrl: './reject-client.component.html',
  styleUrls: ['./reject-client.component.scss']
})
export class RejectClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Share Account form. */
  rejectClientForm: FormGroup;
  /** Client Data */
  rejectionData: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.rejectionData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.createRejectClientForm();
  }

  /**
   * Creates the reject client form.
   */
  createRejectClientForm() {
    this.rejectClientForm = this.formBuilder.group({
      'rejectionDate': ['', Validators.required],
      'rejectionReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and rejects the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevRejectedDate: Date = this.rejectClientForm.value.rejectionDate;
    this.rejectClientForm.patchValue({
      rejectionDate: this.datePipe.transform(prevRejectedDate, dateFormat),
    });
    const data = {
      ...this.rejectClientForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Reactivate Client Component
 */
@Component({
  selector: 'mifosx-reactivate-client',
  templateUrl: './reactivate-client.component.html',
  styleUrls: ['./reactivate-client.component.scss']
})
export class ReactivateClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reactivate client form. */
  reactivateClientForm: FormGroup;
  /** Client Account Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Clients Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the reactivate client form.
   */
  ngOnInit() {
    this.createReactivateClientForm();
  }

  /**
   * Creates the reactivate client form.
   */
  createReactivateClientForm() {
    this.reactivateClientForm = this.formBuilder.group({
      'reactivationDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and reactivates the client,
   * if successful redirects to the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevReactivationDate: Date = this.reactivateClientForm.value.reactivationDate;
    this.reactivateClientForm.patchValue({
      reactivationDate: this.datePipe.transform(prevReactivationDate, dateFormat),
    });
    const data = {
      ...this.reactivateClientForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'reactivate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Close Client Component
 */
@Component({
  selector: 'mifosx-close-client',
  templateUrl: './close-client.component.html',
  styleUrls: ['./close-client.component.scss']
})
export class CloseClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Client form. */
  closeClientForm: FormGroup;
  /** Client Data */
  closureData: any;
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
      this.closureData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.createCloseClientForm();
  }

  /**
   * Creates the close client form.
   */
  createCloseClientForm() {
    this.closeClientForm = this.formBuilder.group({
      'closureDate': ['', Validators.required],
      'closureReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and closes the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.closeClientForm.value.closureDate;
    this.closeClientForm.patchValue({
      closureDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.closeClientForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

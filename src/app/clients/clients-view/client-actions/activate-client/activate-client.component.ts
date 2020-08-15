/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Activate Client Component
 */
@Component({
  selector: 'mifosx-activate-client',
  templateUrl: './activate-client.component.html',
  styleUrls: ['./activate-client.component.scss']
})
export class ActivateClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate client form. */
  activateClientForm: FormGroup;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Cliens Service
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
   * Creates the activate client form.
   */
  ngOnInit() {
    this.createActivateClientForm();
  }

  /**
   * Creates the activate client form.
   */
  createActivateClientForm() {
    this.activateClientForm = this.formBuilder.group({
      'activationDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the client,
   * if successful redirects to the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevActivationDate: Date = this.activateClientForm.value.activationDate;
    this.activateClientForm.patchValue({
      activationDate: this.datePipe.transform(prevActivationDate, dateFormat),
    });
    const data = {
      ...this.activateClientForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

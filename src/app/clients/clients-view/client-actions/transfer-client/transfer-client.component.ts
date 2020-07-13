/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Transfer Client Component
 */
@Component({
  selector: 'mifosx-transfer-client',
  templateUrl: './transfer-client.component.html',
  styleUrls: ['./transfer-client.component.scss']
})
export class TransferClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Transfer Client form. */
  transferClientForm: FormGroup;
  /** Client Data */
  officeData: any;
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
      this.officeData = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.createTransferClientForm();
  }

  /**
   * Creates the transfer client form.
   */
  createTransferClientForm() {
    this.transferClientForm = this.formBuilder.group({
      'destinationOfficeId': ['', Validators.required],
      'transferDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and transfers the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.transferClientForm.value.transferDate;
    this.transferClientForm.patchValue({
      transferDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.transferClientForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'proposeTransfer', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

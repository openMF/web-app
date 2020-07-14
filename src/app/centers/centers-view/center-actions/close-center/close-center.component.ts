/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';

/**
 * Close Center Component
 */
@Component({
  selector: 'mifosx-close-center',
  templateUrl: './close-center.component.html',
  styleUrls: ['./close-center.component.scss']
})
export class CloseCenterComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Share Account form. */
  closeCenterForm: FormGroup;
  /** Center Data */
  closureData: any;
  /** Center Id */
  centerId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {CentersService} centersService Shares Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private centersService: CentersService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { centeractionData: any }) => {
      this.closureData = data.centeractionData.closureReasons;
    });
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  ngOnInit() {
    this.createCloseCenterForm();
  }

  /**
   * Creates the close centers form.
   */
  createCloseCenterForm() {
    this.closeCenterForm = this.formBuilder.group({
      'closureDate': ['', Validators.required],
      'closureReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and closes the center.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.closeCenterForm.value.closureDate;
    this.closeCenterForm.patchValue({
      closureDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.closeCenterForm.value,
      dateFormat,
      locale
    };
    this.centersService.executeCenterActionCommand(this.centerId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

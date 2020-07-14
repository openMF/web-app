/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';

/**
 * Activate Center Component
 */
@Component({
  selector: 'mifosx-activate-center',
  templateUrl: './activate-center.component.html',
  styleUrls: ['./activate-center.component.scss']
})
export class ActivateCenterComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate center form. */
  activateCenterForm: FormGroup;
  /** Group Account Id */
  centerId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {centersService} CentersService Shares Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private centersService: CentersService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  /**
   * Creates the activate center form.
   */
  ngOnInit() {
    this.createActivateCenterForm();
  }

  /**
   * Creates the activate center form.
   */
  createActivateCenterForm() {
    this.activateCenterForm = this.formBuilder.group({
      'activationDate': [new Date(), Validators.required]
    });
  }

  /**
   * Submits the form and activates the center,
   * if successful redirects to the center.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevactivationDate: Date = this.activateCenterForm.value.activationDate;
    this.activateCenterForm.patchValue({
      activationDate: this.datePipe.transform(prevactivationDate, dateFormat),
    });
    const data = {
      ...this.activateCenterForm.value,
      dateFormat,
      locale
    };
    this.centersService.executeCenterActionCommand(this.centerId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

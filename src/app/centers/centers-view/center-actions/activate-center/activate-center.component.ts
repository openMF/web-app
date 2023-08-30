/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

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
  activateCenterForm: UntypedFormGroup;
  /** Group Account Id */
  centerId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {centersService} CentersService Shares Service
   * @param {SettingsService} settingsService Settings Service.
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private centersService: CentersService,
              private settingsService: SettingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router) {
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  /**
   * Creates the activate center form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const activateCenterData = this.activateCenterForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevactivationDate: Date = this.activateCenterForm.value.activationDate;
    if (activateCenterData.activationDate instanceof Date) {
      activateCenterData.activationDate = this.dateUtils.formatDate(prevactivationDate, dateFormat);
    }
    const data = {
      ...activateCenterData,
      dateFormat,
      locale
    };
    this.centersService.executeCenterActionCommand(this.centerId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { GroupsService } from '@fineract/client';
import { CentersService } from '@fineract/client';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton, MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatNavList, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatLine } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Center component.
 */
@Component({
  selector: 'mifosx-create-center',
  templateUrl: './create-center.component.html',
  styleUrls: ['./create-center.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatIconButton,
    FaIconComponent,
    MatNavList,
    MatListSubheaderCssMatStyler,
    MatLine
  ]
})
export class CreateCenterComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Center form. */
  centerForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;
  /** Group data. */
  groupsData: any;
  /** Staff data. */
  staffData: any;
  /** Group Members. */
  groupMembers: any[] = [];
  /** Group Choice. */
  groupChoice = new UntypedFormControl('');

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {CentersService} centerService CentersService.
   * @param {SettingsService} settingsService Settings Service.
   * @param {GroupsService} groupService GroupsService.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private centerService: CentersService,
    private settingsService: SettingsService,
    private groupService: GroupsService,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates and sets the center form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCenterForm();
  }

  /**
   * Creates the center form.
   */
  createCenterForm() {
    this.centerForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      officeId: [
        '',
        Validators.required
      ],
      submittedOnDate: [
        '',
        Validators.required
      ],
      staffId: [''],
      externalId: [''],
      active: ['']
    });
    this.buildDependencies();
  }

  /**
   * Sets the staff and groups data each time the user selects a new office.
   * Adds form control Activation Date if active.
   */
  buildDependencies() {
    this.centerForm.get('officeId').valueChanges.subscribe((option: any) => {
      this.groupService.retrieveAll24(option).subscribe((data: any) => {
        this.groupsData = data;
        if (!this.groupsData.length) {
          this.groupChoice.disable();
        } else {
          this.groupChoice.enable();
        }
      });
      this.centerService.retrieveTemplate6(option).subscribe((data: any) => {
        this.staffData = data['staffOptions'];
        if (this.staffData === undefined) {
          this.centerForm.controls['staffId'].disable();
        } else {
          this.centerForm.controls['staffId'].enable();
        }
      });
    });
    this.centerForm.get('active').valueChanges.subscribe((bool: boolean) => {
      if (bool) {
        this.centerForm.addControl('activationDate', new UntypedFormControl('', Validators.required));
      } else {
        this.centerForm.removeControl('activationDate');
      }
    });
  }

  /**
   * Add group.
   */
  addGroup() {
    if (!this.groupMembers.includes(this.groupChoice.value)) {
      this.groupMembers.push(this.groupChoice.value);
    }
  }

  /**
   * Remove group.
   */
  removeGroup(index: number) {
    this.groupMembers.splice(index, 1);
  }

  /**
   * Submits the center form and creates center,
   * if successful redirects to centers.
   */
  submit() {
    const centerFormData = this.centerForm.value || {};
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    // Format submittedOnDate as string
    let submittedOnDate = centerFormData.submittedOnDate;
    if (submittedOnDate instanceof Date) {
      submittedOnDate = this.dateUtils.formatDate(submittedOnDate, dateFormat);
    }
    if (!submittedOnDate) {
      submittedOnDate = '';
    }

    // Format activationDate as string if present
    let activationDate = centerFormData.activationDate;
    if (activationDate instanceof Date) {
      activationDate = this.dateUtils.formatDate(activationDate, dateFormat);
    }

    // Ensure groupMembers is an array of IDs
    const groupMembers = Array.isArray(this.groupMembers)
      ? this.groupMembers.map((group: any) => (group && group.id ? group.id : group))
      : [];

    // Build payload matching PostCentersRequest
    const payload: any = {
      name: centerFormData.name || '',
      officeId: centerFormData.officeId ? Number(centerFormData.officeId) : undefined,
      submittedOnDate: submittedOnDate || '',
      dateFormat,
      locale,
      active: !!centerFormData.active
    };
    // Mandatory: activationDate if active is true
    if (payload.active) {
      payload.activationDate = activationDate || '';
    }
    // Optional fields
    if (centerFormData.externalId) {
      payload.externalId = centerFormData.externalId;
    }
    if (centerFormData.staffId) {
      payload.staffId = Number(centerFormData.staffId);
    }
    if (groupMembers.length > 0) {
      payload.groupMembers = groupMembers.map((id: any) => Number(id));
    }

    // Remove undefined fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    // Only submit if required fields are present
    if (payload.name && payload.officeId && payload.submittedOnDate) {
      this.centerService.create7({ postCentersRequest: payload }).subscribe({
        next: (response: any) => {
          this.router.navigate(['../centers']);
        },
        error: (err: any) => {
          alert('Error creating center: ' + (err?.message || 'Unknown error'));
        }
      });
    } else {
      alert('Please fill all required fields.');
    }
  }
}

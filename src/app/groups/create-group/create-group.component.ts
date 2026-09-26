/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  AfterViewInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

/** Custom Services */
import { GroupsService } from '../groups.service';
import { ClientsService } from '../../clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatOption, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton, MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Group component.
 */
@Component({
  selector: 'mifosx-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatIconButton,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGroupComponent implements OnInit, AfterViewInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private groupService = inject(GroupsService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Group form. */
  groupForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;
  /** Client data. */
  clientsData: any = [];
  /** Staff data. */
  staffData: any;
  /** Client Members. */
  clientMembers: any[] = [];
  /** ClientChoice. */
  clientChoice = new UntypedFormControl('');
  /** Center the new group will belong to, when created from a Center. */
  centerId: number | null = null;
  /** Name of the center the new group will belong to. */
  centerName: string;
  /** Whether the center's group template has loaded; the form can't be submitted before. */
  centerTemplateLoaded = false;
  /** Route back to the page the user came from. */
  cancelRoute: any[] = ['../'];
  /** All offices, from `resolve`; restored when leaving center mode. */
  private offices: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ClientsService} clientsService CentersService.
   * @param {GroupsService} groupService GroupsService.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {SettingsService} settingsService SettingsService
   */
  constructor() {
    this.route.data.subscribe((data: { offices: any }) => {
      this.offices = data.offices;
      this.officeData = data.offices;
    });
  }

  /**
   * Creates and sets the group form. Angular reuses this component when only the
   * query string changes, so the form is rebuilt whenever `centerId` changes.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.route.queryParamMap
      .pipe(
        map((params) => this.parseCenterId(params.get('centerId'))),
        distinctUntilChanged(),
        tap((centerId) => this.setUpForm(centerId)),
        // Errors are already reported by the HTTP error interceptor; the form stays
        // locked and cannot be submitted.
        switchMap((centerId) =>
          centerId ? this.groupService.getCenterGroupTemplate(centerId).pipe(catchError(() => EMPTY)) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((template: any) => this.applyCenterGroupTemplate(template));
  }

  /**
   * Whether the form can be submitted.
   */
  get canSubmit(): boolean {
    return this.groupForm.valid && (!this.centerId || this.centerTemplateLoaded);
  }

  /**
   * @param {string | null} value `centerId` query parameter.
   * @returns {number | null} The center id, or null unless it is a positive integer.
   */
  private parseCenterId(value: string | null): number | null {
    const centerId = Number(value);
    return value && Number.isInteger(centerId) && centerId > 0 ? centerId : null;
  }

  /**
   * Resets the component for standalone or center mode and builds a fresh form.
   * @param {number | null} centerId Center the new group will belong to, if any.
   */
  private setUpForm(centerId: number | null) {
    this.centerId = centerId;
    this.centerName = undefined;
    this.centerTemplateLoaded = false;
    this.officeData = this.offices;
    this.staffData = undefined;
    this.clientMembers = [];
    this.cancelRoute = centerId ? [
          '/centers',
          centerId
        ] : ['../'];
    this.createGroupForm();
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Applies the center's group template. Fineract always creates a center's group in
   * the center's office, so the office stays locked to it.
   * @param {any} template Group template for the center.
   */
  private applyCenterGroupTemplate(template: any) {
    this.centerName = template.centerName;
    this.officeData = template.officeOptions;
    this.staffData = template.staffOptions;
    this.groupForm.patchValue({ officeId: template.officeId, staffId: template.staffId ?? '' });
    if (this.staffData === undefined) {
      this.groupForm.controls['staffId'].disable();
    }
    this.centerTemplateLoaded = true;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Subscribes to Clients search filter:
   */
  ngAfterViewInit() {
    this.clientChoice.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService
          .getFilteredClients('displayName', 'ASC', true, value, this.groupForm.get('officeId').value)
          .subscribe((data: any) => {
            this.clientsData = data.pageItems;
            // Results arrive outside any template event: notify OnPush change detection.
            this.changeDetectorRef.markForCheck();
          });
      }
      // Selecting an autocomplete option happens in the CDK overlay, which does
      // not mark this OnPush component dirty; refresh the client details panel.
      this.changeDetectorRef.markForCheck();
    });
  }

  /**
   * Creates the group form.
   */
  createGroupForm() {
    this.groupForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('(^[A-Za-z]).*')
        ]
      ],
      officeId: [
        // A center's group always belongs to the center's office.
        { value: '', disabled: !!this.centerId },
        Validators.required
      ],
      submittedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      staffId: [''],
      externalId: [''],
      active: [false]
    });
    this.buildDependencies();
  }

  /**
   * Sets the staff and clients data each time the user selects a new office.
   * Adds form control Activation Date if active.
   */
  buildDependencies() {
    // In center mode the office is fixed and staff options come from the center's template.
    if (!this.centerId) {
      this.groupForm.get('officeId').valueChanges.subscribe((option: any) => {
        this.groupService.getStaff(option).subscribe((data) => {
          this.staffData = data['staffOptions'];
          if (this.staffData === undefined) {
            this.groupForm.controls['staffId'].disable();
          } else {
            this.groupForm.controls['staffId'].enable();
          }
        });
      });
    }
    this.groupForm.get('active').valueChanges.subscribe((bool: boolean) => {
      if (bool) {
        this.groupForm.addControl('activationDate', new UntypedFormControl('', Validators.required));
      } else {
        this.groupForm.removeControl('activationDate');
      }
    });
  }

  /**
   * Add client.
   */
  addClient() {
    if (!this.clientMembers.includes(this.clientChoice.value)) {
      this.clientMembers.push(this.clientChoice.value);
    }
  }

  /**
   * Remove client.
   * @param index Client's array index.
   */
  removeClient(index: number) {
    this.clientMembers.splice(index, 1);
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  /**
   * Submits the group form and creates group,
   * if successful redirects to groups.
   */
  submit() {
    // Raw value, so the locked office of a center's group is included.
    const groupFormData = this.groupForm.getRawValue();
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const submittedOnDate: Date = this.groupForm.value.submittedOnDate;
    const activationDate: Date = this.groupForm.value.activationDate;
    if (groupFormData.submittedOnDate instanceof Date) {
      groupFormData.submittedOnDate = this.dateUtils.formatDate(submittedOnDate, dateFormat);
    }
    if (groupFormData.activationDate instanceof Date) {
      groupFormData.activationDate = this.dateUtils.formatDate(activationDate, dateFormat);
    }
    const data = {
      ...groupFormData,
      dateFormat,
      locale
    };
    // The raw value includes staffId even when no staff was chosen or the control is disabled.
    if (data.staffId === '') {
      delete data.staffId;
    }
    data.clientMembers = [];
    this.clientMembers.forEach((client: any) => data.clientMembers.push(client.id));
    if (this.centerId) {
      data.centerId = this.centerId;
    }
    this.groupService.createGroup(data).subscribe((response: any) => {
      this.router.navigate([
        '../groups',
        response.resourceId,
        'general'
      ]);
    });
  }
}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Close Group Component
 */
@Component({
  selector: 'mifosx-close-group',
  templateUrl: './close-group.component.html',
  styleUrls: ['./close-group.component.scss']
})
export class CloseGroupComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Group form. */
  closeGroupForm: UntypedFormGroup;
  /** Group Closure Data */
  closureData: any;
  /** Group Id */
  groupId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {GroupsService} groupsService Shares Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private groupsService: GroupsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.closureData = data.groupActionData.closureReasons;
    });
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCloseGroupForm();
  }

  /**
   * Creates the close group form.
   */
  createCloseGroupForm() {
    this.closeGroupForm = this.formBuilder.group({
      'closureDate': ['', Validators.required],
      'closureReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and closes the group.
   */
  submit() {
    const closeGroupFormData = this.closeGroupForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedDate: Date = this.closeGroupForm.value.closureDate;
    if (closeGroupFormData.closureDate instanceof Date) {
      closeGroupFormData.closureDate = this.dateUtils.formatDate(prevClosedDate, dateFormat);
    }
    const data = {
      ...closeGroupFormData,
      dateFormat,
      locale
    };
    this.groupsService.executeGroupCommand(this.groupId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Activate Group Component
 */
@Component({
  selector: 'mifosx-activate-group',
  templateUrl: './activate-group.component.html',
  styleUrls: ['./activate-group.component.scss']
})
export class ActivateGroupComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate group form. */
  activateGroupForm: UntypedFormGroup;
  /** Group Id */
  groupId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {groupsService} groupsService Groups Service
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
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createActivateGroupForm();
  }

  /**
   * Creates the activate group form.
   */
  createActivateGroupForm() {
    this.activateGroupForm = this.formBuilder.group({
      'activationDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the group,
   * if successful redirects to the group.
   */
  submit() {
    const activateGroupFormData = this.activateGroupForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevactivationDate: Date = this.activateGroupForm.value.activationDate;
    if (activateGroupFormData.activationDate instanceof Date) {
      activateGroupFormData.activationDate = this.dateUtils.formatDate(prevactivationDate, dateFormat);
    }
    const data = {
      ...activateGroupFormData,
      dateFormat,
      locale
    };
    this.groupsService.executeGroupCommand(this.groupId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

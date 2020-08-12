/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

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
  activateGroupForm: FormGroup;
  /** Group Id */
  groupId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {groupsService} groupsService Groups Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private groupsService: GroupsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevactivationDate: Date = this.activateGroupForm.value.activationDate;
    this.activateGroupForm.patchValue({
      activationDate: this.datePipe.transform(prevactivationDate, dateFormat),
    });
    const data = {
      ...this.activateGroupForm.value,
      dateFormat,
      locale
    };
    this.groupsService.executeGroupCommand(this.groupId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

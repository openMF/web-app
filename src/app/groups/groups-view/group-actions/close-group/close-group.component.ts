/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

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
  closeGroupForm: FormGroup;
  /** Group Closure Data */
  closureData: any;
  /** Group Id */
  groupId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {GroupsService} groupsService Shares Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private groupsService: GroupsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.closureData = data.groupActionData.closureReasons;
    });
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.closeGroupForm.value.closureDate;
    this.closeGroupForm.patchValue({
      closureDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.closeGroupForm.value,
      dateFormat,
      locale
    };
    this.groupsService.executeGroupCommand(this.groupId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

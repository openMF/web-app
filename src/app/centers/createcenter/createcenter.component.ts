import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { CentersService } from '../centers.service';

@Component({
  selector: 'mifosx-createcenter',
  templateUrl: './createcenter.component.html',
  styleUrls: ['./createcenter.component.scss']
})
export class CreatecenterComponent implements OnInit {

  /** Minimum closing date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum closing date allowed. */
  maxDate = new Date();
  /** Center form. */
  centerForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** Group data. */
  groupData: any;
  /** Group detail */
  groupDataDetail: any[] = [];
  value: Boolean;
  /** Staff data. */
  staffData: any;
  disableSelect = new FormControl(false);
  /**  date  form control. */
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());

  choice: any[] = [];
  /** Group Members. */
  groupMembers: any[] = [];

  /**
   * 
     * Retrieves the offices data from `resolve`.
     * @param {FormBuilder} formBuilder Form Builder.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     */
  constructor(private formBuilder: FormBuilder,
    private centerService: CentersService,
    private groupService: GroupsService,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.createCenterForm();
    this.centerForm.controls['activationDate'].disable()
    this.value = true;
  }

  /**
   * Creates the center  form.
   */
  createCenterForm() {
    this.centerForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'officeId': ['', Validators.required],
      'staffId': [''],
      'groupMembers': [''],
      'externalId': [''],
      'submittedOnDate': ['',Validators.required],
      'activationDate': ['', Validators.required],
    });
  }

  onclick(id: number) {
    /**
       * Gets the Group for a specific office .
       */
    this.groupService.getGroupByOfficeId(id + 1)
      .subscribe(
        (data => {
          this.groupData = data;
        })
      );

    /**
      * Gets the Staff for a specific office .
      */
    this.centerService.getStaff(id + 1).subscribe((data: {
      officeId: any,
      active: any,
      officeOptions: any,
      staffOptions: any,
    }) => {
      this.staffData = data.staffOptions;
    });

  }

  /**
    * Enable and disable Activation date .
    */
  disable() {
    this.centerForm.controls['activationDate'].enable()
    if (this.disableSelect.value) {
      this.centerForm.controls['activationDate'].disable()
    }
  }


  /**
    * Display group detail .
    */
  display(group: any) {
    this.value = false;
    this.groupDataDetail[0] = group;
  }

  /**
    * Add group .
    */
  add(list: any) {
    this.choice.push({ "id": list.id, "name": list.name });
    this.groupMembers.push(list.id.toString());
  }

  /**        
   * Delete group .
    */
  delete(list: any) {
    this.choice.splice(this.choice.indexOf(list), 1);
    this.groupMembers.splice(this.groupMembers.indexOf(list.id.toString()), 1);
  }

  /**
   * Submits the center form and creates centers ,
   * if successful redirects to view created centers.
   */
  submit() {

    const centerEntry = this.centerForm.value;
    // TODO: Update once language and date settings are setup
    centerEntry.locale = 'en';
    centerEntry.dateFormat = 'yyyy-MM-dd';

    if (centerEntry.submittedOnDate instanceof Date) {
      let day = centerEntry.submittedOnDate.getDate();
      let month = centerEntry.submittedOnDate.getMonth() + 1;
      const year = centerEntry.submittedOnDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      centerEntry.submittedOnDate = `${year}-${month}-${day}`;
     
    }

    if (centerEntry.activationDate instanceof Date) {
      let day = centerEntry.activationDate.getDate();
      let month = centerEntry.activationDate.getMonth() + 1;
      const year = centerEntry.activationDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      centerEntry.activationDate = `${year}-${month}-${day}`;
      
    }
    centerEntry.groupMembers = this.groupMembers;
    centerEntry.active = this.disableSelect.value;
    console.log(centerEntry)

    this.centerService.createCenters(centerEntry).subscribe((response: any) => {
      this.router.navigate(['../centers']);
    });
  }


}

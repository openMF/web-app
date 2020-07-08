/** Angular Imports */
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { GroupsService } from '../groups.service';
import { ClientsService } from '../../clients/clients.service';

/**
 * Create Group component.
 */
@Component({
  selector: 'mifosx-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit, AfterViewInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Group form. */
  groupForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** Client data. */
  clientsData: any = [];
  /** Staff data. */
  staffData: any;
  /** Client Members. */
  clientMembers: any[] = [];
  /** ClientChoice. */
  clientChoice = new FormControl('');

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ClientsService} clientsService CentersService.
   * @param {GroupsService} groupService GroupsService.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private clientsService: ClientsService,
              private groupService: GroupsService,
              private datePipe: DatePipe) {
    this.route.data.subscribe( (data: {offices: any} ) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates and sets the group form.
   */
  ngOnInit() {
    this.createGroupForm();
  }

  /**
   * Subscribes to Clients search filter:
   */
  ngAfterViewInit() {
    this.clientChoice.valueChanges.subscribe( (value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value, this.groupForm.get('officeId').value)
        .subscribe( (data: any) => {
          this.clientsData = data.pageItems;
        });
      }
    });
  }

  /**
   * Creates the group form.
   */
  createGroupForm() {
    this.groupForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'officeId': ['', Validators.required],
      'submittedOnDate': ['', Validators.required],
      'staffId': [''],
      'externalId': [''],
      'active': [false],
    });
    this.buildDependencies();
  }

  /**
   * Sets the staff and clients data each time the user selects a new office.
   * Adds form control Activation Date if active.
   */
  buildDependencies() {
    this.groupForm.get('officeId').valueChanges.subscribe((option: any) => {
      this.groupService.getStaff(option).subscribe(data => {
        this.staffData = data['staffOptions'];
        if (this.staffData === undefined) {
          this.groupForm.controls['staffId'].disable();
        } else {
          this.groupForm.controls['staffId'].enable();
        }
      });
    });
    this.groupForm.get('active').valueChanges.subscribe((bool: boolean) => {
      if (bool) {
        this.groupForm.addControl('activationDate', new FormControl('', Validators.required));
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
    const submittedOnDate: Date = this.groupForm.value.submittedOnDate;
    const activationDate: Date = this.groupForm.value.activationDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd MMMM yyyy';
    this.groupForm.patchValue({
      submittedOnDate: this.datePipe.transform(submittedOnDate, dateFormat),
      activationDate: this.datePipe.transform(activationDate, dateFormat)
    });
    const group = this.groupForm.value;
    group.locale = 'en';
    group.dateFormat = dateFormat;
    group.clientMembers = [];
    this.clientMembers.forEach((client: any) => group.clientMembers.push(client.id));
    this.groupService.createGroup(group).subscribe((response: any) => {
      this.router.navigate(['../groups']);
    });
  }

}

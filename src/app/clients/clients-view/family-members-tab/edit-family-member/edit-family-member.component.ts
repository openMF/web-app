/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ClientsService } from '../../../clients.service';

/**
 * Edit Family Member Component
 */
@Component({
  selector: 'mifosx-edit-family-member',
  templateUrl: './edit-family-member.component.html',
  styleUrls: ['./edit-family-member.component.scss']
})
export class EditFamilyMemberComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add family member form. */
  editFamilyMemberForm: FormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  /** Family Members Details */
  familyMemberDetails: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {DatePipe} datePipe DatePipe
   * @param {Router} router Router
   * @param {ActivatedRoute} route Route
   * @param {ClientsService} clientsService Clients Service
   */
  constructor(private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private router: Router,
              private route: ActivatedRoute,
              private clientsService: ClientsService) {
    this.route.data.subscribe((data: { clientTemplate: any, editFamilyMember: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
      this.familyMemberDetails = data.editFamilyMember;
    });
  }

  ngOnInit() {
    this.createEditFamilyMemberForm(this.familyMemberDetails);
  }

  /**
   * Creates Edit Family Member Form
   * @param {any} familyMember Family Member
   */
  createEditFamilyMemberForm(familyMember: any) {
    this.editFamilyMemberForm = this.formBuilder.group({
      'firstName': [familyMember.firstName, Validators.required],
      'middleName': [familyMember.middleName],
      'lastName': [familyMember.lastName, Validators.required],
      'qualification': [familyMember.qualification],
      'age': [familyMember.age, Validators.required],
      'isDependent': [familyMember.isDependent],
      'relationshipId': [familyMember.relationshipId, Validators.required],
      'genderId': [familyMember.genderId, Validators.required],
      'professionId': [familyMember.professionId],
      'maritalStatusId': [familyMember.maritalStatusId],
      'dateOfBirth': [this.datePipe.transform(familyMember.dateOfBirth, 'yyyy-MM-dd'), Validators.required]
    });
  }

  /**
   * Submits the form and updates the client family member.
   */
  submit() {
    const prevDateOfBirth: Date = this.editFamilyMemberForm.value.dateOfBirth;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.editFamilyMemberForm.patchValue({
      dateOfBirth: this.datePipe.transform(prevDateOfBirth, dateFormat)
    });
    const familyMemberData = this.editFamilyMemberForm.value;
    familyMemberData.locale = 'en';
    familyMemberData.dateFormat = dateFormat;
    this.clientsService.editFamilyMember(this.familyMemberDetails.clientId, this.familyMemberDetails.id, familyMemberData).subscribe(res => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

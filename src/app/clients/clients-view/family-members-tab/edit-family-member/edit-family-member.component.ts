/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit Family Member Component
 */
@Component({
  selector: 'mifosx-edit-family-member',
  templateUrl: './edit-family-member.component.html',
  styleUrls: ['./edit-family-member.component.scss']
})
export class EditFamilyMemberComponent implements OnInit {


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
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {ActivatedRoute} route Route
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
              private dateUtils: Dates,
              private router: Router,
              private route: ActivatedRoute,
              private clientsService: ClientsService,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { clientTemplate: any, editFamilyMember: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
      this.familyMemberDetails = data.editFamilyMember;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
      'dateOfBirth': [this.dateUtils.formatDate(familyMember.dateOfBirth, 'yyyy-MM-dd'), Validators.required]
    });
  }

  /**
   * Submits the form and updates the client family member.
   */
  submit() {
    const editFamilyMemberFormData = this.editFamilyMemberForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDateOfBirth: Date = this.editFamilyMemberForm.value.dateOfBirth;
    if (editFamilyMemberFormData.dateOfBirth instanceof Date) {
      editFamilyMemberFormData.dateOfBirth = this.dateUtils.formatDate(prevDateOfBirth, dateFormat);
    }
    const data = {
      ...editFamilyMemberFormData,
      dateFormat,
      locale
    };
    this.clientsService.editFamilyMember(this.familyMemberDetails.clientId, this.familyMemberDetails.id, data).subscribe(res => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}

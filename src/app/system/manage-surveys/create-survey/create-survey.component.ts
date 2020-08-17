/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Custom Components */
import { CancelDialogComponent } from '../../../shared/cancel-dialog/cancel-dialog.component';

/**
 * Create survey component.
 */
@Component({
  selector: 'mifosx-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss']
})
export class CreateSurveyComponent implements OnInit {

  /** Survey form. */
  surveyForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) { }

  /**
   * Creates the survey form.
   */
  ngOnInit() {
    this.createSurveyForm();
  }

  /**
   * Creates the survey form.
   */
  createSurveyForm() {
    this.surveyForm = this.formBuilder.group({
      'key': ['', Validators.required],
      'name': ['', Validators.required],
      'countryCode': ['', [Validators.required, Validators.pattern('^\\s*([A-Za-z]{2})?\\s*$')]],
      'description': [''],
      'questionDatas': this.formBuilder.array([])
    });
  }

  /**
   * Gets the questions form array.
   * @returns {FormArray} Questions form array.
   */
  get questionDatas(): FormArray {
    return this.surveyForm.get('questionDatas') as FormArray;
  }

  /**
   * Gets the responses form array.
   * @param {number} questionIndex Index of question to retrieve responses from.
   * @returns {FormArray} Responses form array.
   */
  getResponseDatas(questionIndex: number): FormArray {
    return this.surveyForm.get(['questionDatas', questionIndex, 'responseDatas']) as FormArray;
  }

  /**
   * Creates a question form group
   * @returns {FormGroup} Question form group.
   */
  createQuestionForm(): FormGroup {
    return this.formBuilder.group({
      'key': ['', Validators.required],
      'text': ['', Validators.required],
      'description': [''],
      'responseDatas': this.formBuilder.array([this.createResponseForm()]),
      'sequenceNo': ['']
    });
  }

  /**
   * Adds a question to the questions form array
   */
  addQuestion() {
    this.questionDatas.push(this.createQuestionForm());
    this.updateSequenceNumber();
  }

  /**
   * Removes the particular question form from the questions form array at given index.
   * @param {number} index Array index from where question form needs to be removed.
   */
  removeQuestion(index: number) {
    this.questionDatas.removeAt(index);
    this.updateSequenceNumber();
  }

  /**
   * Creates a response form group
   * @returns {FormGroup} Response form group.
   */
  createResponseForm(): FormGroup {
    return this.formBuilder.group({
      'text': ['', Validators.required],
      'value': ['', [Validators.required, Validators.pattern('^\\s*[-]?\\d{0,4}\\s*$')]],
      'sequenceNo': ['']
    });
  }

  /**
   * Adds a response to the responses form array of the question with the given Index
   * @param {number} questionIndex Index of question to add response to.
   */
  addResponse(questionIndex: number) {
    this.getResponseDatas(questionIndex).push(this.createResponseForm());
    this.updateSequenceNumber();
  }

  /**
   * Removes the particular response form from the given responses form array at given index.
   * @param {FormArray} responseFormArray Given responses form array.
   * @param {number} index Array index from where response form needs to be removed.
   */
  removeResponse(responseFormArray: FormArray, index: number) {
    responseFormArray.removeAt(index);
    this.updateSequenceNumber();
  }

  /**
   * Updates the sequence numbers of questions and responses
   */
  updateSequenceNumber() {
    for (let questionIndex = 0; questionIndex < this.questionDatas.length; questionIndex++) {
      this.questionDatas.at(questionIndex).get('sequenceNo').setValue(questionIndex + 1);
      for (let responseIndex = 0; responseIndex < this.getResponseDatas(questionIndex).length; responseIndex++) {
        this.getResponseDatas(questionIndex).at(responseIndex).get('sequenceNo').setValue(responseIndex + 1);
      }
    }
  }

  /**
   * Cancels the survey and redirects to surveys.
   */
  cancelSurvey() {
    const cancelSurveyDialogRef = this.dialog.open(CancelDialogComponent);
    cancelSurveyDialogRef.afterClosed().subscribe((response: any) => {
      if (response.cancel) {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  /**
   * Reorders the question order according to the user drop
   */
  dropQuestion(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questionDatas.controls, event.previousIndex, event.currentIndex);
    this.updateSequenceNumber();
  }

  /**
   * Reorders the response order according to the user drop
   */
  dropResponse(event: CdkDragDrop<string[]>, questionIndex: number) {
    moveItemInArray(this.getResponseDatas(questionIndex).controls, event.previousIndex, event.currentIndex);
    this.updateSequenceNumber();
  }

  /**
   * Submits the survey form and creates survey,
   * if successful redirects to surveys.
   */
  submit() {
    this.surveyForm.patchValue({
      countryCode: this.surveyForm.value.countryCode.toUpperCase()
    });
    this.systemService.createSurvey(this.surveyForm.value).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}

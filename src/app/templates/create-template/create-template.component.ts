/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** CKEditor5 Imports */
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/** Custom Imports */
import { clientParameterLabels, loanParameterLabels, repaymentParameterLabels } from '../template-parameter-labels';

/** Custom Services */
import { TemplatesService } from '../templates.service';

/**
 * Create Template Component.
 */
@Component({
  selector: 'mifosx-create-template',
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.scss']
})
export class CreateTemplateComponent implements OnInit {

  /** CKEditor5 */
  public Editor = ClassicEditor;
  /** CKEditor5 Template Reference */
  @ViewChild('ckEditor', { static: true }) ckEditor: any;

  /** Template form. */
  templateForm: FormGroup;
  /** Create Template Data. */
  createTemplateData: any;
  /** Template Mappers */
  mappers: any[] = [];
  /** Toggles Visibility of Advance Options */
  showAdvanceOptions = false;

  /** Client Parameter Labels */
  clientParameterLabels: string[] = clientParameterLabels;
  /** Loan Parameter Labels */
  loanParameterLabels: string[] = loanParameterLabels;
  /** Repayment Parameter Labels */
  repaymentParameterLabels: string[] = repaymentParameterLabels;

  /**
   * Retrieves the template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {TemplateService} templateService Templates Service
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private templateService: TemplatesService) {
    this.route.data.subscribe((data: { createTemplateData: any }) => {
      this.createTemplateData = data.createTemplateData;
    });
  }

  ngOnInit() {
    this.createTemplateForm();
    this.buildDependencies();
  }

  /**
   * Creates the template form.
   */
  createTemplateForm() {
    this.templateForm = this.formBuilder.group({
      'entity': ['', Validators.required],
      'type': ['', Validators.required],
      'name': ['', Validators.required]
    });
  }

  /**
   * Subscribe to value changes of entity to set default mapper.
   */
  buildDependencies() {
    const tenantIdentifier = 'default'; // update once global settings are setup.
    this.templateForm.get('entity').valueChanges.subscribe((value: any) => {
      if (value === 0) { // client
        this.mappers.splice(0, 1, {
          mappersorder: 0,
          mapperskey: new FormControl('client'),
          mappersvalue: new FormControl('clients/{{clientId}}?tenantIdentifier=' + tenantIdentifier)
        });
      } else { // loan
        this.mappers.splice(0, 1, {
          mappersorder: 0,
          mapperskey: new FormControl('loan'),
          mappersvalue: new FormControl('loans/{{loanId}}?associations=all&tenantIdentifier=' + tenantIdentifier )
        });
      }
      this.setEditorContent('');
    });
    this.templateForm.get('entity').patchValue(0);
  }

  /**
   * Adds a mapper.
   */
  addMapper() {
    this.mappers.push({
      mappersorder: this.mappers.length,
      mapperskey: new FormControl(''),
      mappersvalue: new FormControl('')
    });
  }

  /**
   * Removes a mapper
   * @param {any} index Mapper Index
   */
  removeMapper(index: any) {
    this.mappers.splice(index, 1);
  }

  /**
   * Adds text to CKEditor at cursor position.
   * @param {string} label Template parameter label.
   */
  addText(label: string) {
    if (this.ckEditor && this.ckEditor.editorInstance) {
      this.ckEditor.editorInstance.model.change((writer: any) => {
        const insertPosition = this.ckEditor.editorInstance.model.document.selection.getFirstPosition();
        writer.insertText(label, insertPosition);
    } );
    }
  }

  /**
   * Gets the contents of CKEditor.
   */
  getEditorContent() {
    if (this.ckEditor && this.ckEditor.editorInstance) {
      return this.ckEditor.editorInstance.getData();
    }
    return '';
  }

  /**
   * Sets the contents of CKEditor.
   * @param {string} content Editor Content
   */
  setEditorContent(content: string) {
    if (this.ckEditor && this.ckEditor.editorInstance) {
      return this.ckEditor.editorInstance.setData(content);
    }
    return '';
  }

  /**
   * Creates a template.
   */
  submit() {
    const template: any = {
      ...this.templateForm.value,
      mappers: this.mappers.map((mapper: any) => ({
        mappersorder: mapper.mappersorder,
        mapperskey: mapper.mapperskey.value,
        mappersvalue: mapper.mappersvalue.value
      })),
      text: this.getEditorContent()
    };
    this.templateService.createTemplate(template).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}

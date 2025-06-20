/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** CKEditor5 Imports */
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/** Custom Imports */
import { clientParameterLabels, loanParameterLabels, repaymentParameterLabels } from '../template-parameter-labels';

/** Custom Services */
import { TemplatesService } from '../templates.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Template Component.
 */
@Component({
  selector: 'mifosx-create-edit-template',
  templateUrl: './create-edit-template.component.html',
  styleUrls: ['./create-edit-template.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    CKEditorModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle
  ]
})
export class CreateEditComponent implements OnInit {
  /** CKEditor5 */
  public Editor = ClassicEditor;
  /** CKEditor5 Template Reference */
  @ViewChild('ckEditor', { static: true }) ckEditor: any;

  /** Template form. */
  templateForm: UntypedFormGroup;
  /** Create or Edit Template Data. */
  templateData: any;
  /** Template Mappers */
  mappers: any[] = [];
  /** Toggles Visibility of Advanced Options */
  showAdvanceOptions = false;
  /** mode */
  mode: 'create' | 'edit';

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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplatesService
  ) {
    this.route.data.subscribe((data: { templateData: any; mode: 'create' | 'edit' }) => {
      this.templateData = data.templateData;
      this.mode = data.mode;
      if (this.mode === 'edit') {
        this.mappers = this.templateData.template.mappers.map((mapper: any) => ({
          mappersorder: mapper.mapperorder,
          mapperskey: new UntypedFormControl(mapper.mapperkey),
          mappersvalue: new UntypedFormControl(mapper.mappervalue)
        }));
      }
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
    if (this.mode === 'create') {
      this.templateForm = this.formBuilder.group({
        entity: [
          '',
          Validators.required
        ],
        type: [
          '',
          Validators.required
        ],
        name: [
          '',
          Validators.required
        ],
        text: [
          '',
          Validators.required
        ]
      });
    } else {
      this.templateForm = this.formBuilder.group({
        entity: [
          this.templateData.entities.find((entity: any) => entity.name === this.templateData.template.entity).id,
          Validators.required
        ],
        type: [
          this.templateData.types.find((type: any) => type.name === this.templateData.template.type).id,
          Validators.required
        ],
        name: [
          this.templateData.template.name,
          Validators.required
        ],
        text: [
          this.templateData.template.text,
          Validators.required
        ]
      });
    }
  }

  /**
   * Subscribe to value changes of entity to set default mapper.
   */
  buildDependencies() {
    const tenantIdentifier = 'default'; // update once global settings are setup.
    this.templateForm.get('entity').valueChanges.subscribe((value: any) => {
      if (value === 0) {
        // client
        this.mappers.splice(0, 1, {
          mappersorder: 0,
          mapperskey: new UntypedFormControl('client'),
          mappersvalue: new UntypedFormControl('clients/{{clientId}}?tenantIdentifier=' + tenantIdentifier)
        });
      } else {
        // loan
        this.mappers.splice(0, 1, {
          mappersorder: 0,
          mapperskey: new UntypedFormControl('loan'),
          mappersvalue: new UntypedFormControl('loans/{{loanId}}?associations=all&tenantIdentifier=' + tenantIdentifier)
        });
      }
      this.setEditorContent('');
    });
    if (this.mode === 'create') {
      this.templateForm.get('entity').patchValue(0);
    }
  }

  /**
   * Adds a mapper.
   */
  addMapper() {
    this.mappers.push({
      mappersorder: this.mappers.length,
      mapperskey: new UntypedFormControl(''),
      mappersvalue: new UntypedFormControl('')
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
      });
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

  onEditorChange(event: any) {
    const editorContent = event.editor.getData();
    this.templateForm.get('text').setValue(editorContent);
  }

  /**
   * Submits a template.
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
    if (this.mode === 'create') {
      this.templateService.createTemplate(template).subscribe((response: any) => {
        this.router.navigate(
          [
            '../',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      });
    } else {
      this.templateService.updateTemplate(template, this.templateData.template.id).subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }
}

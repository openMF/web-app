/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** TinyMCE Imports */
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import type { EditorOptions } from 'tinymce';

/** Custom Imports */
import { clientParameterLabels, loanParameterLabels, repaymentParameterLabels } from '../template-parameter-labels';

/** Custom Services */
import { TemplatesService } from '../templates.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import '../tinymce-loader';

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
    EditorModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle
  ]
})
export class CreateEditComponent implements OnInit {
  /** TinyMCE Template Reference */
  @ViewChild('tinyEditor') tinyEditor?: EditorComponent;
  /** Default TinyMCE editor options (using bundled version via tinymce-loader.ts). */
  readonly tinyMceInit: Partial<EditorOptions> = {
    skin: false,
    content_css: [],
    menubar: false,
    statusbar: false,
    height: 340,
    min_height: 260,
    // Prevent external resource loading
    base_url: '',
    suffix: '',
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'charmap',
      'preview',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'table',
      'wordcount',
      'image',
      'media'
    ],
    toolbar:
      'undo redo | blocks | bold italic | link image table blockquote media | ' +
      'bullist numlist | outdent indent | alignleft aligncenter alignright alignjustify | removeformat code fullscreen preview',
    toolbar_mode: 'wrap',
    content_style: 'body { font-family: var(--mat-body-large-font-family, Inter, Arial, sans-serif); font-size: 14px; }'
  };

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
  /** Convenience getter for editor form control. */
  private get textControl(): UntypedFormControl {
    return this.templateForm.get('text') as UntypedFormControl;
  }
  /** Exposes the editor control to the template. */
  get textFormControl(): UntypedFormControl {
    return this.textControl;
  }

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
      this.textControl.markAsPristine();
      this.textControl.markAsUntouched();
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
   * Adds text to the TinyMCE editor at cursor position.
   * @param {string} label Template parameter label.
   */
  addText(label: string) {
    const editorInstance = this.tinyEditor?.editor;
    if (editorInstance) {
      editorInstance.focus();
      editorInstance.insertContent(label);
      const updatedContent = editorInstance.getContent() || '';
      this.textControl.setValue(updatedContent);
      this.textControl.markAsDirty();
      this.textControl.markAsTouched();
      return;
    }
    const fallbackValue = this.textControl.value || '';
    this.textControl.setValue(`${fallbackValue}${label}`);
    this.textControl.markAsDirty();
    this.textControl.markAsTouched();
  }

  /**
   * Gets the contents of the editor.
   */
  getEditorContent() {
    if (this.tinyEditor?.editor) {
      return this.tinyEditor.editor.getContent() || '';
    }
    return this.textControl?.value || '';
  }

  /**
   * Sets the contents of the editor.
   * @param {string} content Editor Content
   */
  setEditorContent(content: string) {
    this.textControl.setValue(content || '');
  }

  /**
   * Marks the editor control as touched when focus leaves TinyMCE.
   */
  onEditorBlur() {
    this.textControl.markAsTouched();
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

  /**
   * TrackBy function for mappers array to improve ngFor performance.
   * @param {number} index Index of the item
   * @returns {number} Index as unique identifier
   */
  trackByMapperIndex(index: number): number {
    return index;
  }

  /**
   * TrackBy function for parameter labels to improve ngFor performance.
   * @param {number} index Index of the item
   * @param {string} label Label string
   * @returns {string} Label as unique identifier
   */
  trackByLabel(index: number, label: string): string {
    return label;
  }

  /**
   * TrackBy function for entities dropdown to improve ngFor performance.
   * @param {number} index Index of the item
   * @param {any} entity Entity object
   * @returns {number} Entity ID as unique identifier
   */
  trackByEntityId(index: number, entity: any): number {
    return entity.id;
  }

  /**
   * TrackBy function for types dropdown to improve ngFor performance.
   * @param {number} index Index of the item
   * @param {any} type Type object
   * @returns {number} Type ID as unique identifier
   */
  trackByTypeId(index: number, type: any): number {
    return type.id;
  }
}

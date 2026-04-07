/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Imports */
import { clientParameterLabels, loanParameterLabels, repaymentParameterLabels } from '../template-parameter-labels';

/** Custom Services */
import { TemplatesService } from '../templates.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';
import { EditorComponent, EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
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
    EditorModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle
  ],
  providers: [
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: 'assets/tinymce/tinymce.min.js'
    }
  ]
})
export class CreateEditComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private templateService = inject(TemplatesService);
  private themingService = inject(ThemingService);
  private destroyRef = inject(DestroyRef);

  themeKey = 'light';

  editorVisible = true;

  get tinymceConfig() {
    const isDark = this.themeKey === 'dark-theme';
    return {
      base_url: 'assets/tinymce',
      suffix: '.min',
      menubar: false,
      branding: false,
      height: 320,
      forced_root_block: false,
      statusbar: false,
      elementpath: false,
      resize: false,
      skin: isDark ? 'oxide-dark' : 'oxide',
      content_css: isDark ? 'dark' : 'default',
      content_style: isDark ? 'body { background-color: transparent !important; }' : '',
      body_class: isDark ? 'dark-theme' : '',
      plugins: 'lists link table media codesample',
      toolbar:
        'undo redo | blocks | bold italic underline | link | numlist bullist outdent indent | alignleft aligncenter alignright alignjustify | table media | removeformat'
    };
  }
  /** TinyMCE component reference */
  @ViewChild('tinymceEditor', { static: false }) tinymceEditor: EditorComponent;

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
  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { templateData: any; mode: 'create' | 'edit' }) => {
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

    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.themeKey = theme;
      this.editorVisible = false;
      setTimeout(() => (this.editorVisible = true));
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
    this.templateForm
      .get('entity')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
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
            mappersvalue: new UntypedFormControl(
              'loans/{{loanId}}?associations=all&tenantIdentifier=' + tenantIdentifier
            )
          });
        }
        this.setEditorContent('');
        this.templateForm.get('text').setValue('');
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
   * Adds text to the editor at cursor position.
   * @param {string} label Template parameter label.
   */
  addText(label: string) {
    this.tinymceEditor?.editor?.insertContent(label);
  }

  /**
   * Gets the contents of the editor.
   */
  getEditorContent() {
    return this.tinymceEditor?.editor?.getContent({ format: 'html' }) || '';
  }

  /**
   * Sets the contents of the editor.
   * @param {string} content Editor Content
   */
  setEditorContent(content: string) {
    if (this.tinymceEditor?.editor) {
      this.tinymceEditor.editor.setContent(content || '');
    }
    return '';
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

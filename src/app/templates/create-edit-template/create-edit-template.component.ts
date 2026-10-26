/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Imports */
import { clientParameterLabels, loanParameterLabels, repaymentParameterLabels } from '../template-parameter-labels';
import { TemplateTextFormat, htmlToPlainText, isHtmlText, plainTextToHtml } from '../template-text.utils';

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

/** A template type offered by the backend for the Type select. */
interface TemplateTypeOption {
  id: number;
  name: string;
}

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEditComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private templateService = inject(TemplatesService);
  private themingService = inject(ThemingService);
  private destroyRef = inject(DestroyRef);
  private changeDetector = inject(ChangeDetectorRef);

  themeKey = 'light-theme';
  /** Set once the theme active on load has been received; only later emissions re-create the editor. */
  private themeInitialized = false;

  editorVisible = true;

  /**
   * TinyMCE configuration for the HTML editor. Read whenever the editor is created, so the skin follows the theme.
   */
  get tinymceConfig() {
    const isDark = this.themeKey === 'dark-theme';
    return {
      base_url: 'assets/tinymce',
      suffix: '.min',
      menubar: false,
      branding: false,
      height: 320,
      statusbar: false,
      elementpath: false,
      resize: false,
      skin: isDark ? 'oxide-dark' : 'oxide',
      content_css: isDark ? 'dark' : 'default',
      content_style: isDark ? 'body { background-color: transparent !important; }' : '',
      body_class: isDark ? 'dark-theme' : '',
      plugins: 'lists link table media codesample code',
      toolbar:
        'undo redo | blocks | bold italic underline | link | numlist bullist outdent indent | alignleft aligncenter alignright alignjustify | table media | removeformat | code'
    };
  }
  /** TinyMCE component reference */
  @ViewChild('tinymceEditor', { static: false }) tinymceEditor: EditorComponent;
  /** Plain text editor reference */
  @ViewChild('plainTextEditor', { static: false }) plainTextEditor: ElementRef<HTMLTextAreaElement>;

  /** Template form. */
  templateForm: FormGroup;
  /** Create or Edit Template Data. */
  templateData: any;
  /** Template Mappers */
  mappers: any[] = [];
  /** Toggles Visibility of Advanced Options */
  showAdvanceOptions = false;
  /** mode */
  mode: 'create' | 'edit';
  /** Format the template text is authored in: HTML through TinyMCE or plain text stored verbatim. */
  textFormat: TemplateTextFormat = 'html';
  /** Text format choices offered above the editor. */
  textFormatOptions: { value: TemplateTextFormat; label: string }[] = [
    { value: 'plain', label: 'labels.inputs.Plain Text' },
    { value: 'html', label: 'labels.inputs.HTML' }
  ];

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
            mapperskey: new FormControl(mapper.mapperkey),
            mappersvalue: new FormControl(mapper.mappervalue)
          }));
          this.textFormat = isHtmlText(this.templateData.template.text) ? 'html' : 'plain';
        }
      });

    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      const themeChanged = this.themeInitialized && theme !== this.themeKey;
      this.themeInitialized = true;
      this.themeKey = theme;
      if (!themeChanged) {
        return;
      }
      // TinyMCE only reads its skin when it is created, so re-create the editor on theme change.
      // The component is OnPush: without markForCheck the re-created editor would not render until the next event.
      this.editorVisible = false;
      this.changeDetector.markForCheck();
      setTimeout(() => {
        this.editorVisible = true;
        this.changeDetector.markForCheck();
      });
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
   * Subscribe to value changes of entity to set default mapper,
   * and of type to pick a sensible text format while the text is still empty.
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
            mapperskey: new FormControl('client'),
            mappersvalue: new FormControl('clients/{{clientId}}?tenantIdentifier=' + tenantIdentifier)
          });
        } else {
          // loan
          this.mappers.splice(0, 1, {
            mappersorder: 0,
            mapperskey: new FormControl('loan'),
            mappersvalue: new FormControl('loans/{{loanId}}?associations=all&tenantIdentifier=' + tenantIdentifier)
          });
        }
        this.templateForm.get('text').setValue('');
      });
    this.templateForm
      .get('type')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((typeId: number | null) => {
        if (!this.templateForm.get('text').value) {
          this.textFormat = this.isSmsType(typeId) ? 'plain' : 'html';
        }
      });
    if (this.mode === 'create') {
      this.templateForm.get('entity').patchValue(0);
    }
  }

  /**
   * Tells whether a template type id refers to the SMS type.
   * @param {number | null} typeId Template type id.
   */
  isSmsType(typeId: number | null): boolean {
    const types: TemplateTypeOption[] = this.templateData?.types ?? [];
    const type = types.find((templateType) => templateType.id === typeId);
    return /sms/i.test(type?.name ?? '');
  }

  /**
   * Switches the text editor between plain text and HTML.
   * The current text is converted so that nothing visible is lost.
   * @param {TemplateTextFormat} format Target text format.
   */
  setTextFormat(format: TemplateTextFormat) {
    if (format === this.textFormat) {
      return;
    }
    const current = this.getEditorContent();
    const converted = format === 'plain' ? htmlToPlainText(current) : plainTextToHtml(current);
    // The editor for the old format is about to be destroyed, so only the control needs the new value.
    this.templateForm.get('text').setValue(converted, { emitModelToViewChange: false });
    this.textFormat = format;
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
   * Adds text to the editor at cursor position.
   * @param {string} label Template parameter label.
   */
  addText(label: string) {
    if (this.textFormat === 'html') {
      this.tinymceEditor?.editor?.insertContent(label);
      return;
    }
    const textControl = this.templateForm.get('text');
    const textarea = this.plainTextEditor?.nativeElement;
    const current: string = textControl.value || '';
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    textControl.setValue(current.slice(0, start) + label + current.slice(end));
    if (textarea) {
      const cursor = start + label.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    }
  }

  /**
   * Gets the template text as it will be submitted.
   * Plain text comes straight from the form control; HTML is read from TinyMCE when it is available.
   */
  getEditorContent(): string {
    const formValue: string = this.templateForm.get('text').value || '';
    if (this.textFormat === 'plain') {
      return formValue;
    }
    return this.tinymceEditor?.editor?.getContent({ format: 'html' }) || formValue;
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
      template.id = this.templateData.template.id;
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

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { ThemingService } from 'app/shared/theme-toggle/theming.service';
import { TemplatesService } from '../templates.service';
import { CreateEditComponent } from './create-edit-template.component';

describe('CreateEditComponent', () => {
  const templateData = {
    entities: [
      { id: 0, name: 'client' },
      { id: 1, name: 'loan' }
    ],
    types: [
      { id: 0, name: 'Document' },
      { id: 2, name: 'SMS' }
    ],
    template: {
      id: 76,
      entity: 'client',
      type: 'SMS',
      name: 'SELF_SERVICE_LOGIN_SUCCESS_EMAIL_SUBJECT',
      text: '<p>Original</p>',
      mappers: [] as any[]
    }
  };

  const withText = (text: string) => ({ ...templateData, template: { ...templateData.template, text } });

  let router: { navigate: jest.Mock };
  let templatesService: { createTemplate: jest.Mock; updateTemplate: jest.Mock };
  let changeDetector: { markForCheck: jest.Mock };

  function createComponent(
    mode: 'create' | 'edit',
    data = templateData,
    theme: Observable<string> = of('light-theme')
  ): CreateEditComponent {
    TestBed.resetTestingModule();
    router = { navigate: jest.fn() };
    changeDetector = { markForCheck: jest.fn() };
    templatesService = {
      createTemplate: jest.fn().mockReturnValue(of({ resourceId: 77 })),
      updateTemplate: jest.fn().mockReturnValue(of({ resourceId: data.template?.id }))
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({ templateData: data, mode }) } },
        { provide: Router, useValue: router },
        { provide: TemplatesService, useValue: templatesService },
        { provide: ThemingService, useValue: { theme } },
        { provide: ChangeDetectorRef, useValue: changeDetector }
      ]
    });

    let component: CreateEditComponent;
    TestBed.runInInjectionContext(() => {
      component = new CreateEditComponent();
    });
    component.ngOnInit();
    return component;
  }

  it('includes the template id in the update payload on edit submit', () => {
    const component = createComponent('edit');
    jest.spyOn(component, 'getEditorContent').mockReturnValue('<p>Updated</p>');

    component.submit();

    expect(templatesService.updateTemplate).toHaveBeenCalledWith(
      {
        id: templateData.template.id,
        entity: 0,
        type: 2,
        name: 'SELF_SERVICE_LOGIN_SUCCESS_EMAIL_SUBJECT',
        text: '<p>Updated</p>',
        mappers: []
      },
      templateData.template.id
    );
    expect(templatesService.createTemplate).not.toHaveBeenCalled();
  });

  it('does not add an id to the create payload', () => {
    const component = createComponent('create');
    component.templateForm.patchValue({
      entity: 1,
      type: 2,
      name: 'New Template',
      text: '<p>Draft</p>'
    });
    jest.spyOn(component, 'getEditorContent').mockReturnValue('<p>Created</p>');

    component.submit();

    const [payload] = templatesService.createTemplate.mock.calls[0];
    expect(payload).not.toHaveProperty('id');
    expect(payload).toMatchObject({
      entity: 1,
      type: 2,
      name: 'New Template',
      text: '<p>Created</p>'
    });
    expect(templatesService.updateTemplate).not.toHaveBeenCalled();
  });

  describe('text format', () => {
    it('opens the HTML editor for a template that contains markup', () => {
      expect(createComponent('edit').textFormat).toBe('html');
    });

    it('opens the plain text editor for a template without markup and submits the text verbatim', () => {
      const text = 'Hi {{client.displayName}}, you & yours owe < 5';
      const component = createComponent('edit', withText(text));

      expect(component.textFormat).toBe('plain');

      component.submit();

      expect(templatesService.updateTemplate.mock.calls[0][0].text).toBe(text);
    });

    it('defaults a new SMS template to plain text and other types to HTML while the text is empty', () => {
      const component = createComponent('create');
      expect(component.textFormat).toBe('html');

      component.templateForm.get('type').setValue(2);
      expect(component.textFormat).toBe('plain');

      component.templateForm.get('type').setValue(0);
      expect(component.textFormat).toBe('html');

      component.templateForm.get('text').setValue('Keep me');
      component.templateForm.get('type').setValue(2);
      expect(component.textFormat).toBe('html');
    });

    it('converts the text when switching between HTML and plain text', () => {
      const component = createComponent('edit');
      component.templateForm.get('text').setValue('<p>Hello <b>{{name}}</b></p>\n<p>You &amp; yours</p>');

      component.setTextFormat('plain');
      expect(component.textFormat).toBe('plain');
      expect(component.templateForm.get('text').value).toBe('Hello {{name}}\n\nYou & yours');

      component.setTextFormat('html');
      expect(component.textFormat).toBe('html');
      expect(component.templateForm.get('text').value).toBe('<p>Hello {{name}}</p><p>You &amp; yours</p>');
    });

    it('submits leading and trailing whitespace unchanged after a round trip through HTML and back', () => {
      const text = '\nDear {{client.displayName}},\n\nBalance & more \n';
      const component = createComponent('edit', withText(text));

      component.setTextFormat('html');
      component.setTextFormat('plain');
      component.submit();

      expect(templatesService.updateTemplate.mock.calls[0][0].text).toBe(text);
    });

    it('submits the original plain text after a round trip through HTML and back', () => {
      const text = 'first\n\nsecond & third\nfourth';
      const component = createComponent('edit', withText(text));

      component.setTextFormat('html');
      component.setTextFormat('plain');
      component.submit();

      expect(templatesService.updateTemplate.mock.calls[0][0].text).toBe(text);
    });

    it('inserts a parameter at the cursor of the plain text editor', () => {
      const component = createComponent('edit', withText('Dear , welcome'));
      const textarea = { selectionStart: 5, selectionEnd: 5, focus: jest.fn(), setSelectionRange: jest.fn() };
      component.plainTextEditor = { nativeElement: textarea } as any;

      component.addText('{{client.displayName}}');

      expect(component.templateForm.get('text').value).toBe('Dear {{client.displayName}}, welcome');
      expect(textarea.focus).toHaveBeenCalled();
      expect(textarea.setSelectionRange).toHaveBeenCalledWith(27, 27);
    });

    it('appends a parameter when the plain text editor is not rendered', () => {
      const component = createComponent('edit', withText('Dear '));

      component.addText('{{client.displayName}}');

      expect(component.templateForm.get('text').value).toBe('Dear {{client.displayName}}');
    });
  });

  describe('theme changes', () => {
    afterEach(() => jest.useRealTimers());

    it('keeps the editor visible on the initial theme and does not touch change detection', () => {
      const component = createComponent('edit');

      expect(component.editorVisible).toBe(true);
      expect(component.themeKey).toBe('light-theme');
      expect(changeDetector.markForCheck).not.toHaveBeenCalled();
    });

    it('does not re-create the editor when the theme active on load is dark', () => {
      const component = createComponent('edit', templateData, of('dark-theme'));

      expect(component.themeKey).toBe('dark-theme');
      expect(component.editorVisible).toBe(true);
      expect(changeDetector.markForCheck).not.toHaveBeenCalled();
    });

    it('re-creates the editor and marks the OnPush view for check when the theme changes', () => {
      jest.useFakeTimers();
      const theme = new BehaviorSubject('light-theme');
      const component = createComponent('edit', templateData, theme);

      theme.next('dark-theme');

      expect(component.themeKey).toBe('dark-theme');
      expect(component.editorVisible).toBe(false);
      expect(changeDetector.markForCheck).toHaveBeenCalledTimes(1);

      jest.runOnlyPendingTimers();

      expect(component.editorVisible).toBe(true);
      expect(changeDetector.markForCheck).toHaveBeenCalledTimes(2);
    });
  });
});

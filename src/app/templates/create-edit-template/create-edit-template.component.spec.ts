/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

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

  let router: { navigate: jest.Mock };
  let templatesService: { createTemplate: jest.Mock; updateTemplate: jest.Mock };

  function createComponent(mode: 'create' | 'edit', data = templateData): CreateEditComponent {
    TestBed.resetTestingModule();
    router = { navigate: jest.fn() };
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
        { provide: ThemingService, useValue: { theme: of('light-theme') } }
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
});

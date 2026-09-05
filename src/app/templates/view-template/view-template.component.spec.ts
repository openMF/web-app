/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TemplatesService } from '../templates.service';
import { ViewTemplateComponent } from './view-template.component';

describe('ViewTemplateComponent', () => {
  const template = {
    id: 96,
    name: 'SELF_SERVICE_TRANSFER_SUCCESS_EMAIL',
    entity: 'client',
    type: 'SMS',
    mappers: [] as any[]
  };

  let routeData: BehaviorSubject<{ template: any }>;

  async function render(text: string): Promise<ComponentFixture<ViewTemplateComponent>> {
    TestBed.resetTestingModule();
    routeData = new BehaviorSubject({ template: { ...template, text } });
    await TestBed.configureTestingModule({
      imports: [
        ViewTemplateComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: routeData.asObservable() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: TemplatesService, useValue: { deleteTemplate: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ]
    }).compileComponents();
    TestBed.inject(FaIconLibrary).addIcons(faEdit, faTrash);
    const fixture = TestBed.createComponent(ViewTemplateComponent);
    fixture.detectChanges();
    return fixture;
  }

  /** A stand-in for the preview frame: jsdom does not lay out documents, so sizes are given explicitly. */
  function fakeFrame(documentHeight: number, viewportHeight = documentHeight, width = 600) {
    return {
      clientWidth: width,
      style: { height: '' },
      contentDocument: {
        documentElement: { scrollHeight: documentHeight, clientHeight: documentHeight },
        body: { scrollHeight: documentHeight - 16 }
      },
      contentWindow: { innerHeight: viewportHeight }
    } as unknown as HTMLIFrameElement;
  }

  it('shows a plain text template verbatim, line breaks included', async () => {
    const text = 'Transferencia exitosa\nTransferencia realizada correctamente por ${transactionAmount}.\n\n<3';
    const fixture = await render(text);

    const plainText = fixture.nativeElement.querySelector('.plain-text') as HTMLElement;
    expect(plainText.textContent).toBe(text);
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('renders an HTML template in a sandboxed frame with its styles intact', async () => {
    const text =
      '<style>.title { color: red; }</style>' +
      '<h1 class="title" style="margin: 0">Hola ${firstname}</h1>' +
      '<table border="1"><tr><td>${currency} ${transactionAmount}</td></tr></table>';
    const fixture = await render(text);

    const frame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(frame).not.toBeNull();
    expect(frame.getAttribute('sandbox')).toBe('allow-same-origin');
    expect(frame.srcdoc).toBe(text);
    expect(fixture.nativeElement.querySelector('.plain-text')).toBeNull();
  });

  it('switches between plain text and HTML when the route shows another template', async () => {
    const fixture = await render('Plain ${firstname}');
    expect(fixture.nativeElement.querySelector('.plain-text')).not.toBeNull();

    routeData.next({ template: { ...template, id: 97, text: '<p>Hola ${firstname}</p>' } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.plain-text')).toBeNull();
    const frame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(frame.srcdoc).toBe('<p>Hola ${firstname}</p>');
  });

  it('sizes the preview frame to its document height', async () => {
    const fixture = await render('<p>Hola</p>');
    const frame = fakeFrame(640);

    fixture.componentInstance.fitPreview(frame);

    expect(frame.style.height).toBe('640px');
  });

  it('leaves room for a horizontal scrollbar when the template is wider than the frame', async () => {
    const fixture = await render('<p>Hola</p>');
    const frame = fakeFrame(640, 655);

    fixture.componentInstance.fitPreview(frame);

    expect(frame.style.height).toBe('655px');
  });

  it('re-fits the preview frame when its width changes', async () => {
    const callbacks: ResizeObserverCallback[] = [];
    const observe = jest.fn();
    const disconnect = jest.fn();
    (globalThis as any).ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }
      observe = observe;
      disconnect = disconnect;
    };
    try {
      const fixture = await render('<p>Hola</p>');
      const component = fixture.componentInstance;
      const frame = fakeFrame(640);
      const fitPreview = jest.spyOn(component, 'fitPreview');

      component.onPreviewLoad(frame);
      const onResize = callbacks[callbacks.length - 1];
      expect(fitPreview).toHaveBeenCalledTimes(1);
      expect(observe).toHaveBeenCalledWith(frame);

      onResize([], {} as ResizeObserver);
      expect(fitPreview).toHaveBeenCalledTimes(1);

      (frame as any).clientWidth = 400;
      onResize([], {} as ResizeObserver);
      expect(fitPreview).toHaveBeenCalledTimes(2);

      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete (globalThis as any).ResizeObserver;
    }
  });
});

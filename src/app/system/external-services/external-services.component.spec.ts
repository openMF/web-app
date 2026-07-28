/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faBell,
  faCloud,
  faCommentAlt,
  faEnvelope,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ExternalServicesComponent } from './external-services.component';
import {
  EXTERNAL_SERVICE_REGISTRY,
  ExternalServiceConfiguration,
  getVisibleExternalServices
} from './external-services.config';

describe('ExternalServicesComponent', () => {
  let component: ExternalServicesComponent;
  let fixture: ComponentFixture<ExternalServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExternalServicesComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) }
        }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faArrowDown, faArrowUp, faBell, faCloud, faCommentAlt, faEnvelope, faKey);

    fixture = TestBed.createComponent(ExternalServicesComponent);
    component = fixture.componentInstance;
  });

  it('renders configured SMTP, SMS, and Amazon S3 services', () => {
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;

    expect(textContent).toContain('labels.heading.Email External Service');
    expect(textContent).toContain('labels.heading.SMS External Service');
    expect(textContent).toContain('labels.heading.S3 Amazon External Service');
    expect(component.externalServices.map((service: ExternalServiceConfiguration) => service.id)).toEqual([
      'amazon-s3',
      'sms',
      'email',
      'notification'
    ]);
  });

  it('renders from the service registry instead of service-specific template blocks', () => {
    const customService: ExternalServiceConfiguration = {
      id: 'custom',
      label: 'labels.heading.Custom External Service',
      description: 'labels.text.Custom External Service Configuration',
      icon: 'key',
      route: ['custom']
    };

    component.externalServices = [customService];
    component.serviceColumns = component.getServiceColumns(component.externalServices);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('labels.heading.Custom External Service');
    expect(component.serviceColumns).toEqual([[customService]]);
  });

  it('keeps the configured route selection for existing deep links', () => {
    expect(EXTERNAL_SERVICE_REGISTRY.find((service) => service.id === 'amazon-s3')?.route).toEqual(['amazon-s3']);
    expect(EXTERNAL_SERVICE_REGISTRY.find((service) => service.id === 'sms')?.route).toEqual(['sms']);
    expect(EXTERNAL_SERVICE_REGISTRY.find((service) => service.id === 'email')?.route).toEqual(['email']);
  });

  it('filters services by configured permission when RBAC is enabled', () => {
    const registry: ExternalServiceConfiguration[] = [
      {
        id: 'visible',
        label: 'Visible',
        description: 'Visible description',
        icon: 'key',
        route: ['visible'],
        requiredPermission: 'READ_VISIBLE_SERVICE'
      },
      {
        id: 'hidden',
        label: 'Hidden',
        description: 'Hidden description',
        icon: 'key',
        route: ['hidden'],
        requiredPermission: 'UPDATE_HIDDEN_SERVICE'
      }
    ];

    expect(getVisibleExternalServices(registry, {}, ['ALL_FUNCTIONS_READ'], true).map((service) => service.id)).toEqual(
      [
        'visible'
      ]
    );
  });

  it('does not apply configured permissions when RBAC is disabled', () => {
    const registry: ExternalServiceConfiguration[] = [
      {
        id: 'legacy-visible',
        label: 'Legacy visible',
        description: 'Legacy visible description',
        icon: 'key',
        route: ['legacy-visible'],
        requiredPermission: 'UPDATE_LEGACY_SERVICE'
      }
    ];

    expect(getVisibleExternalServices(registry, {}, [], false).map((service) => service.id)).toEqual([
      'legacy-visible'
    ]);
  });

  it('filters services by availability when a registry entry has an existing availability context', () => {
    const registry: ExternalServiceConfiguration[] = [
      {
        id: 'enabled',
        label: 'Enabled',
        description: 'Enabled description',
        icon: 'key',
        route: ['enabled'],
        isAvailable: (context) => context['enabled'] === true
      },
      {
        id: 'disabled',
        label: 'Disabled',
        description: 'Disabled description',
        icon: 'key',
        route: ['disabled'],
        isAvailable: (context) => context['enabled'] === false
      }
    ];

    expect(getVisibleExternalServices(registry, { enabled: true }, [], false).map((service) => service.id)).toEqual([
      'enabled'
    ]);
  });

  it('shows an empty state when no services are visible', () => {
    component.externalServices = [];
    component.serviceColumns = component.getServiceColumns(component.externalServices);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('labels.text.No data found');
  });

  it('toggles a service description from the generated row action', () => {
    fixture.detectChanges();

    expect(component.isServiceDescriptionVisible('sms')).toBe(false);

    const expandButtons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
    expandButtons[1].click();
    fixture.detectChanges();

    expect(component.isServiceDescriptionVisible('sms')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('labels.text.SMS Service Configuration');
  });
});

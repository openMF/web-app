/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { PopoverService } from 'app/configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
import { DocumentationLinksService } from 'app/shared/services/documentation-links.service';
import { SettingsService } from 'app/settings/settings.service';
import { LogoutDialogComponent } from 'app/shared/logout-dialog/logout-dialog.component';
import { ToolbarComponent } from 'app/core/shell/toolbar/toolbar.component';
import { SidenavComponent } from 'app/core/shell/sidenav/sidenav.component';

/* The confirmation gate lives in the component class, not in its presentation,
   so the heavy child components pulled in by each template are left out of the
   way (their templates are replaced by an empty one below) while every injected
   dependency is replaced by a focused mock. */

const mockDialogOpen = jest.fn();

const mockRouter = { navigate: jest.fn() };

const mockBreakpointObserver = { observe: jest.fn(() => of({ matches: false })) };

const mockAuthenticationService = {
  logout: jest.fn(() => of(true)),
  getCredentials: jest.fn(() => ({ username: 'tester' }))
};

const mockPopoverService = { open: jest.fn() };

/* Tour flags are off so ngAfterViewInit does not schedule the configuration
   wizard popover tour while the gate is being exercised. */
const mockConfigurationWizardService = {
  showToolbar: false,
  showToolbarAdmin: false,
  showSideNav: false,
  showSideNavChartofAccounts: false,
  showBreadcrumbs: false
};

const mockDocumentationLinks = { open: jest.fn() };
const mockSettingsService = { tenantIdentifier: 'default' };

describe('Logout confirmation gate — toolbar and sidenav', () => {
  let toolbarFixture: ComponentFixture<ToolbarComponent>;
  let toolbarComponent: ToolbarComponent;
  let sidenavFixture: ComponentFixture<SidenavComponent>;
  let sidenavComponent: SidenavComponent;

  beforeEach(async () => {
    (localStorage.getItem as unknown as jest.Mock).mockReturnValue('[]');
    mockDialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialog, useValue: { open: mockDialogOpen } },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthenticationService },
        { provide: PopoverService, useValue: mockPopoverService },
        { provide: ConfigurationWizardService, useValue: mockConfigurationWizardService },
        { provide: DocumentationLinksService, useValue: mockDocumentationLinks },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    })
      .overrideComponent(ToolbarComponent, { set: { template: '' } })
      .overrideComponent(SidenavComponent, { set: { template: '' } })
      .compileComponents();

    toolbarFixture = TestBed.createComponent(ToolbarComponent);
    toolbarComponent = toolbarFixture.componentInstance;
    toolbarFixture.detectChanges();

    sidenavFixture = TestBed.createComponent(SidenavComponent);
    sidenavComponent = sidenavFixture.componentInstance;
    sidenavFixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ToolbarComponent', () => {
    it('opens LogoutDialogComponent on confirmLogout and logs out when confirmed', () => {
      jest.spyOn(toolbarComponent, 'logout').mockImplementation(() => {});

      toolbarComponent.confirmLogout();

      expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
      expect(mockDialogOpen).toHaveBeenCalledTimes(1);
      expect(toolbarComponent.logout).toHaveBeenCalledTimes(1);
    });

    it('preserves the session when the dialog is confirmed false', () => {
      mockDialogOpen.mockReturnValueOnce({ afterClosed: () => of(false) });
      jest.spyOn(toolbarComponent, 'logout').mockImplementation(() => {});

      toolbarComponent.confirmLogout();

      expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
      expect(toolbarComponent.logout).not.toHaveBeenCalled();
    });

    it('preserves the session when the dialog is dismissed (undefined)', () => {
      mockDialogOpen.mockReturnValueOnce({ afterClosed: () => of(undefined) });
      jest.spyOn(toolbarComponent, 'logout').mockImplementation(() => {});

      toolbarComponent.confirmLogout();

      expect(toolbarComponent.logout).not.toHaveBeenCalled();
    });
  });

  describe('SidenavComponent', () => {
    it('opens LogoutDialogComponent on confirmLogout and logs out when confirmed', () => {
      jest.spyOn(sidenavComponent, 'logout').mockImplementation(() => {});

      sidenavComponent.confirmLogout();

      expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
      expect(mockDialogOpen).toHaveBeenCalledTimes(1);
      expect(sidenavComponent.logout).toHaveBeenCalledTimes(1);
    });

    it('preserves the session when the dialog is confirmed false', () => {
      mockDialogOpen.mockReturnValueOnce({ afterClosed: () => of(false) });
      jest.spyOn(sidenavComponent, 'logout').mockImplementation(() => {});

      sidenavComponent.confirmLogout();

      expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
      expect(sidenavComponent.logout).not.toHaveBeenCalled();
    });

    it('preserves the session when the dialog is dismissed (undefined)', () => {
      mockDialogOpen.mockReturnValueOnce({ afterClosed: () => of(undefined) });
      jest.spyOn(sidenavComponent, 'logout').mockImplementation(() => {});

      sidenavComponent.confirmLogout();

      expect(sidenavComponent.logout).not.toHaveBeenCalled();
    });
  });
});

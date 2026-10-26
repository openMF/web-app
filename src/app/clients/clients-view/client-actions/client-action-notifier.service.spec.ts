import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ClientActionNotifierService } from './client-action-notifier.service';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ClientActionNotifierService', () => {
  let service: ClientActionNotifierService;
  let snackBar: jest.Mocked<MatSnackBar>;
  let translateService: jest.Mocked<TranslateService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    snackBar = { open: jest.fn() } as any;
    translateService = { instant: jest.fn((key: string) => key) } as any;
    router = { navigate: jest.fn() } as any;

    TestBed.configureTestingModule({
      providers: [
        ClientActionNotifierService,
        { provide: MatSnackBar, useValue: snackBar },
        { provide: TranslateService, useValue: translateService },
        { provide: Router, useValue: router }
      ]
    });

    service = TestBed.inject(ClientActionNotifierService);
  });

  describe('notify', () => {
    it('should open snackbar with translated message and close label', () => {
      service.notify('clients.actions.reactivate.failure');

      expect(translateService.instant).toHaveBeenCalledWith('clients.actions.reactivate.failure');
      expect(translateService.instant).toHaveBeenCalledWith('labels.buttons.Close');
      expect(snackBar.open).toHaveBeenCalledWith('clients.actions.reactivate.failure', 'labels.buttons.Close', {
        duration: 3000
      });
    });
  });

  describe('notifyAndNavigate', () => {
    it('should open snackbar and navigate with default commands', () => {
      const route = {} as ActivatedRoute;

      service.notifyAndNavigate('clients.actions.activate.success', route);

      expect(translateService.instant).toHaveBeenCalledWith('clients.actions.activate.success');
      expect(translateService.instant).toHaveBeenCalledWith('labels.buttons.Close');
      expect(snackBar.open).toHaveBeenCalledWith('clients.actions.activate.success', 'labels.buttons.Close', {
        duration: 3000
      });
      expect(router.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: route });
    });

    it('should navigate with custom commands when provided', () => {
      const route = {} as ActivatedRoute;

      service.notifyAndNavigate('clients.actions.takeSurvey.success', route, ['../../general']);

      expect(router.navigate).toHaveBeenCalledWith(['../../general'], { relativeTo: route });
    });
  });
});

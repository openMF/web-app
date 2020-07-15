import { TestBed } from '@angular/core/testing';

import { ConfigurationWizardService } from './configuration-wizard.service';

describe('ConfigurationWizardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfigurationWizardService = TestBed.get(ConfigurationWizardService);
    expect(service).toBeTruthy();
  });
});

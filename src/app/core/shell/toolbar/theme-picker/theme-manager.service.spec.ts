import { TestBed, inject } from '@angular/core/testing';

import { ThemeManagerService } from './theme-manager.service';

describe('ThemeManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeManagerService]
    });
  });

  it('should be created', inject([ThemeManagerService], (service: ThemeManagerService) => {
    expect(service).toBeTruthy();
  }));
});

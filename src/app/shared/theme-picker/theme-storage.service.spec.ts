import { TestBed, inject } from '@angular/core/testing';

import { ThemeStorageService } from './theme-storage.service';

describe('ThemeStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeStorageService]
    });
  });

  it('should be created', inject([ThemeStorageService], (service: ThemeStorageService) => {
    expect(service).toBeTruthy();
  }));
});

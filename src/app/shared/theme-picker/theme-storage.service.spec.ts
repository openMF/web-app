import { TestBed, inject } from '@angular/core/testing';

import { ThemeStorageService } from './theme-storage.service';
import { HttpClientModule } from '@angular/common/http';

describe('ThemeStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeStorageService],
      imports: [HttpClientModule]
    });
  });

  it('should be created', inject([ThemeStorageService], (service: ThemeStorageService) => {
    expect(service).toBeTruthy();
  }));
});

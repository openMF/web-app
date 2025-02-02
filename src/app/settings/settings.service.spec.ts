import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';
import { DatePipe } from '@angular/common';

describe('SettingsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [DatePipe]
    })
  );

  it('should be created', () => {
    const service: SettingsService = TestBed.inject(SettingsService);
    expect(service).toBeTruthy();
  });
});

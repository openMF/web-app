import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';
import { CommonModule, DatePipe } from '@angular/common';

describe('SettingsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [DatePipe]
    })
  );

  it('should be created', () => {
    const service: SettingsService = TestBed.inject(SettingsService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { OrganizationService } from './organization.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('OrganizationService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    })
  );

  it('should be created', () => {
    const service: OrganizationService = TestBed.inject(OrganizationService);
    expect(service).toBeTruthy();
  });
});

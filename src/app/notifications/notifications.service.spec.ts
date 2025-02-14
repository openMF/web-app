import { TestBed } from '@angular/core/testing';

import { NotificationsService } from './notifications.service';
import { HttpClientModule } from '@angular/common/http';

describe('NotificationsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: NotificationsService = TestBed.inject(NotificationsService);
    expect(service).toBeTruthy();
  });
});

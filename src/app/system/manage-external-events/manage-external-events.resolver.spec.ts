import { TestBed } from '@angular/core/testing';

import { ManageExternalEventsResolver } from './manage-external-events.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('ManageExternalEventsResolver', () => {
  let resolver: ManageExternalEventsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(ManageExternalEventsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

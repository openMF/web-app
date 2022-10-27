import { TestBed } from '@angular/core/testing';

import { ManageExternalEventsResolver } from './manage-external-events.resolver';

describe('ManageExternalEventsResolver', () => {
  let resolver: ManageExternalEventsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ManageExternalEventsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

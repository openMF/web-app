import { TestBed } from '@angular/core/testing';

import { WorkflowJobResolver } from './workflow-jobs.resolver';

describe('WorkflowJobResolver', () => {
  let resolver: WorkflowJobResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(WorkflowJobResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

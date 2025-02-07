import { TestBed } from '@angular/core/testing';

import { WorkflowJobResolver } from './workflow-jobs.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('WorkflowJobResolver', () => {
  let resolver: WorkflowJobResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(WorkflowJobResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

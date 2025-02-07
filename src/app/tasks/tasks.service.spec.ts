import { TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';
import { HttpClientModule } from '@angular/common/http';

describe('TasksService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: TasksService = TestBed.inject(TasksService);
    expect(service).toBeTruthy();
  });
});

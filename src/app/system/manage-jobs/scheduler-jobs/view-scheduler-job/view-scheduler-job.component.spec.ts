import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSchedulerJobComponent } from './view-scheduler-job.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewSchedulerJobComponent', () => {
  let component: ViewSchedulerJobComponent;
  let fixture: ComponentFixture<ViewSchedulerJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSchedulerJobComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ selectedJob: 'Lipsum in de lorem' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSchedulerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

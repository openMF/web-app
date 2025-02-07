import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSchedulerJobComponent } from './view-scheduler-job.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewSchedulerJobComponent', () => {
  let component: ViewSchedulerJobComponent;
  let fixture: ComponentFixture<ViewSchedulerJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSchedulerJobComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ selectedJob: 'Lipsum in de lorem' })
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

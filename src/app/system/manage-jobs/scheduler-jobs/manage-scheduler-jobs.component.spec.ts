import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSchedulerJobsComponent } from './manage-scheduler-jobs.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ManageSchedulerJobsComponent', () => {
  let component: ManageSchedulerJobsComponent;
  let fixture: ComponentFixture<ManageSchedulerJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageSchedulerJobsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSchedulerJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSchedulerJobsComponent } from './manage-scheduler-jobs.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

describe('ManageSchedulerJobsComponent', () => {
  let component: ManageSchedulerJobsComponent;
  let fixture: ComponentFixture<ManageSchedulerJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageSchedulerJobsComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatDialogModule,
        CommonModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
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

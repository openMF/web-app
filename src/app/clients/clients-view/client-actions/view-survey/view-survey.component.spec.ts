import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSurveyComponent } from './view-survey.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ViewSurveyComponent', () => {
  let component: ViewSurveyComponent;
  let fixture: ComponentFixture<ViewSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSurveyComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

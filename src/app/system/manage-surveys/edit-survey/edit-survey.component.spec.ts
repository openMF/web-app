import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSurveyComponent } from './edit-survey.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditSurveyComponent', () => {
  let component: EditSurveyComponent;
  let fixture: ComponentFixture<EditSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSurveyComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

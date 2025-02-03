import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSurveyComponent } from './edit-survey.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('EditSurveyComponent', () => {
  let component: EditSurveyComponent;
  let fixture: ComponentFixture<EditSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSurveyComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
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

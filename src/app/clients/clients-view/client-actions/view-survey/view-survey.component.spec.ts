import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSurveyComponent } from './view-survey.component';

describe('ViewSurveyComponent', () => {
  let component: ViewSurveyComponent;
  let fixture: ComponentFixture<ViewSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSurveyComponent ]
    })
    .compileComponents();
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSurveysComponent } from './manage-surveys.component';

describe('SurveysComponent', () => {
  let component: ManageSurveysComponent;
  let fixture: ComponentFixture<ManageSurveysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSurveysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

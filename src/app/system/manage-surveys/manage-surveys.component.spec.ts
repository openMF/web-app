import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageSurveysComponent } from './manage-surveys.component';

describe('SurveysComponent', () => {
  let component: ManageSurveysComponent;
  let fixture: ComponentFixture<ManageSurveysComponent>;

  beforeEach(waitForAsync(() => {
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

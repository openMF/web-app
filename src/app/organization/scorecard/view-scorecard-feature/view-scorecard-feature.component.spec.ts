import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewScorecardFeatureComponent } from './view-scorecard-feature.component';

describe('CreateEnityDataTableChecksComponent', () => {
  let component: ViewScorecardFeatureComponent;
  let fixture: ComponentFixture<ViewScorecardFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewScorecardFeatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewScorecardFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

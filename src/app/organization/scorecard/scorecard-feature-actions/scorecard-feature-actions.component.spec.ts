import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorecardFeatureActionsComponent } from './scorecard-feature-actions.component';

describe('ScorecardFeatureActionsComponent', () => {
  let component: ScorecardFeatureActionsComponent;
  let fixture: ComponentFixture<ScorecardFeatureActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorecardFeatureActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorecardFeatureActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

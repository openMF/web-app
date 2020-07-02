import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestRateChartTabComponent } from './interest-rate-chart-tab.component';

describe('InterestRateChartTabComponent', () => {
  let component: InterestRateChartTabComponent;
  let fixture: ComponentFixture<InterestRateChartTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterestRateChartTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestRateChartTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

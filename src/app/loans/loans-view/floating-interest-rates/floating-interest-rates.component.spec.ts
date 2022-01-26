import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FloatingInterestRatesComponent } from './floating-interest-rates.component';

describe('FloatingInterestRatesComponent', () => {
  let component: FloatingInterestRatesComponent;
  let fixture: ComponentFixture<FloatingInterestRatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingInterestRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingInterestRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FloatingRatesComponent } from './floating-rates.component';

describe('FloatingRatesComponent', () => {
  let component: FloatingRatesComponent;
  let fixture: ComponentFixture<FloatingRatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

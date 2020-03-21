import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingRatesComponent } from './floating-rates.component';

describe('FloatingRatesComponent', () => {
  let component: FloatingRatesComponent;
  let fixture: ComponentFixture<FloatingRatesComponent>;

  beforeEach(async(() => {
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

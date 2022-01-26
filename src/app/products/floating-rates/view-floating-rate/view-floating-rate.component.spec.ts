import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewFloatingRateComponent } from './view-floating-rate.component';

describe('ViewFloatingRateComponent', () => {
  let component: ViewFloatingRateComponent;
  let fixture: ComponentFixture<ViewFloatingRateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFloatingRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFloatingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

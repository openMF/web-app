import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingRatePeriodDialogComponent } from './floating-rate-period-dialog.component';

describe('FloatingRatePeriodDialogComponent', () => {
  let component: FloatingRatePeriodDialogComponent;
  let fixture: ComponentFixture<FloatingRatePeriodDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingRatePeriodDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingRatePeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

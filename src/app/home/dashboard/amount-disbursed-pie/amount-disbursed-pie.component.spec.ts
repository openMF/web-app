import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AmountDisbursedPieComponent } from './amount-disbursed-pie.component';

describe('AmountDisbursedPieComponent', () => {
  let component: AmountDisbursedPieComponent;
  let fixture: ComponentFixture<AmountDisbursedPieComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AmountDisbursedPieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountDisbursedPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

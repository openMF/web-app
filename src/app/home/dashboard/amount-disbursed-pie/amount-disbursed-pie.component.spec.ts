import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountDisbursedPieComponent } from './amount-disbursed-pie.component';

describe('AmountDisbursedPieComponent', () => {
  let component: AmountDisbursedPieComponent;
  let fixture: ComponentFixture<AmountDisbursedPieComponent>;

  beforeEach(async(() => {
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

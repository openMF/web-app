import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositGeneralTabComponent } from './fixed-deposit-general-tab.component';

describe('FixedDepositGeneralTabComponent', () => {
  let component: FixedDepositGeneralTabComponent;
  let fixture: ComponentFixture<FixedDepositGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedDepositGeneralTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

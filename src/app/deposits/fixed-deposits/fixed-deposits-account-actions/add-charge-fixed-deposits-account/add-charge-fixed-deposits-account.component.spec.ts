import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargeFixedDepositsAccountComponent } from './add-charge-fixed-deposits-account.component';

describe('AddChargeFixedDepositsAccountComponent', () => {
  let component: AddChargeFixedDepositsAccountComponent;
  let fixture: ComponentFixture<AddChargeFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChargeFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChargeFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

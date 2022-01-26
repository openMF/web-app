import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditFixedDepositAccountComponent } from './edit-fixed-deposit-account.component';

describe('EditFixedDepositAccountComponent', () => {
  let component: EditFixedDepositAccountComponent;
  let fixture: ComponentFixture<EditFixedDepositAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFixedDepositAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFixedDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

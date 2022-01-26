import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddChargeSavingsAccountComponent } from './add-charge-savings-account.component';

describe('AddChargeSavingsAccountComponent', () => {
  let component: AddChargeSavingsAccountComponent;
  let fixture: ComponentFixture<AddChargeSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChargeSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChargeSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargeSavingsAccountComponent } from './add-charge-savings-account.component';

describe('AddChargeSavingsAccountComponent', () => {
  let component: AddChargeSavingsAccountComponent;
  let fixture: ComponentFixture<AddChargeSavingsAccountComponent>;

  beforeEach(async(() => {
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

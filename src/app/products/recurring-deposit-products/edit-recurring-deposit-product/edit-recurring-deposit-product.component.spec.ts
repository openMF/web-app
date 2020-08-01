import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRecurringDepositProductComponent } from './edit-recurring-deposit-product.component';

describe('EditRecurringDepositProductComponent', () => {
  let component: EditRecurringDepositProductComponent;
  let fixture: ComponentFixture<EditRecurringDepositProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRecurringDepositProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRecurringDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

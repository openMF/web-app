import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCashierComponent } from './edit-cashier.component';

describe('EditCashierComponent', () => {
  let component: EditCashierComponent;
  let fixture: ComponentFixture<EditCashierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCashierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

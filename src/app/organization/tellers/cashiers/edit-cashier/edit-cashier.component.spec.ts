import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCashierComponent } from './edit-cashier.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditCashierComponent', () => {
  let component: EditCashierComponent;
  let fixture: ComponentFixture<EditCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCashierComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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

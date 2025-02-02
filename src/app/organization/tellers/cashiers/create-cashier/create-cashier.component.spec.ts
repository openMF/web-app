import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCashierComponent } from './create-cashier.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateCashierComponent', () => {
  let component: CreateCashierComponent;
  let fixture: ComponentFixture<CreateCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCashierComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

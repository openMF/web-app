import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCashierComponent } from './create-cashier.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateCashierComponent', () => {
  let component: CreateCashierComponent;
  let fixture: ComponentFixture<CreateCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCashierComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [DatePipe]
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

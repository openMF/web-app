import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargeFixedDepositsAccountComponent } from './add-charge-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('AddChargeFixedDepositsAccountComponent', () => {
  let component: AddChargeFixedDepositsAccountComponent;
  let fixture: ComponentFixture<AddChargeFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddChargeFixedDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
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

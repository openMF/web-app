import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateFixedDepositsAccountComponent } from './activate-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('ActivateFixedDepositsAccountComponent', () => {
  let component: ActivateFixedDepositsAccountComponent;
  let fixture: ComponentFixture<ActivateFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivateFixedDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

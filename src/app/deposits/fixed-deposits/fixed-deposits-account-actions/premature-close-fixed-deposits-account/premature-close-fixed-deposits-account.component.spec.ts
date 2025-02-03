import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrematureCloseFixedDepositsAccountComponent } from './premature-close-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('PrematureCloseFixedDepositsAccountComponent', () => {
  let component: PrematureCloseFixedDepositsAccountComponent;
  let fixture: ComponentFixture<PrematureCloseFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrematureCloseFixedDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrematureCloseFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemSharesComponent } from './redeem-shares.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('RedeemSharesComponent', () => {
  let component: RedeemSharesComponent;
  let fixture: ComponentFixture<RedeemSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RedeemSharesComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

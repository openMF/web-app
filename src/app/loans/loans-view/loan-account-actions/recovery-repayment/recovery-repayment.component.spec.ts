import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryRepaymentComponent } from './recovery-repayment.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecoveryRepaymentComponent', () => {
  let component: RecoveryRepaymentComponent;
  let fixture: ComponentFixture<RecoveryRepaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecoveryRepaymentComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoveryRepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

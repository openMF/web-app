import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSharesAccountComponent } from './approve-shares-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('ApproveSharesAccountComponent', () => {
  let component: ApproveSharesAccountComponent;
  let fixture: ComponentFixture<ApproveSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveSharesAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

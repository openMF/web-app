import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveLoanComponent } from './approve-loan.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('ApproveLoanComponent', () => {
  let component: ApproveLoanComponent;
  let fixture: ComponentFixture<ApproveLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveLoanComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

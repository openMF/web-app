import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectLoanComponent } from './reject-loan.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('RejectLoanComponent', () => {
  let component: RejectLoanComponent;
  let fixture: ComponentFixture<RejectLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectLoanComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

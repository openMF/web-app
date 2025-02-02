import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountActionsComponent } from './loan-account-actions.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoanAccountActionsComponent', () => {
  let component: LoanAccountActionsComponent;
  let fixture: ComponentFixture<LoanAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanAccountActionsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ action: 'Change Loan Officer' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

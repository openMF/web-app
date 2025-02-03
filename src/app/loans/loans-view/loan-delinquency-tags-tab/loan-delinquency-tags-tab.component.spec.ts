import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDelinquencyTagsTabComponent } from './loan-delinquency-tags-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoanDelinquencyTagsTabComponent', () => {
  let component: LoanDelinquencyTagsTabComponent;
  let fixture: ComponentFixture<LoanDelinquencyTagsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanDelinquencyTagsTabComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDelinquencyTagsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

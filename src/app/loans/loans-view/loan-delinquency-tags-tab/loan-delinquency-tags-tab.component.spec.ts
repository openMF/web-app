import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDelinquencyTagsTabComponent } from './loan-delinquency-tags-tab.component';

describe('LoanDelinquencyTagsTabComponent', () => {
  let component: LoanDelinquencyTagsTabComponent;
  let fixture: ComponentFixture<LoanDelinquencyTagsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanDelinquencyTagsTabComponent ]
    })
    .compileComponents();
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

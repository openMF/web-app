import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReagingComponent } from './loan-reaging.component';

describe('LoanReagingComponent', () => {
  let component: LoanReagingComponent;
  let fixture: ComponentFixture<LoanReagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReagingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

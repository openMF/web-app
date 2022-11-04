import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanLockedComponent } from './loan-locked.component';

describe('LoanLockedComponent', () => {
  let component: LoanLockedComponent;
  let fixture: ComponentFixture<LoanLockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanLockedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanLockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReamortizeComponent } from './loan-reamortize.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoanReamortizeComponent', () => {
  let component: LoanReamortizeComponent;
  let fixture: ComponentFixture<LoanReamortizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReamortizeComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReamortizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

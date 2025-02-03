import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReamortizeComponent } from './loan-reamortize.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoanReamortizeComponent', () => {
  let component: LoanReamortizeComponent;
  let fixture: ComponentFixture<LoanReamortizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReamortizeComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReamortizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

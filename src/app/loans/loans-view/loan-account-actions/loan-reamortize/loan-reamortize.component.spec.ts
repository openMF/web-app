import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReamortizeComponent } from './loan-reamortize.component';

describe('LoanReamortizeComponent', () => {
  let component: LoanReamortizeComponent;
  let fixture: ComponentFixture<LoanReamortizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReamortizeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReamortizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

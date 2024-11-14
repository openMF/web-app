import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTermVariationsTabComponent } from './loan-term-variations-tab.component';

describe('LoanTermVariationsTabComponent', () => {
  let component: LoanTermVariationsTabComponent;
  let fixture: ComponentFixture<LoanTermVariationsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanTermVariationsTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanTermVariationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

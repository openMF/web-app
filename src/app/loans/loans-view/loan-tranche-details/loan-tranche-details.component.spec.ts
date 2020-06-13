import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTrancheDetailsComponent } from './loan-tranche-details.component';

describe('LoanTrancheDetailsComponent', () => {
  let component: LoanTrancheDetailsComponent;
  let fixture: ComponentFixture<LoanTrancheDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanTrancheDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanTrancheDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

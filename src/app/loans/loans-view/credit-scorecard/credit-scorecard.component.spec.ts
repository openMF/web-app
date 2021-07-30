import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditScorecardComponent } from './credit-scorecard.component';

describe('CreditScorecardComponent', () => {
  let component: CreditScorecardComponent;
  let fixture: ComponentFixture<CreditScorecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditScorecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

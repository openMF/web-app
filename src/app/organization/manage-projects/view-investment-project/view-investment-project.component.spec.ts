import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInvestmentProjectComponent } from './view-investment-project.component';

describe('ViewInvestmentProjectComponent', () => {
  let component: ViewInvestmentProjectComponent;
  let fixture: ComponentFixture<ViewInvestmentProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewInvestmentProjectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewInvestmentProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

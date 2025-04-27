import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectGeneralTabComponent } from './investment-project-general-tab.component';

describe('InvestmentProjectGeneralTabComponent', () => {
  let component: InvestmentProjectGeneralTabComponent;
  let fixture: ComponentFixture<InvestmentProjectGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectGeneralTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

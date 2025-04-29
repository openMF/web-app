import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectImageTabComponent } from './investment-project-image-tab.component';

describe('InvestmentProjectImageTabComponent', () => {
  let component: InvestmentProjectImageTabComponent;
  let fixture: ComponentFixture<InvestmentProjectImageTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectImageTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectImageTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

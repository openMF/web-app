import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInvestmentProjectComponent } from './create-investment-project.component';

describe('CreateInvestmentProjectComponent', () => {
  let component: CreateInvestmentProjectComponent;
  let fixture: ComponentFixture<CreateInvestmentProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateInvestmentProjectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInvestmentProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

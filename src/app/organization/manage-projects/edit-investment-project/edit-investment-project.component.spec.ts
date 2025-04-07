import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInvestmentProjectComponent } from './edit-investment-project.component';

describe('EditInvestmentProjectComponent', () => {
  let component: EditInvestmentProjectComponent;
  let fixture: ComponentFixture<EditInvestmentProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInvestmentProjectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditInvestmentProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

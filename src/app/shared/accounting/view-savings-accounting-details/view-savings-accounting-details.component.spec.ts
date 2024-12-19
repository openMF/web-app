import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSavingsAccountingDetailsComponent } from './view-savings-accounting-details.component';

describe('ViewSavingsAccountingDetailsComponent', () => {
  let component: ViewSavingsAccountingDetailsComponent;
  let fixture: ComponentFixture<ViewSavingsAccountingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewSavingsAccountingDetailsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewSavingsAccountingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

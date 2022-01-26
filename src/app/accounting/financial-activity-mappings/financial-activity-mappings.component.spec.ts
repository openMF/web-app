import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FinancialActivityMappingsComponent } from './financial-activity-mappings.component';

describe('FinancialActivityMappingsComponent', () => {
  let component: FinancialActivityMappingsComponent;
  let fixture: ComponentFixture<FinancialActivityMappingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialActivityMappingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialActivityMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

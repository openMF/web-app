import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewFinancialActivityMappingComponent } from './view-financial-activity-mapping.component';

describe('ViewFinancialActivityMappingComponent', () => {
  let component: ViewFinancialActivityMappingComponent;
  let fixture: ComponentFixture<ViewFinancialActivityMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFinancialActivityMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFinancialActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

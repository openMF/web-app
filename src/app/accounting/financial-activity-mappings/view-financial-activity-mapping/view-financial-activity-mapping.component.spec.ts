import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFinancialActivityMappingComponent } from './view-financial-activity-mapping.component';
import { HttpClientModule } from '@angular/common/http';

describe('ViewFinancialActivityMappingComponent', () => {
  let component: ViewFinancialActivityMappingComponent;
  let fixture: ComponentFixture<ViewFinancialActivityMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFinancialActivityMappingComponent],
      imports: [HttpClientModule]
    }).compileComponents();
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

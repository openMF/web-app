import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialActivityMappingsComponent } from './financial-activity-mappings.component';

describe('FinancialActivityMappingsComponent', () => {
  let component: FinancialActivityMappingsComponent;
  let fixture: ComponentFixture<FinancialActivityMappingsComponent>;

  beforeEach(async(() => {
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFinancialActivityMappingComponent } from './edit-financial-activity-mapping.component';

describe('EditFinancialActivityMappingComponent', () => {
  let component: EditFinancialActivityMappingComponent;
  let fixture: ComponentFixture<EditFinancialActivityMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFinancialActivityMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFinancialActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

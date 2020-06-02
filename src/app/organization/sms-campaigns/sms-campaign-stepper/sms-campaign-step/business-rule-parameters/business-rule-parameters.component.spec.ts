import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRuleParametersComponent } from './business-rule-parameters.component';

describe('BusinessRuleParametersComponent', () => {
  let component: BusinessRuleParametersComponent;
  let fixture: ComponentFixture<BusinessRuleParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessRuleParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessRuleParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

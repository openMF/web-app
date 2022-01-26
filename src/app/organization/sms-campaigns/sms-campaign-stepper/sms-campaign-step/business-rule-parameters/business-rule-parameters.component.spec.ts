import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BusinessRuleParametersComponent } from './business-rule-parameters.component';

describe('BusinessRuleParametersComponent', () => {
  let component: BusinessRuleParametersComponent;
  let fixture: ComponentFixture<BusinessRuleParametersComponent>;

  beforeEach(waitForAsync(() => {
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

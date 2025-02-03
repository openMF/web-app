import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRuleParametersComponent } from './business-rule-parameters.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('BusinessRuleParametersComponent', () => {
  let component: BusinessRuleParametersComponent;
  let fixture: ComponentFixture<BusinessRuleParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessRuleParametersComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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

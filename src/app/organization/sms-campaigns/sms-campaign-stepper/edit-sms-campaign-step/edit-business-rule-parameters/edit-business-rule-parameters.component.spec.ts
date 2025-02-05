import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusinessRuleParametersComponent } from './edit-business-rule-parameters.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('EditBusinessRuleParametersComponent', () => {
  let component: EditBusinessRuleParametersComponent;
  let fixture: ComponentFixture<EditBusinessRuleParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditBusinessRuleParametersComponent],
      imports: [
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBusinessRuleParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

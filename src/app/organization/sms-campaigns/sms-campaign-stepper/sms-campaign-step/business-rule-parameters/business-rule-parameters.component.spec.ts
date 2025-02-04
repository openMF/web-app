import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessRuleParametersComponent } from './business-rule-parameters.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('BusinessRuleParametersComponent', () => {
  let component: BusinessRuleParametersComponent;
  let fixture: ComponentFixture<BusinessRuleParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessRuleParametersComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

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

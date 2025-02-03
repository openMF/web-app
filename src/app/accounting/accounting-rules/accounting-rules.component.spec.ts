import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingRulesComponent } from './accounting-rules.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('AccountingRulesComponent', () => {
  let component: AccountingRulesComponent;
  let fixture: ComponentFixture<AccountingRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountingRulesComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

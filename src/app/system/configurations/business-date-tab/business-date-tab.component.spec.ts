import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDateTabComponent } from './business-date-tab.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

describe('BusinessDateTabComponent', () => {
  let component: BusinessDateTabComponent;
  let fixture: ComponentFixture<BusinessDateTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusinessDateTabComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessDateTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

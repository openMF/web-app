import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundMappingComponent } from './fund-mapping.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

describe('FundMappingComponent', () => {
  let component: FundMappingComponent;
  let fixture: ComponentFixture<FundMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FundMappingComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule,
        CommonModule
      ],
      providers: [
        DatePipe,
        TranslateService,
        TranslateStore
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

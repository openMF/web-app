import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfigurationComponent } from './app-configuration.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppConfigurationComponent', () => {
  let component: AppConfigurationComponent;
  let fixture: ComponentFixture<AppConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppConfigurationComponent],
      imports: [TranslateModule],
      providers: [TranslateService],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

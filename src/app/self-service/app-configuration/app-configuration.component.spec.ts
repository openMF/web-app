import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfigurationComponent } from './app-configuration.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AppConfigurationComponent', () => {
  let component: AppConfigurationComponent;
  let fixture: ComponentFixture<AppConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppConfigurationComponent],
      imports: [TranslateModule],
      providers: [TranslateService]
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

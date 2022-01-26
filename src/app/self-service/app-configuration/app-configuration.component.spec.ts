import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppConfigurationComponent } from './app-configuration.component';

describe('AppConfigurationComponent', () => {
  let component: AppConfigurationComponent;
  let fixture: ComponentFixture<AppConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppConfigurationComponent ]
    })
    .compileComponents();
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

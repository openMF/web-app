import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SMSComponent } from './sms.component';

describe('SmsComponent', () => {
  let component: SMSComponent;
  let fixture: ComponentFixture<SMSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SMSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

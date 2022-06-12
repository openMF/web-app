import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSMSComponent } from './edit-sms.component';

describe('EditSmsComponent', () => {
  let component: EditSMSComponent;
  let fixture: ComponentFixture<EditSMSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSMSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

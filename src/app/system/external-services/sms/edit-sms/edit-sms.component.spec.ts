import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSmsComponent } from './edit-sms.component';

describe('EditSmsComponent', () => {
  let component: EditSmsComponent;
  let fixture: ComponentFixture<EditSmsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

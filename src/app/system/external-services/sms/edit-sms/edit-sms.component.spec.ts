import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSmsComponent } from './edit-sms.component';

describe('EditSmsComponent', () => {
  let component: EditSmsComponent;
  let fixture: ComponentFixture<EditSmsComponent>;

  beforeEach(async(() => {
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

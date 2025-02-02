import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSMSComponent } from './edit-sms.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditSmsComponent', () => {
  let component: EditSMSComponent;
  let fixture: ComponentFixture<EditSMSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSMSComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ]
    }).compileComponents();
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

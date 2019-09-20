import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountNumberPreferenceComponent } from './edit-account-number-preference.component';

describe('EditAccountNumberPreferenceComponent', () => {
  let component: EditAccountNumberPreferenceComponent;
  let fixture: ComponentFixture<EditAccountNumberPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccountNumberPreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccountNumberPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

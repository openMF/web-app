import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountNumberPreferenceComponent } from './create-account-number-preference.component';

describe('CreateAccountNumberPreferenceComponent', () => {
  let component: CreateAccountNumberPreferenceComponent;
  let fixture: ComponentFixture<CreateAccountNumberPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountNumberPreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountNumberPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

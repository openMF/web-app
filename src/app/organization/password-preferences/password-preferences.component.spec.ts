import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PasswordPreferencesComponent } from './password-preferences.component';

describe('PasswordPreferencesComponent', () => {
  let component: PasswordPreferencesComponent;
  let fixture: ComponentFixture<PasswordPreferencesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordPreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

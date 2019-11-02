import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNumberPreferencesComponent } from './account-number-preferences.component';

describe('AccountNumberPreferencesComponent', () => {
  let component: AccountNumberPreferencesComponent;
  let fixture: ComponentFixture<AccountNumberPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountNumberPreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNumberPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TwoFactorAuthenticationComponent } from './two-factor-authentication.component';

describe('TwoFactorAuthenticationComponent', () => {
  let component: TwoFactorAuthenticationComponent;
  let fixture: ComponentFixture<TwoFactorAuthenticationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoFactorAuthenticationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

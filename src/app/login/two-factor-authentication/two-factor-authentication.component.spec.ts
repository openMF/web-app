import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorAuthenticationComponent } from './two-factor-authentication.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('TwoFactorAuthenticationComponent', () => {
  let component: TwoFactorAuthenticationComponent;
  let fixture: ComponentFixture<TwoFactorAuthenticationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TwoFactorAuthenticationComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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

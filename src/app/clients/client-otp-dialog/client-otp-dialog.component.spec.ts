import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientOtpDialogComponent } from './client-otp-dialog.component';

describe('ClientOtpDialogComponent', () => {
  let component: ClientOtpDialogComponent;
  let fixture: ComponentFixture<ClientOtpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientOtpDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientOtpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

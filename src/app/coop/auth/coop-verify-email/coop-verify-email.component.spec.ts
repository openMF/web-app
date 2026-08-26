import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoopVerifyEmailComponent } from './coop-verify-email.component';

describe('CoopVerifyEmailComponent', () => {
  let component: CoopVerifyEmailComponent;
  let fixture: ComponentFixture<CoopVerifyEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoopVerifyEmailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CoopVerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

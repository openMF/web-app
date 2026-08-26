import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoopRegistrationComponent } from './coop-registration.component';

describe('CoopRegistrationComponent', () => {
  let component: CoopRegistrationComponent;
  let fixture: ComponentFixture<CoopRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoopRegistrationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CoopRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
